import React from 'react';
import headerImg from '../../assets/header.jpeg';

export const QuotationHeader = ({ refNo, date }) => {
    return (
        <div className="w-full relative z-10 font-sans">
            {/* High-Resolution Letterhead Header Banner */}
            <img
                src={headerImg}
                alt="Solaredge Innovations Header"
                className="w-full h-auto object-contain block select-none pointer-events-none"
            />

            {/* Reference No & Date Line (Shown on Cover Page) */}
            {refNo && date && (
                <div className="px-6 py-1.5 bg-[#EEF6FE] border-b border-[#B1D8F8] flex items-center justify-between text-xs font-semibold text-[#0D4379]">
                    <span>Qt; Reference No:- {refNo}</span>
                    <span>Date : {date}</span>
                </div>
            )}
        </div>
    );
};
