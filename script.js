// api/weather.js  (Vercel serverless)
export default async function handler(req, res) {
  const { lat = 47.92, lon = 106.92 } = req.query; // Ulaanbaatar
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current_weather=true` +
    `&hourly=relative_humidity_2m,pressure_msl` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum` +
    `&forecast_days=7&timezone=auto`;
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Upstream ${r.status}`);
    const data = await r.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (e) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ ok: false, error: "Weather API failed", details: String(e) });
  }
}
