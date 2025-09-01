export default async function handler(req, res) {
  const GAS_URL = "https://script.google.com/macros/s/AKfycbwvqxdEp4sWhAACzZRlPe9LzNdNxg2lY5XvIh_uRcfWJHMTnKlFaetKAdwSPdiGzTtwDg/exec";

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const response = await fetch(`${GAS_URL}?action=availability`);
    const text = await response.text(); // ← HTMLが返ってくる可能性に備えて

    try {
      const data = JSON.parse(text); // ← 明示的にJSONとしてパース
      return res.status(200).json({ slots: data });
    } catch (parseErr) {
      console.error("JSONパース失敗:", text);
      return res.status(500).json({ message: "JSONパース失敗", raw: text });
    }
  } catch (err) {
    return res.status(502).json({ message: "GAS取得エラー", error: err.message });
  }
}