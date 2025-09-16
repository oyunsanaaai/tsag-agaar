// api/weather.js
export default async function handler(req, res) {
  // CORS (incl. preflight)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { lat = "47.92", lon = "106.92" } = req.query;

  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${encodeURIComponent(lat)}` +
    `&longitude=${encodeURIComponent(lon)}` +
    "&current_weather=true" +
    "&hourly=relative_humidity_2m,pressure_msl" +
    "&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum" +
    "&forecast_days=7&timezone=auto";

  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Upstream ${r.status}`);
    const data = await r.json();
    res.status(200).json({ ok: true, data });
  } catch (e) {
    res.status(500).json({ ok: false, error: "Weather API failed", details: String(e) });
  }
}
