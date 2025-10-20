"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [urls, setUrls] = useState<Record<string, string | null | { format: string; url: string }[]>>({});
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return alert("Choose a file first!");
    setUploading(true);

    try {
      // Step 1: Get presigned URL
      const res = await fetch("/api/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });

      if (!res.ok) throw new Error("Failed to get presigned URL");

      const presigned = await res.json();

      // Step 2: Upload directly to S3
      const formData = new FormData();
      Object.entries(presigned.fields).forEach(([k, v]) => formData.append(k, v as string));
      formData.append("file", file);

      console.log("Uploading to:", presigned.url);
      console.log("Form data keys:", Array.from(formData.keys()));

      const uploadRes = await fetch(presigned.url, {
        method: "POST",
        body: formData,
        mode: 'no-cors' as RequestMode,
        headers: {}
      });

      console.log("Upload response status:", uploadRes.status);
      console.log("Upload response statusText:", uploadRes.statusText);

      if (!uploadRes.ok && uploadRes.type !== 'opaque') {
        const errorText = await uploadRes.text();
        throw new Error(`S3 upload failed: ${errorText}`);
      }

      // Set original image immediately
      setOriginalUrl(URL.createObjectURL(file));

      alert("Uploaded! Please wait ~10 seconds for processing...");

      // Step 3: Poll for processed images
      pollForImages(file.name);
    } catch (err) {
      console.error(err);
      alert(`Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`);
      setUploading(false);
    }
  };

  const pollForImages = async (filename: string, retries = 15, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(`/api/list?key=${filename}`);
        const data = await res.json();

        // Check if any optimized images are available (arrays with content) or original is available
        const hasOptimized = Object.entries(data).some(([key, value]) =>
          key !== 'original' && Array.isArray(value) && value.length > 0
        );
        const hasOriginal = data.original && typeof data.original === 'string';

        if (hasOptimized || hasOriginal) {
          setUrls(data);
          setUploading(false);
          return;
        }
      } catch (err) {
        console.error("Polling error:", err);
      }

      await new Promise((r) => setTimeout(r, delay));
    }

    alert("Processing took too long. Try again in a few seconds.");
    setUploading(false);
  };

  return (
   <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-100 to-gray-200">
  <h1 className="text-4xl font-bold mb-8 text-blue-700 text-center drop-shadow-md">
    AWS Image Optimization Pipeline
  </h1>

  <div className="w-full max-w-xl flex flex-col items-center space-y-4">
    <input
      type="file"
      accept="image/*"
      onChange={(e) => setFile(e.target.files?.[0] || null)}
      className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
                 file:rounded-full file:border-0 file:text-sm file:font-semibold
                 file:bg-blue-600 file:text-white hover:file:bg-blue-700
                 shadow-md cursor-pointer p-3 rounded-2xl bg-white"
    />

    <button
      onClick={handleUpload}
      disabled={!file || uploading}
      className={`w-full py-3 px-6 text-white font-semibold rounded-xl transition-all
                  ${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-lg"}`}
    >
      {uploading ? "Processing..." : "Upload & Optimize"}
    </button>
  </div>

  {/* Original Image */}
  {originalUrl && (
    <div className="mt-12 flex flex-col items-center space-y-4">
      <h2 className="text-2xl font-semibold text-gray-700">Original Image</h2>
      <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center transition-transform hover:scale-105">
        <img src={originalUrl} alt="Original" className="rounded-lg shadow-md w-80 object-contain" />
        <a
          href={originalUrl}
          download={file?.name}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md"
        >
          Download Original
        </a>
      </div>
    </div>
  )}

  {/* Optimized Images */}
  {Object.keys(urls).length > 0 && (
    <div className="mt-12 flex flex-col items-center space-y-8 w-full max-w-5xl">
      <h2 className="text-2xl font-semibold text-gray-700">Optimized Images</h2>
      <div className="flex flex-col md:flex-row md:justify-center md:space-x-6 space-y-6 md:space-y-0">
        {Object.entries(urls).map(([size, formats]) =>
          Array.isArray(formats) && formats.length > 0 ? (
            <div key={size} className="flex flex-col items-center space-y-4">
              <p className="font-medium text-lg text-gray-600">{size}</p>
              {formats.map((format: { format: string; url: string }) => (
                <div
                  key={format.format}
                  className="bg-white rounded-2xl p-4 shadow-lg flex flex-col items-center transition-transform hover:scale-105"
                >
                  <img
                    src={format.url}
                    alt={`${size} ${format.format}`}
                    className="rounded-lg shadow-md w-72 object-contain"
                  />
                  <a
                    href={format.url}
                    download={`${file?.name?.split(".")[0]}_${size}.${format.format}`}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download {size} ({format.format.toUpperCase()})
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p key={size}>{size}: Not available yet</p>
          )
        )}
      </div>
    </div>
  )}
</main>

  );
}
