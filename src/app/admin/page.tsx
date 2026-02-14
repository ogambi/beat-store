"use client";

import { FormEvent, useState } from "react";

type UploadConfig = {
  key: string;
  url: string;
  method: "PUT";
  headers: Record<string, string>;
};

export default function AdminPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const archive = formData.get("archive") as File | null;

    if (!archive) {
      setMessage("Missing archive file.");
      setLoading(false);
      return;
    }

    const adminToken = String(formData.get("adminToken") ?? "").trim();
    if (!adminToken) {
      setMessage("Missing admin token.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          title: formData.get("title"),
          slug: formData.get("slug"),
          bpm: Number(formData.get("bpm")),
          key: formData.get("key"),
          genre: formData.get("genre"),
          mood: formData.get("mood"),
          priceCents: Math.round(Number(formData.get("priceUsd")) * 100),
          previewUrl: formData.get("previewUrl"),
          archiveFileName: archive.name,
          archiveFileType: archive.type || "application/octet-stream",
          archiveFileSize: archive.size
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Could not create upload URL");
      }

      const data = (await res.json()) as { upload: UploadConfig };

      const uploadRes = await fetch(data.upload.url, {
        method: data.upload.method,
        headers: data.upload.headers,
        body: archive
      });

      if (!uploadRes.ok) {
        throw new Error("Archive upload failed.");
      }

      setMessage("Beat published successfully.");
      form.reset();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container page-pad">
      <div className="panel">
        <h1>Admin Beat Uploader</h1>
        <p className="tiny">Add beat metadata and upload your ZIP/WAV/MP3 archive in one flow.</p>

        <form onSubmit={handleSubmit} className="stack">
          <input className="input" name="adminToken" placeholder="Admin Token" required />
          <input className="input" name="title" placeholder="Beat Title" required />
          <input className="input" name="slug" placeholder="beat-slug" required />
          <input className="input" name="bpm" type="number" placeholder="BPM" required />
          <input className="input" name="key" placeholder="Key (e.g. F# Minor)" required />
          <input className="input" name="genre" placeholder="Genre" required />
          <input className="input" name="mood" placeholder="Mood" required />
          <input className="input" name="priceUsd" type="number" step="0.01" placeholder="Price USD" required />
          <input className="input" name="previewUrl" placeholder="Preview MP3 URL" required />
          <input className="input" name="archive" type="file" required />

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Publish Beat"}
          </button>
        </form>

        {message ? <p className="tiny">{message}</p> : null}
      </div>
    </main>
  );
}
