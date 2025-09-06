import { useState } from "react";

export default function Home() {
  const [urls, setUrls] = useState("");
  const [downloads, setDownloads] = useState([]);
  const [running, setRunning] = useState(false);

  const handleBatchDownload = async () => {
    const list = urls.split("\n").map(u => u.trim()).filter(Boolean);
    if (!list.length) return;

    const tasks = list.map((url, i) => ({
      id: i, url, status: "Queued", filename: null
    }));
    setDownloads(tasks);
    setRunning(true);

    for (let i = 0; i < list.length; i++) {
      const url = list[i];
      setDownloads(d => d.map(x => x.id === i ? { ...x, status: "Downloading..." } : x));

      try {
        const response = await fetch(`/api/download?url=${encodeURIComponent(url)}`);
        if (!response.ok) throw new Error("Failed");

        const blob = await response.blob();
        const filename =
          response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") ||
          url.split("/").pop() || `file-${i+1}`;

        // trigger download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);

        setDownloads(d => d.map(x => x.id === i ? { ...x, status: "✅ Done", filename } : x));
      } catch (err) {
        setDownloads(d => d.map(x => x.id === i ? { ...x, status: "❌ Failed", error: err.message } : x));
      }
    }

    setRunning(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">⚡ Premium Proxy Downloader</h1>
      <textarea
        rows={6}
        placeholder="Paste one or more URLs (each on new line)"
        className="w-full max-w-2xl p-3 rounded-xl text-black mb-4 outline-none"
        value={urls}
        onChange={e => setUrls(e.target.value)}
      />
      <button
        onClick={handleBatchDownload}
        disabled={running}
        className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 transition disabled:bg-gray-600"
      >
        {running ? "⏳ Downloading..." : "🚀 Start Batch Download"}
      </button>

      <div className="w-full max-w-2xl mt-6 space-y-2">
        {downloads.map(d => (
          <div key={d.id} className="p-3 bg-gray-800 rounded-xl flex justify-between items-center">
            <span className="truncate max-w-xs">{d.url}</span>
            <span className={d.status.includes("✅") ? "text-green-400" : d.status.includes("❌") ? "text-red-400" : "text-yellow-400"}>
              {d.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
