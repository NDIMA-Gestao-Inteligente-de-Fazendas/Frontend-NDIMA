import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, X, Volume2, Loader2, Radio } from 'lucide-react';
import { getToken } from '../utils/auth';

/* ─── Types ─────────────────────────────────────────────────────────────── */

type AgentStatus = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error';

interface ServerMessage {
    type: string;
    text?: string;
    message?: string;
    [key: string]: unknown;
}

/* ─── Gapless PCM16 playback @ 24kHz ─────────────────────────────────────
   Uses a "schedule queue" — each chunk is placed exactly where the previous
   one ended, so there are no gaps or glitches even with high chunk rates.   */

const PLAYBACK_SAMPLE_RATE = 24000;

function playPcm16Chunk(arrayBuffer: ArrayBuffer, ctx: AudioContext, nextPlayTimeRef: React.MutableRefObject<number>) {
    // 1. Int16 samples → Float32 (-1.0 … +1.0)
    const int16 = new Int16Array(arrayBuffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;

    // 2. Create AudioBuffer
    const buffer = ctx.createBuffer(1, float32.length, PLAYBACK_SAMPLE_RATE);
    buffer.copyToChannel(float32, 0);

    // 3. Schedule immediately after previous chunk (gapless queue)
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const now = ctx.currentTime;
    const startAt = Math.max(now, nextPlayTimeRef.current);
    source.start(startAt);
    nextPlayTimeRef.current = startAt + buffer.duration;
}

/* ─── Status config ──────────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; pulse: boolean }> = {
    idle: { label: 'Pronto', color: '#9CA3AF', pulse: false },
    connecting: { label: 'A conectar…', color: '#F59E0B', pulse: true },
    listening: { label: 'A ouvir…', color: '#10B981', pulse: true },
    thinking: { label: 'A processar…', color: '#6366F1', pulse: true },
    speaking: { label: 'A responder…', color: '#3B82F6', pulse: true },
    error: { label: 'Erro de ligação', color: '#EF4444', pulse: false },
};

const STATUS_HINT: Record<AgentStatus, string> = {
    idle: 'Clique no microfone para falar com o seu assistente agrícola.',
    connecting: 'A estabelecer ligação segura…',
    listening: 'Pode falar. O agente analisa dados da sua fazenda em tempo real.',
    thinking: 'O agente está a processar a sua pergunta…',
    speaking: 'O agente está a responder…',
    error: 'Ocorreu um erro. Clique para tentar novamente.',
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function NdimaAgent() {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<AgentStatus>('idle');
    const [muted, setMuted] = useState(false);
    const [log, setLog] = useState<string[]>([]);

    const wsRef = useRef<WebSocket | null>(null);
    const mediaRef = useRef<MediaStream | null>(null);
    const workletRef = useRef<AudioWorkletNode | null>(null);
    // AudioContext for PLAYBACK uses 24kHz; mic context uses 16kHz
    const playCtxRef = useRef<AudioContext | null>(null);
    const micCtxRef = useRef<AudioContext | null>(null);
    const nextPlayTimeRef = useRef<number>(0);   // gapless scheduling cursor

    const addLog = (msg: string) =>
        setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 30));

    /* ── Connect ── */
    const connect = useCallback(async () => {
        if (wsRef.current) return;
        setStatus('connecting');
        addLog('A conectar ao NDIMA Agent…');

        try {
            /* Mic stream @ 16kHz mono */
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true },
            });
            mediaRef.current = stream;

            /* Separate AudioContexts for mic (16kHz) and playback (24kHz) */
            const micCtx = new AudioContext({ sampleRate: 16000 });
            const playCtx = new AudioContext({ sampleRate: PLAYBACK_SAMPLE_RATE });
            micCtxRef.current = micCtx;
            playCtxRef.current = playCtx;
            nextPlayTimeRef.current = 0;

            /* WebSocket */
            const token = getToken() ?? '';
            const wsUrl = `${import.meta.env.VITE_AGENT_WS_URL ?? 'ws://localhost:3001'}?token=${token}`;
            const ws = new WebSocket(wsUrl);
            ws.binaryType = 'arraybuffer'; // REQUIRED — without this data arrives as Blob
            wsRef.current = ws;

            ws.onopen = async () => {
                setStatus('listening');
                addLog('Ligação estabelecida. Fale agora.');

                /* AudioWorklet — mic → PCM16 → ws (dedicated audio thread) */
                await micCtx.audioWorklet.addModule('/pcm16-processor.js');
                const worklet = new AudioWorkletNode(micCtx, 'pcm16-processor');
                workletRef.current = worklet;

                worklet.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
                    if (ws.readyState === WebSocket.OPEN && !muted) ws.send(e.data);
                };

                micCtx.createMediaStreamSource(stream).connect(worklet);
            };

            ws.onmessage = (event) => {
                /* ── Binary: PCM16 audio frame from TTS ── */
                if (event.data instanceof ArrayBuffer) {
                    // Don't call setStatus here — avoids re-render for every audio frame
                    if (playCtxRef.current) {
                        playPcm16Chunk(event.data, playCtxRef.current, nextPlayTimeRef);
                    }
                    return;
                }

                /* ── JSON control messages ── */
                try {
                    const msg: ServerMessage = JSON.parse(event.data as string);
                    addLog(`[${msg.type}]${msg.text ? ' ' + msg.text : ''}`);
                    switch (msg.type) {
                        case 'AgentStartedSpeaking': setStatus('speaking'); break;
                        case 'AgentThinking': setStatus('thinking'); break;
                        case 'Welcome':
                        case 'SettingsApplied':
                        case 'ConversationText': setStatus('listening'); break;
                        case 'Error':
                            setStatus('error');
                            addLog(`Erro: ${msg.message ?? ''}`);
                            break;
                    }
                } catch { addLog(event.data as string); }
            };

            ws.onerror = () => { setStatus('error'); addLog('Erro WebSocket.'); };
            ws.onclose = () => { setStatus('idle'); addLog('Ligação encerrada.'); };

        } catch (err) {
            setStatus('error');
            addLog(`Erro: ${err instanceof Error ? err.message : String(err)}`);
        }
    }, [muted]);

    /* ── Disconnect ── */
    const disconnect = useCallback(() => {
        wsRef.current?.close(); wsRef.current = null;
        workletRef.current?.disconnect(); workletRef.current = null;
        mediaRef.current?.getTracks().forEach(t => t.stop()); mediaRef.current = null;
        micCtxRef.current?.close(); micCtxRef.current = null;
        playCtxRef.current?.close(); playCtxRef.current = null;
        nextPlayTimeRef.current = 0;
        setStatus('idle');
        addLog('Sessão encerrada.');
    }, []);

    const handleClose = () => { disconnect(); setOpen(false); setLog([]); };

    useEffect(() => () => { disconnect(); }, [disconnect]);

    const cfg = STATUS_CONFIG[status];
    const isConnected = status !== 'idle' && status !== 'error';

    return (
        <>
            {/* Trigger button */}
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm shadow-lg
                    hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 select-none"
                style={{ background: 'linear-gradient(135deg, #1A4D2E 0%, #2d6a47 100%)', color: '#F7C04A' }}
            >
                <Radio size={18} className="animate-pulse" />
                NDIMA Agent
            </button>

            {/* ── Modal — fixed dimensions so nothing shifts during streaming ── */}
            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
                >
                    {/* Fixed width + height prevents any layout shift */}
                    <div
                        className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                        style={{ maxWidth: 420, height: 560 }}
                    >
                        {/* Header — fixed */}
                        <div
                            className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-[#F3F4F6]"
                            style={{ background: 'linear-gradient(135deg, #1A4D2E 0%, #0d2a18 100%)' }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: 'rgba(247,192,74,0.15)' }}>
                                    <Radio size={20} style={{ color: '#F7C04A' }} />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-white font-['Outfit']">NDIMA Agent</p>
                                    <p className="text-xs text-white/50">Assistente agrícola de voz</p>
                                </div>
                            </div>
                            <button onClick={handleClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/60 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Visualizer — fixed height, won't grow/shrink */}
                        <div
                            className="flex-shrink-0 flex flex-col items-center justify-center gap-5 bg-[#F9FAFB]"
                            style={{ height: 260 }}
                        >
                            {/* Orb */}
                            <div className="relative flex items-center justify-center" style={{ width: 128, height: 128 }}>
                                {isConnected && (
                                    <>
                                        <div
                                            className="absolute w-32 h-32 rounded-full opacity-20 animate-ping"
                                            style={{ background: cfg.color }}
                                        />
                                        <div
                                            className="absolute w-24 h-24 rounded-full opacity-30 animate-ping"
                                            style={{ background: cfg.color, animationDelay: '0.2s' }}
                                        />
                                    </>
                                )}
                                <button
                                    onClick={isConnected ? disconnect : connect}
                                    className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg z-10
                                        hover:scale-105 active:scale-95 transition-all duration-200 border-4 border-white"
                                    style={{ background: cfg.color }}
                                >
                                    {status === 'connecting'
                                        ? <Loader2 size={28} className="text-white animate-spin" />
                                        : status === 'speaking'
                                            ? <Volume2 size={28} className="text-white" />
                                            : <Mic size={28} className="text-white" />}
                                </button>
                            </div>

                            {/* Status — fixed height line so it never causes reflow */}
                            <div className="flex items-center gap-2" style={{ height: 22 }}>
                                <div
                                    className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.pulse ? 'animate-pulse' : ''}`}
                                    style={{ background: cfg.color }}
                                />
                                <span className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                            </div>

                            {/* Hint — fixed height line */}
                            <p
                                className="text-xs text-center text-[#9CA3AF] leading-relaxed px-8"
                                style={{ height: 32 }}
                            >
                                {STATUS_HINT[status]}
                            </p>

                            {/* Mute toggle — always rendered but invisible when not listening */}
                            <div style={{ height: 34 }} className="flex items-center justify-center">
                                {isConnected && status === 'listening' ? (
                                    <button
                                        onClick={() => setMuted(m => !m)}
                                        className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all
                                            ${muted
                                                ? 'bg-red-50 border-red-200 text-red-600'
                                                : 'bg-white border-[#E5E7EB] text-[#374151] hover:border-[#1A4D2E]'}`}
                                    >
                                        {muted ? <MicOff size={13} /> : <Mic size={13} />}
                                        {muted ? 'Silenciado (reativar)' : 'Silenciar microfone'}
                                    </button>
                                ) : <span />}
                            </div>
                        </div>

                        {/* Event log — fixed height, scrolls internally */}
                        <div
                            className="flex-1 border-t border-[#F3F4F6] px-4 py-3 overflow-y-auto flex flex-col-reverse gap-0.5"
                            style={{ minHeight: 0 }}
                        >
                            {log.length === 0
                                ? <p className="text-[11px] text-[#D1D5DB] font-mono text-center mt-2">Sem eventos ainda</p>
                                : log.map((entry, i) => (
                                    <p key={i} className="text-[11px] text-[#9CA3AF] font-mono leading-relaxed">{entry}</p>
                                ))}
                        </div>

                        {/* Actions — fixed */}
                        <div className="flex-shrink-0 px-6 py-4 border-t border-[#F3F4F6] flex gap-3">
                            {isConnected
                                ? <button onClick={disconnect}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                                    Encerrar sessão
                                </button>
                                : <button onClick={connect}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#123520] transition-all hover:-translate-y-0.5 hover:shadow-md"
                                    style={{ background: '#F7C04A' }}>
                                    Iniciar conversa
                                </button>}
                            <button onClick={handleClose}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors">
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
