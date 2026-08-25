"use client";

import { useState } from "react";
import { Download, Link2, Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

interface PickerItem {
  url: string;
  type?: string;
}

interface ApiResponse {
  downloadUrl?: string;
  picker?: PickerItem[];
  error?: string;
}

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract video.");
      }

      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6 md:p-24 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="z-10 w-full max-w-3xl flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-medium text-blue-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> High-Speed Universal Downloader
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Download Media in Highest Quality
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto">
            Paste link from YouTube, Instagram, ShareChat, or video platforms to save full resolution video and audio.
          </p>
        </div>

        {/* Input Form */}
        <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 md:p-6 rounded-2xl shadow-2xl space-y-4">
          <form onSubmit={handleDownload} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Link2 className="w-5 h-5" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste video or media URL here..."
                required
                className="w-full pl-10 pr-4 py-3.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm md:text-base"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" /> Fetch Link
                </>
              )}
            </button>
          </form>

          {/* Supported Platforms */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
            <span className="px-2.5 py-1 bg-slate-800/50 rounded-md border border-slate-700/50">YouTube</span>
            <span className="px-2.5 py-1 bg-slate-800/50 rounded-md border border-slate-700/50">Instagram</span>
            <span className="px-2.5 py-1 bg-slate-800/50 rounded-md border border-slate-700/50">ShareChat</span>
            <span className="px-2.5 py-1 bg-slate-800/50 rounded-md border border-slate-700/50">TikTok</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="w-full mt-6 p-4 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Download Result View */}
        {result && (
          <div className="w-full mt-6 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" /> Media extracted successfully!
            </div>
            
            {result.downloadUrl && (
              <a
                href={result.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="w-full md:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" /> Download Highest Quality File
              </a>
            )}

            {result.picker && result.picker.length > 0 && (
              <div className="w-full space-y-3">
                <p className="text-sm text-slate-400 text-center">Multiple items found:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.picker.map((item, idx) => (
                    <a
                      key={item.url || idx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs flex items-center justify-between text-slate-200"
                    >
                      <span>Item #{idx + 1} ({item.type || "Media"})</span>
                      <Download className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="z-10 text-xs text-slate-500 text-center py-4">
        Designed for speed & quality. Respect copyright policies when downloading public media.
      </footer>
    </main>
  );
}