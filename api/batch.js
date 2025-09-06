import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";

export default async function handler(req, res) {
  try {
    const { urls } = req.query;
    if (!urls) return res.status(400).json({ error: "❌ Missing ?urls=" });

    const list = urls.split(",").map(u => u.trim()).filter(Boolean);

    // Proxy
    const proxy = "http://ih937PBpb:3zqX2AHn6@212.192.198.35:63472";
    const agent = new HttpsProxyAgent(proxy);

    let results = [];
    for (let url of list) {
      try {
        const response = await fetch(url, { agent });
        if (!response.ok) {
          results.push({ url, status: "❌ Failed", code: response.status });
          continue;
        }
        let filename = url.split("/").pop() || "file";
        results.push({ url, status: "✅ Ready", filename });
      } catch (err) {
        results.push({ url, status: "❌ Error", error: err.message });
      }
    }

    res.status(200).json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
