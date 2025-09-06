import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "❌ Missing ?url=" });

    // Proxy
    const proxy = "http://ih937PBpb:3zqX2AHn6@212.192.198.35:63472";
    const agent = new HttpsProxyAgent(proxy);

    const response = await fetch(url, { agent });

    if (!response.ok) return res.status(response.status).json({ error: "Failed to fetch file" });

    // Filename detection
    let filename = "downloaded.file";
    const cd = response.headers.get("content-disposition");
    if (cd && cd.includes("filename=")) {
      filename = cd.split("filename=")[1].replace(/"/g, "");
    } else {
      filename = url.split("/").pop() || filename;
    }

    res.setHeader("Content-Type", response.headers.get("content-type") || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    response.body.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
                  }
