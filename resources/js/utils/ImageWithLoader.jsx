import React, { useState } from "react";

const ImageWithLoader = ({ src, alt, className }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Loader Spinner */}
            {loading && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            )}

            {/* Fallback on error */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400 text-sm">No Image</span>
                </div>
            )}

            {/* Actual Image */}
            {!error && (
                <img
                    src={src}
                    alt={alt}
                    className={`transition-opacity duration-500 ${loading ? "opacity-0" : "opacity-100"
                        }`}
                    onLoad={() => setLoading(false)}
                    onError={() => {
                        setLoading(false);
                        setError(true);
                    }}
                />
            )}
        </div>
    );
};

export default ImageWithLoader;
