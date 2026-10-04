import React, { useState } from "react";
import { FaFilePdf } from "react-icons/fa6";


export default function PdfDownload({ files = [] }) {
    const [previewUrl, setPreviewUrl] = useState(null);

    // Detect mobile browser
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);


    // sequentially download files by clicking anchors (simple client approach)
    const handleDownloadAll = async () => {
        for (const file of files) {
            // small delay ensures browser registers sequential clicks & avoids blocking
            downloadFile(file.path, file.title);
            await new Promise((r) => setTimeout(r, 350));
        }
    };

    const downloadFile = (url, filename) => {
        const a = document.createElement("a");
        a.href = url;
        // set download to suggest a filename
        a.download = filename ? filename.replace(/\s+/g, "_") + ".pdf" : "";
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    const copyLink = async (url) => {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(window.location.origin + url);
            // small visual feedback could be added
            alert("Link copied to clipboard");
        } else {
            // fallback
            const dummy = document.createElement("input");
            document.body.appendChild(dummy);
            dummy.value = window.location.origin + url;
            dummy.select();
            document.execCommand("copy");
            dummy.remove();
            alert("Link copied to clipboard");
        }
    };

    return (
        <section className="w-full px-4 sm:px-8 md:px-16 lg:px-20 my-4 lg:my-10">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Download PDFs</h3>
                <div className="flex gap-2">
                    <button
                        onClick={handleDownloadAll}
                        className="px-3 py-2 bg-green-600 text-white rounded-md text-sm shadow hover:bg-green-700 transition"
                        aria-label="Download all PDFs"
                    >
                        Download All
                    </button>
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {files.map((f) => (
                    <article
                        key={f.id}
                        className="flex flex-col bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                    >
                        <div className="flex items-center gap-4 p-4">
                            {/* thumbnail */}
                            <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center bg-green-50 rounded-md">
                                {/* simple pdf icon */}
                                <div className="w-16 h-20 flex-shrink-0 flex items-center justify-center bg-green-50 rounded-md">
                                    <FaFilePdf className="w-9 h-9 text-green-600" />
                                </div>


                            </div>

                            <div className="flex-1">
                                <h4 className="text-xl font-medium text-gray-900">{f.title}</h4>
                                <p className="text-sm  text-gray-500 mt-1">PDF Document</p>
                                <div className="mt-3 flex items-center gap-2">
                                    <a
                                        href={f.path}
                                        download
                                        onClick={(e) => {
                                            /* allow normal download; prevents navigation */
                                        }}
                                        className="inline-flex items-center gap-2 px-3 py-2 cursor-pointer bg-gray-100 rounded-md text-xs text-gray-800 hover:bg-gray-200"
                                    >
                                        Download
                                    </a>

                                    <button
                                        onClick={() => setPreviewUrl(f.path)}
                                        className="inline-flex items-center gap-2 px-3 py-2 cursor-pointer border border-gray-200 rounded-md text-xs text-gray-700 hover:bg-gray-50"
                                    >
                                        Preview
                                    </button>

                                    <button
                                        onClick={() => copyLink(f.path)}
                                        className="inline-flex items-center gap-2 px-2 py-2 cursor-pointer text-xs text-gray-600 hover:text-gray-800"
                                        aria-label={`Copy link for ${f.title}`}
                                    >
                                        Copy link
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {/* Preview modal */}
            {previewUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="flex items-center justify-between p-3 border-b">
                            <div className="text-sm font-medium">Preview PDF</div>
                            <button
                                onClick={() => setPreviewUrl(null)}
                                className="text-sm px-3 py-1 rounded hover:bg-gray-100"
                                aria-label="Close preview"
                            >
                                Close
                            </button>
                        </div>
                        <iframe
                            src={
                                isMobile
                                    ? `https://docs.google.com/gview?embedded=true&url=${window.location.origin}${previewUrl}`
                                    : previewUrl
                            }
                            title="pdf-preview"
                            className="w-full h-full"
                            frameBorder="0"
                        />

                    </div>
                </div>
            )}
        </section>
    );
}
