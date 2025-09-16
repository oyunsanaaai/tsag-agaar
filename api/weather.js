// api/weather.js
export default async function handler(req, res) {
  // CORS (+preflight)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { lat = "47.92", lon = "106.92" } = req.query;

  const wUrl =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${encodeURIComponent(lat)}` +
    `&longitude=${encodeURIComponent(lon)}` +
    "&current_weather=true" +
    "&hourly=relative_humidity_2m,pressure_msl" +
    "&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum" +
    "&forecast_days=7&timezone=auto";

  const aqiUrl =
    "https://air-quality-api.open-meteo.com/v1/air-quality" +
    `?latitude=${encodeURIComponent(lat)}` +
    `&longitude=${encodeURIComponent(lon)}` +
    "&hourly=pm2_5,pm10,us_aqi&timezone=auto";

  try {
    const [wRes, aqiRes] = await Promise.all([fetch(wUrl), fetch(aqiUrl)]);
    if (!wRes.ok) throw new Error(`Weather upstream ${wRes.status}`);
    if (!aqiRes.ok) throw new Error(`AQI upstream ${aqiRes.status}`);

    const weather = await wRes.json();
    const air = await aqiRes.json();

    const i = air.hourly.us_aqi.length - 1;
    const usAQI = air.hourly.us_aqi[i];
    const pm25 = air.hourly.pm2_5[i];
    const pm10 = air.hourly.pm10[i];

    const category =
      usAQI <= 50 ? "Good" :
      usAQI <= 100 ? "Moderate" :
      usAQI <= 150 ? "Unhealthy for SG" :
      usAQI <= 200 ? "Unhealthy" :
      usAQI <= 300 ? "Very Unhealthy" : "Hazardous";

    const advice =
      usAQI <= 50 ? "Агаарт алхахад тохиромжтой." :
      usAQI <= 100 ? "Мэдрэмтгий хүмүүс болгоомжлоорой." :
      usAQI <= 150 ? "Мэдрэмтгий бүлэг гадаа удахгүй." :
      usAQI <= 200 ? "Гадаа үйл ажиллагаагаа багасга." :
      usAQI <= 300 ? "Гадуур хязгаарла, маск зүү." :
      "Гадуур боломжтой бол гарахгүй байх.";

    res.status(200).json({
      ok: true,
      weather,
      aqi: { value: usAQI, pm25, pm10, category, advice }
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
}
