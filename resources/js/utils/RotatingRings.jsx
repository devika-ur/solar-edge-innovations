
import React from 'react';
import '../index.css'; 

const RotatingRings = () => {
    const size = 250; 
    const strokeWidth = 12; 
    const radiusOuter = (size / 2) - (strokeWidth / 2) - 10;
    const radiusInner = radiusOuter - 50; 
    const center = size / 2;


    // (x, y, radius, startAngle, endAngle)
    const describeArc = (x, y, radius, startAngle, endAngle) => {
        const start = polarToCartesian(x, y, radius, endAngle);
        const end = polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

        return [
            'M', start.x, start.y,
            'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(' ');
    };

    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    };

    return (
        <div className="flex justify-center items-center h-screen bg-white overflow-hidden">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Outer Grey Circle Segments - Rotating Clockwise */}
                <g className="animate-clockwise">
                    <path
                        d={describeArc(center, center, radiusOuter, 0, 90)}
                        fill="none"
                        stroke="#D1D5DB" // Tailwind gray-300
                        strokeWidth={strokeWidth}
                    />
                    <path
                        d={describeArc(center, center, radiusOuter, 120, 210)}
                        fill="none"
                        stroke="#D1D5DB"
                        strokeWidth={strokeWidth}
                    />
                    <path
                        d={describeArc(center, center, radiusOuter, 240, 330)}
                        fill="none"
                        stroke="#D1D5DB"
                        strokeWidth={strokeWidth}
                    />
                </g>

                {/* Inner Grey/Yellow Circle Segments - Rotating Counter-Clockwise */}
                <g className="animate-counter-clockwise">
                    <path
                        d={describeArc(center, center, radiusInner, 10, 80)}
                        fill="none"
                        stroke="#264D32" 
                        strokeWidth={strokeWidth}
                    />
                    <path
                        d={describeArc(center, center, radiusInner, 100, 170)}
                        fill="none"
                        stroke="#D1D5DB"
                        strokeWidth={strokeWidth}
                    />
                    <path
                        d={describeArc(center, center, radiusInner, 190, 260)}
                        fill="none"
                        stroke="#264D32"
                        strokeWidth={strokeWidth}
                    />
                    <path
                        d={describeArc(center, center, radiusInner, 280, 350)}
                        fill="none"
                        stroke="#D1D5DB"
                        strokeWidth={strokeWidth}
                    />
                </g>
            </svg>
        </div>
    );
};

export default RotatingRings;