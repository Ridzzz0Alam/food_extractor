'use client';

import { useState } from 'react';

export default function PdfExtractorPage() {
  const [pdfText, setPdfText] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await fetch('/api/extract', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setPdfText(data.text || data.error);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">PDF Extractor</h1>

      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="file"
          name="file"
          accept="application/pdf"
          required
          className="border p-2 w-full"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Extracting...' : 'Extract Text'}
        </button>
      </form>

      {pdfText && (
        <div className="mt-6 bg-gray-100 p-4 rounded max-h-[400px] overflow-y-scroll">
          <h2 className="font-semibold mb-2">Extracted Text:</h2>
          <pre className="whitespace-pre-wrap">{pdfText}</pre>
        </div>
      )}
    </div>
  );
}
