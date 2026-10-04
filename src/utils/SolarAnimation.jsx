import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SolarAnimation = () => {
    const [isPlaying, setIsPlaying] = useState(true);

    // Create multiple sun rays
    const sunRays = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        delay: i * 0.3,
        startX: 200 + (i - 4) * 15,
        startY: 80,
        endX: 320 + (i - 4) * 20,
        endY: 200
    }));

    // Create energy pulses from panel to battery
    const energyPulses = Array.from({ length: 4 }, (_, i) => ({
        id: i,
        delay: 2 + i * 0.4
    }));

    const toggleAnimation = () => {
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="w-full mt-10 px-4 sm:px-8 md:px-16 lg:px-20">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-main-heading font-playfair font-bold text-gray-800 mb-2">Solar Energy Generation</h2>
                <p className="text-gray-600">Watch sunlight transform into stored electricity</p>
            </div>

            {/* Main Animation Container */}
            <div className="relative w-full min-h-[20vh] overflow-hidden">
                <svg
                    viewBox="0 0 600 300"
                    className="w-full h-full"
                   
                >
                    {/* Background gradient */}
                    <defs>
                        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#cfecf7" />
                            <stop offset="100%" stopColor="#f4fbfd" />
                        </linearGradient>

                        <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFD700" />
                            <stop offset="100%" stopColor="#FFA500" />
                        </linearGradient>

                        <linearGradient id="panelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#1E3A8A" />
                            <stop offset="100%" stopColor="#1E40AF" />
                        </linearGradient>

                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Sky background */}
                    <rect width="600" height="300" fill="url(#skyGradient)" />

                    {/* Animated Sun */}
                    <motion.g
                        animate={isPlaying ? {
                            rotate: 360,
                        } : {}}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{ transformOrigin: "200px 60px" }}
                    >
                        <circle
                            cx="200"
                            cy="60"
                            r="50"
                            fill="url(#sunGradient)"
                            filter="url(#glow)"
                        />
                    </motion.g>

                    {/* Animated Sun Rays traveling to panel */}
                    <AnimatePresence>
                        {isPlaying && sunRays.map((ray) => (
                            <motion.line
                                key={`ray-${ray.id}`}
                                x1={ray.startX}
                                y1={ray.startY}
                                x2={ray.endX}
                                y2={ray.endY}
                                stroke="#FFFF00"
                                strokeWidth="3"
                                strokeLinecap="round"
                                filter="url(#glow)"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{
                                    pathLength: 1,
                                    opacity: [0, 1, 1, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    delay: ray.delay,
                                    repeat: Infinity,
                                    repeatDelay: 1,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                    </AnimatePresence>

                    {/* Solar Panel */}
                    <g transform="translate(300, 180) rotate(15)">
                        {/* Panel base */}
                        <rect
                            width="120"
                            height="80"
                            fill="url(#panelGradient)"
                            rx="4"
                            stroke="#0F172A"
                            strokeWidth="2"
                        />

                        {/* Panel grid cells */}
                        {Array.from({ length: 4 }, (_, row) =>
                            Array.from({ length: 6 }, (_, col) => (
                                <motion.rect
                                    key={`cell-${row}-${col}`}
                                    x={col * 18 + 6}
                                    y={row * 18 + 6}
                                    width="16"
                                    height="16"
                                    fill="#1E40AF"
                                    stroke="#0F172A"
                                    strokeWidth="0.5"
                                    animate={isPlaying ? {
                                        fill: ["#1E40AF", "#3B82F6", "#60A5FA", "#1E40AF"]
                                    } : {}}
                                    transition={{
                                        duration: 2,
                                        delay: 2 + (row + col) * 0.1,
                                        repeat: Infinity,
                                        repeatDelay: 2
                                    }}
                                />
                            ))
                        )}
                    </g>

                    {/* Energy flow lines from panel to battery */}
                    <AnimatePresence>
                        {
                            isPlaying && energyPulses.map((pulse) => (
                                <motion.path
                                    key={`pulse-${pulse.id}`}
                                    d="M 380 220 Q 420 240 460 220"
                                    fill="none"
                                    stroke="#00BFFF"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    filter="url(#glow)"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{
                                        pathLength: 1,
                                        opacity: [0, 1, 1, 0],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        delay: pulse.delay,
                                        repeat: Infinity,
                                        repeatDelay: 2,
                                        ease: "easeInOut"
                                    }}
                                />
                            ))
                        }
                    </AnimatePresence>

                    {/* Battery Icon */}
                    <g transform="translate(460, 200)">
                        {/* Battery outline */}
                        <rect
                            width="40"
                            height="24"
                            fill="none"
                            stroke="#374151"
                            strokeWidth="2"
                            rx="2"
                        />
                        {/* Battery tip */}
                        <rect
                            x="40"
                            y="8"
                            width="4"
                            height="8"
                            fill="#374151"
                            rx="1"
                        />
                        {/* Battery charge level */}
                        <motion.rect
                            x="2"
                            y="2"
                            width="36"
                            height="20"
                            fill="#10B981"
                            rx="1"
                            initial={{ scaleX: 0 }}
                            animate={isPlaying ? { scaleX: [0, 1, 1, 0] } : { scaleX: 0 }}
                            transition={{
                                duration: 4,
                                delay: 3,
                                repeat: Infinity,
                                repeatDelay: 2,
                                ease: "easeInOut"
                            }}
                            style={{ transformOrigin: "left center" }}
                        />
                        {/* Battery charge indicators */}
                        {Array.from({ length: 3 }, (_, i) => (
                            <motion.rect
                                key={`charge-${i}`}
                                x={6 + i * 10}
                                y="6"
                                width="6"
                                height="12"
                                fill="#059669"
                                rx="1"
                                initial={{ opacity: 0 }}
                                animate={isPlaying ? {
                                    opacity: [0, 0, 1, 1, 0],
                                } : { opacity: 0 }}
                                transition={{
                                    duration: 4,
                                    delay: 3 + i * 0.3,
                                    repeat: Infinity,
                                    repeatDelay: 2
                                }}
                            />
                        ))}
                    </g>

                    {/* Labels */}
                    <text x="120" y="120" textAnchor="middle" className="text-sm font-semibold fill-gray-700">
                        Sun
                    </text>
                    <text x="240" y="280" textAnchor="middle" className="text-sm font-semibold fill-gray-700">
                        Solar Panel
                    </text>
                    <text x="480" y="250" textAnchor="middle" className="text-sm font-semibold fill-gray-700">
                        Battery
                    </text>
                </svg>
            </div>

            {/* Process Steps */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 px-7 lg:px-20">
                <div className="text-center p-4 bg-yellow-100 rounded-lg">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-yellow-800 font-bold">1</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">Sunlight Absorption</h3>
                    <p className="text-sm text-gray-600">Solar panels capture photons from sunlight</p>
                </div>

                <div className="text-center p-4 bg-blue-100 rounded-lg">
                    <div className="w-12 h-12 bg-blue-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-blue-800 font-bold">2</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">Energy Conversion</h3>
                    <p className="text-sm text-gray-600">Photovoltaic cells convert light to electricity</p>
                </div>

                <div className="text-center p-4 bg-green-100 rounded-lg">
                    <div className="w-12 h-12 bg-green-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-green-800 font-bold ">3</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">Energy Storage</h3>
                    <p className="text-sm text-gray-600">Electricity is stored in batteries for later use</p>
                </div>
            </div>
        </div>
    );
};

export default SolarAnimation;