import { useState, useEffect } from 'react';
import axios from 'axios';

// Province → WeatherAPI-friendly city mapping for Angola
const PROVINCE_TO_CITY: Record<string, string> = {
    'Luanda': 'Luanda',
    'Benguela': 'Benguela',
    'Huíla': 'Lubango',
    'Huambo': 'Huambo',
    'Bié': 'Kuito',
    'Malanje': 'Malanje',
    'Uíge': 'Uige',
    'Cabinda': 'Cabinda',
    'Zaire': 'Mbanza Congo',
    'Cuanza Norte': 'Ndalatando',
    'Cuanza Sul': 'Sumbe',
    'Lunda Norte': 'Dundo',
    'Lunda Sul': 'Saurimo',
    'Moxico': 'Luena',
    'Cuando Cubango': 'Menongue',
    'Cunene': 'Ondjiva',
    'Namibe': 'Lubango',
    'Bengo': 'Caxito',
};

const getWeatherIcon = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('sol') || t.includes('limpo') || t.includes('clear') || t.includes('sunny')) return '☀️';
    if (t.includes('parcialmente') || t.includes('partly')) return '⛅';
    if (t.includes('nublado') || t.includes('nuvens') || t.includes('cloud') || t.includes('overcast')) return '☁️';
    if (t.includes('trovoada') || t.includes('thunder')) return '⛈️';
    if (t.includes('chuva') || t.includes('rain')) return '🌧️';
    if (t.includes('garoa') || t.includes('drizzle')) return '🌦️';
    if (t.includes('neve') || t.includes('snow')) return '❄️';
    if (t.includes('nevoeiro') || t.includes('fog') || t.includes('mist')) return '🌫️';
    return '🌤️';
};

const getAirQuality = (idx: number) =>
    ({ 1: 'Excelente', 2: 'Boa', 3: 'Moderada', 4: 'Ruim', 5: 'Muito Ruim', 6: 'Perigosa' }[idx] ?? 'N/A');

const DAY_PT: Record<number, string> = { 0: 'DOM', 1: 'SEG', 2: 'TER', 3: 'QUA', 4: 'QUI', 5: 'SEX', 6: 'SAB' };

interface Props { province?: string; }

export default function WeatherCard({ province }: Props) {
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const fetch = async () => {
            const key = import.meta.env.VITE_WEATHER_API_KEY;
            const city = (province && PROVINCE_TO_CITY[province]) || 'Luanda';
            if (!key) { setError('API key em falta'); setLoading(false); return; }
            try {
                const { data } = await axios.get(
                    `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${encodeURIComponent(city)},AO&days=5&aqi=yes&lang=pt`
                );
                setWeather(data);
                setError(null);
            } catch (e: any) {
                setError(e.response?.status === 401 ? 'Chave da API inválida' : 'Não foi possível carregar o clima');
            } finally { setLoading(false); }
        };
        fetch();
        const interval = setInterval(fetch, 600_000);
        return () => clearInterval(interval);
    }, [province]);

    const forecast = weather?.forecast?.forecastday?.slice(1, 5) ?? [];
    const current = weather?.current;
    const today = weather?.forecast?.forecastday?.[0]?.day;

    const timeStr = time.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    const dateStr = `${DAY_PT[time.getDay()]} ${String(time.getDate()).padStart(2, '0')}/${String(time.getMonth() + 1).padStart(2, '0')}`;

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', borderRadius: 24,
            overflow: 'hidden', height: '100%', minHeight: 340,
            boxShadow: 'rgba(0,0,0,0.18) 2px 4px 16px', position: 'relative',
        }}>
            {/* Error banner */}
            {error && (
                <div style={{
                    background: 'rgba(255,193,7,0.95)', color: '#856404', padding: '6px 16px',
                    fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                    justifyContent: 'center', zIndex: 10
                }}>
                    ⚠️ {error}
                </div>
            )}

            {loading ? (
                <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg,#1A4D2E,#0d2a18)', color: 'white', fontSize: 14
                }}>
                    <span>A carregar clima...</span>
                </div>
            ) : (
                <>
                    {/* Main info – green gradient for NDIMA */}
                    <div style={{
                        flex: 1, position: 'relative', display: 'flex',
                        alignItems: 'center', justifyContent: 'space-between',
                        background: 'linear-gradient(135deg,#1A4D2E 0%,#2d7a4a 50%,#0d2a18 100%)',
                        overflow: 'hidden', padding: '20px 24px', color: 'white'
                    }}>

                        {/* Decorative circles / sun */}
                        <div style={{
                            position: 'absolute', top: '-60%', right: '-20%', width: 380, height: 380,
                            borderRadius: '50%', background: 'radial-gradient(circle,#F7C04A 0%,#f59e0b 40%,transparent 70%)',
                            opacity: 0.25, animation: 'wPulse 4s ease-in-out infinite'
                        }} />
                        <div style={{
                            position: 'absolute', top: '-30%', right: '-5%', width: 250, height: 250,
                            borderRadius: '50%', background: 'radial-gradient(circle,#F7C04A 0%,#f59e0b 40%,transparent 70%)',
                            opacity: 0.35, animation: 'wPulse 4s ease-in-out infinite 1s'
                        }} />
                        <div style={{
                            position: 'absolute', top: '5%', right: '12%', width: 130, height: 130,
                            borderRadius: '50%', background: 'radial-gradient(circle,#F7C04A,#fbbf24,transparent)',
                            opacity: 0.6, boxShadow: '0 0 40px rgba(247,192,74,0.5)',
                            animation: 'wPulse 4s ease-in-out infinite 2s'
                        }} />

                        <style>{`@keyframes wPulse{0%,100%{transform:scale(1);opacity:.35}50%{transform:scale(1.05);opacity:.55}}`}</style>

                        {/* Left */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 500 }}>
                                <span style={{ fontSize: 22 }}>{current ? getWeatherIcon(current.condition.text) : '☀️'}</span>
                                <span>{current?.condition?.text ?? 'Ensolarado'}</span>
                            </div>
                            <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.1 }}>
                                {current ? Math.round(current.temp_c) : '--'}°
                            </div>
                            <div style={{ fontSize: 12, opacity: 0.88 }}>
                                {today ? `Máx: ${Math.round(today.maxtemp_c)}° · Mín: ${Math.round(today.mintemp_c)}°` : 'Máx: --° · Mín: --°'}
                            </div>
                            <div style={{ fontSize: 12, opacity: 0.82 }}>💧 Humidade: {current?.humidity ?? '--'}%</div>
                            <div style={{ fontSize: 12, opacity: 0.82 }}>💨 Vento: {current ? Math.round(current.wind_kph) : '--'} km/h</div>
                        </div>

                        {/* Right */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, zIndex: 1 }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{timeStr}</div>
                                <div style={{ fontSize: 12, opacity: 0.88, marginTop: 2 }}>{dateStr}</div>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 600, textAlign: 'right' }}>
                                {weather ? `${weather.location.name}, AO` : 'Luanda, AO'}
                            </div>
                            <div style={{ fontSize: 11, opacity: 0.8, textAlign: 'right' }}>
                                🍃 Ar: {current?.air_quality ? getAirQuality(current.air_quality['us-epa-index']) : 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* Forecast row */}
                    <div style={{ display: 'flex', background: '#155d36' }}>
                        {(forecast.length ? forecast : [{}, {}, {}, {}]).map((day: any, i: number) => (
                            <div key={i} style={{
                                flex: 1, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', padding: '10px 4px',
                                gap: 4, cursor: 'default',
                                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                            }}>
                                <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.65)', letterSpacing: 1 }}>
                                    {day.date ? DAY_PT[new Date(day.date).getDay()] : '---'}
                                </span>
                                <span style={{ fontSize: 20 }}>
                                    {day.day?.condition ? getWeatherIcon(day.day.condition.text) : '·'}
                                </span>
                                <span style={{ fontSize: 11, color: 'white', fontWeight: 600 }}>
                                    {day.day ? `${Math.round(day.day.maxtemp_c)}°` : '--'}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
