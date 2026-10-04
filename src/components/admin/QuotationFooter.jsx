import React from 'react';
import footerImg from '../../assets/footer.jpeg';

export const QuotationFooter = () => {
    return (
        <div className="w-full shrink-0 relative pointer-events-none select-none mt-auto">
            {/* High-Resolution Letterhead Footer Banner */}
            <img
                src={footerImg}
                alt="Solaredge Innovations Footer"
                className="w-full h-auto object-contain block"
            />
        </div>
    );
};
