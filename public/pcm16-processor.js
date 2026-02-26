/**
 * AudioWorklet processor — runs in a dedicated audio thread.
 * Converts 32-bit float samples to PCM16 and posts them to the main thread.
 * Served from /public so it can be loaded via AudioContext.addModule().
 */
class Pcm16Processor extends AudioWorkletProcessor {
    process(inputs) {
        const input = inputs[0];
        if (!input || !input[0]) return true;

        const float32 = input[0];
        const buf = new ArrayBuffer(float32.length * 2);
        const view = new DataView(buf);

        for (let i = 0; i < float32.length; i++) {
            const s = Math.max(-1, Math.min(1, float32[i]));
            view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        }

        this.port.postMessage(buf, [buf]);
        return true;
    }
}

registerProcessor('pcm16-processor', Pcm16Processor);
