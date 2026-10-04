import React from 'react';
import { QuotationHeader } from './QuotationHeader';
import { QuotationFooter } from './QuotationFooter';
import { assets } from '../../assets/assets';

export const QuotationPreview6Pages = ({ data }) => {
    // 1. Chunk Manufacturers (First page shows exactly 10 items; any additional items move to new page)
    const FIRST_PAGE_MFG = 10;
    const NEXT_PAGE_MFG = 10;
    const manufacturerChunks = [];
    const allManufacturers = data.manufacturers || [];
    if (allManufacturers.length === 0) {
        manufacturerChunks.push([]);
    } else if (allManufacturers.length <= FIRST_PAGE_MFG) {
        manufacturerChunks.push(allManufacturers);
    } else {
        manufacturerChunks.push(allManufacturers.slice(0, FIRST_PAGE_MFG));
        for (let i = FIRST_PAGE_MFG; i < allManufacturers.length; i += NEXT_PAGE_MFG) {
            manufacturerChunks.push(allManufacturers.slice(i, i + NEXT_PAGE_MFG));
        }
    }

    // 2. Chunk Permit Fees (Max 4 on first pricing page with Roof Type table, 6 on continuation pages)
    const permitFees = data.permitFees || [];
    const permitFeeChunks = [];
    if (permitFees.length <= 4) {
        permitFeeChunks.push(permitFees);
    } else {
        permitFeeChunks.push(permitFees.slice(0, 4));
        for (let i = 4; i < permitFees.length; i += 6) {
            permitFeeChunks.push(permitFees.slice(i, i + 6));
        }
    }

    // 3. Chunk Terms & Conditions (Max 14 per page)
    const terms = data.termsAndConditions || [];
    const TERMS_PER_PAGE = 14;
    const termsChunks = [];
    if (terms.length <= TERMS_PER_PAGE) {
        termsChunks.push(terms);
    } else {
        for (let i = 0; i < terms.length; i += TERMS_PER_PAGE) {
            termsChunks.push(terms.slice(i, i + TERMS_PER_PAGE));
        }
    }

    return (
        <div className="quotation-preview-container w-full flex flex-col items-center gap-8 py-4 font-sans bg-neutral-200/60 print:bg-white print:p-0 print:gap-0" data-lenis-prevent>
            {/* ════════════════════════════════════════════════════════════
                PAGE 1: COVER PAGE
            ════════════════════════════════════════════════════════════ */}
            <div data-section="client" id="preview-page-client" className="quotation-page w-[210mm] min-h-[297mm] h-[297mm] bg-white shadow-xl print:shadow-none flex flex-col justify-between relative overflow-hidden box-border page-break-after-always">
                <QuotationHeader refNo={data.refNo} date={data.date} />

                {/* Page Content */}
                <div className="px-12 py-10 flex-1 flex flex-col items-center justify-center text-center relative z-10 gap-10">
                    {/* Background Sun Logo Watermark Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none z-0">
                        <img src={assets.logo} alt="Watermark" className="w-[420px] h-[420px] object-contain" />
                    </div>

                    {/* Main Title Banner */}
                    <div className="flex flex-col items-center gap-3 z-10 mb-4">
                        <h1 className="text-4xl font-extrabold tracking-tight text-[#0D4379] font-sans uppercase">
                            {data.systemTitle || "SOLAR POWERPLANT"}
                        </h1>
                        <div className="inline-block relative">
                            <p className="text-xl font-medium tracking-[0.2em] text-[#1D63A4] uppercase">
                                {data.systemSubtitle || "Grid Tie System"}
                            </p>
                            <span className="block w-28 h-0.5 bg-[#4084C5] mx-auto mt-2" />
                        </div>
                    </div>

                    {/* Client Name Box */}
                    <div className="quotation-cover-client-box w-full max-w-xl bg-[#F0F6FC] border border-[#CADDF2] rounded-2xl py-6 px-8 text-center z-10 flex flex-col items-center gap-2">
                        <p className="text-xs font-bold tracking-[0.25em] text-[#0D4379] uppercase">
                            CLIENT NAME
                        </p>
                        <p className="text-2xl font-extrabold text-[#154675] tracking-wide uppercase">
                            {data.clientInfo.name || "CLIENT NAME"}
                        </p>
                    </div>

                    {/* System Capacity Box */}
                    <div className="quotation-cover-capacity-box w-full max-w-xl bg-[#F0F6FC] border border-[#CADDF2] rounded-2xl py-6 px-8 text-center z-10 flex flex-col items-center gap-2">
                        <p className="text-xs font-bold tracking-[0.25em] text-[#0D4379] uppercase">
                            SYSTEM CAPACITY
                        </p>
                        <p className="text-2xl font-extrabold text-[#154675] tracking-wide uppercase">
                            {data.clientInfo.capacity || "SYSTEM CAPACITY"}
                        </p>
                    </div>
                </div>

                <QuotationFooter />
            </div>

            {/* ════════════════════════════════════════════════════════════
                PAGE 2: SOLAR GENERATION TECHNOLOGY
            ════════════════════════════════════════════════════════════ */}
            <div data-section="client" className="quotation-page w-[210mm] min-h-[297mm] h-[297mm] bg-white shadow-xl print:shadow-none flex flex-col justify-between relative overflow-hidden box-border page-break-after-always">
                <QuotationHeader />

                <div className="px-10 py-4 flex-1 flex flex-col gap-5 text-neutral-800 text-[11.5px] leading-relaxed relative z-10">
                    {/* Page Heading */}
                    <h2 className="text-xl font-extrabold text-[#0D4379] text-center tracking-wide uppercase mb-2">
                        SOLAR GENERATION TECHNOLOGY
                    </h2>

                    {/* Section 1 */}
                    <div className="flex flex-col gap-1.5">
                        <h3 className="font-bold text-xs text-[#0D4379]">
                            About Solar Generation Technology
                        </h3>
                        <p className="text-neutral-700 font-normal leading-normal text-justify">
                            There is an ideal opportunity for domestic users/SME Units/Corporate sector/Builders/Large HT users/Colleges and schools/Govt Departments to install SOLAR POWER PLANTS in their roof top, to produce captive power. The recent SOLAR POLICY announced by Central and State Govt encourages the use of solar energy to resolve the current power deficiency in the country.There is an ideal opportunity for domestic users/SME Units/Corporate sector/Builders/Large HT users/Colleges and schools/Govt Departments to install SOLAR POWER PLANTS in their roof top, to produce captive power. The recent SOLAR POLICY announced by Central and State Govt encourages the use of solar energy to resolve the current power deficiency in the country.
                        </p>
                    </div>

                    {/* Section 2 */}
                    <div className="flex flex-col gap-2.5">
                        <h3 className="font-bold text-xs text-[#0D4379]">
                            Generation of power from Solar Energy
                        </h3>

                        <p className="text-neutral-700 font-normal text-justify">
                            <strong className="text-[#0D4379]">Grid System –</strong> In this segment, you can install solar power plant on your roof, produce electricity during the day and directly utilize the same. This system is most common for applications above 10KWup to MW size. In this system, you can only use the solar power as and when it is produced but power cannot be stored.
                        </p>

                        <p className="text-neutral-700 font-normal text-justify">
                            <strong className="text-[#0D4379]">Off Grid System–</strong> In this segment, you can install solar power plant on your rooftop ,generate electricity and store it in battery banks. The system functions in the following manner
                        </p>

                        <p className="text-neutral-700 pl-3">
                            The battery is charged, priority bysolar power and if not, by EB power.
                        </p>

                        <p className="text-neutral-700 pl-3">
                            When the battery is full and if the solar power is available – then the load is connected to solar power – even when EB power is available.
                        </p>

                        <p className="text-neutral-700 pl-3">
                            When solar is not available and the battery is fully charged– the load is powered by Batteries until the battery voltage drops beyond a predetermined range beyond which EB takes over.
                        </p>

                        <p className="text-neutral-700 pl-3">
                            When both Solar and EB power is not available – the load is supplied from the battery bank. Generally these systems are highly suitable for both power cut situations and off- grid solutions and are available for capacities ranging from
                        </p>

                        <p className="text-neutral-700 font-normal text-justify">
                            <strong className="text-[#0D4379]">Bi directional Hybrid Unit–</strong> IBidirectional Hybrid Unit Load is powered by Solar and Battery. Any excess energy produced will be exported to the grid through a net meter.
                        </p>
                    </div>
                </div>

                <QuotationFooter />
            </div>

            {/* ════════════════════════════════════════════════════════════
                PAGE 3: PROPOSED MANUFACTURERS (Auto-paginated)
            ════════════════════════════════════════════════════════════ */}
            {manufacturerChunks.map((chunk, chunkIdx) => (
                <div
                    key={`mfg-page-${chunkIdx}`}
                    data-section="manufacturers"
                    id={chunkIdx === 0 ? "preview-page-manufacturers" : undefined}
                    className="quotation-page w-[210mm] min-h-[297mm] h-[297mm] bg-white shadow-xl print:shadow-none flex flex-col justify-between relative overflow-hidden box-border page-break-after-always"
                >
                    <QuotationHeader />

                    <div className="px-10 py-4 flex-1 flex flex-col relative z-10">
                        <h2 className="text-xl font-extrabold text-[#0D4379] text-center tracking-wide uppercase mb-4">
                            LIST OF PROPOSED MANUFACTURERS {manufacturerChunks.length > 1 ? `(PART ${chunkIdx + 1})` : ''}
                        </h2>

                        {/* Manufacturers Styled Table */}
                        <div className="w-full border border-[#7AAAD8] rounded-xl overflow-hidden">
                            <table className="w-full text-left border-collapse text-[11px]">
                                <thead>
                                    <tr className="bg-[#134D8B] text-white text-xs font-bold uppercase tracking-wider">
                                        <th className="py-2.5 px-3 text-center border-r border-blue-400/40 w-16 whitespace-nowrap">SL NO</th>
                                        <th className="py-2.5 px-4 border-r border-blue-400/40">ITEM</th>
                                        <th className="py-2.5 px-4 text-center border-r border-blue-400/40">MANUFACTURER</th>
                                        <th className="py-2.5 px-4 text-center w-36">COUNTRY OF ORIGIN</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#BED6EE] text-neutral-800">
                                    {chunk.map((row, idx) => {
                                        const globalIndex = chunkIdx === 0 
                                            ? idx + 1 
                                            : FIRST_PAGE_MFG + (chunkIdx - 1) * NEXT_PAGE_MFG + idx + 1;
                                        return (
                                            <tr key={row.id || globalIndex} className={idx % 2 === 0 ? "bg-white" : "bg-[#F4F9FF]"}>
                                                <td className="py-2.5 px-3 text-center font-bold text-[#0D4379] border-r border-[#BED6EE]">
                                                    {globalIndex}
                                                </td>
                                                <td className="py-2.5 px-4 font-bold text-[#144778] border-r border-[#BED6EE] leading-snug">
                                                    {row.item}
                                                </td>
                                                <td className="py-2.5 px-4 text-center font-extrabold text-[#0D4379] uppercase border-r border-[#BED6EE]">
                                                    {row.manufacturer}
                                                </td>
                                                <td className="py-2.5 px-4 text-center font-bold text-[#0D4379]">
                                                    {row.origin}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <QuotationFooter />
                </div>
            ))}

            {/* ════════════════════════════════════════════════════════════
                PAGE 4: CLIENT INFO & TECHNICAL DETAILS
            ════════════════════════════════════════════════════════════ */}
            <div data-section="technical" id="preview-page-technical" className="quotation-page w-[210mm] min-h-[297mm] h-[297mm] bg-white shadow-xl print:shadow-none flex flex-col justify-between relative overflow-hidden box-border page-break-after-always">
                <QuotationHeader />

                <div className="px-10 py-6 flex-1 flex flex-col gap-6 relative z-10">
                    {/* Section 1: Client Information */}
                    <div>
                        <h2 className="text-xl font-extrabold text-[#0D4379] text-center tracking-wide uppercase mb-3">
                            CLIENT INFORMATION
                        </h2>

                        <div className="w-full border border-[#7AAAD8] rounded-xl overflow-hidden text-xs">
                            <table className="w-full text-left border-collapse">
                                <tbody className="divide-y divide-[#BED6EE]">
                                    <tr className="bg-[#EEF6FE]">
                                        <td className="py-3 px-6 font-bold text-[#0D4379] w-1/3 border-r border-[#BED6EE]">Client</td>
                                        <td className="py-3 px-6 font-extrabold text-[#0D4379] uppercase">{data.clientInfo.name}</td>
                                    </tr>
                                    <tr className="bg-white">
                                        <td className="py-3 px-6 font-bold text-[#0D4379] border-r border-[#BED6EE]">Address</td>
                                        <td className="py-3 px-6 font-extrabold text-[#0D4379] uppercase">{data.clientInfo.address}</td>
                                    </tr>
                                    <tr className="bg-[#EEF6FE]">
                                        <td className="py-3 px-6 font-bold text-[#0D4379] border-r border-[#BED6EE]">Contact No</td>
                                        <td className="py-3 px-6 font-extrabold text-[#0D4379]">{data.clientInfo.contactNo}</td>
                                    </tr>
                                    <tr className="bg-white">
                                        <td className="py-3 px-6 font-bold text-[#0D4379] border-r border-[#BED6EE]">Capacity</td>
                                        <td className="py-3 px-6 font-extrabold text-[#0D4379]">{data.clientInfo.capacity}</td>
                                    </tr>
                                    <tr className="bg-[#EEF6FE]">
                                        <td className="py-3 px-6 font-bold text-[#0D4379] border-r border-[#BED6EE]">Type</td>
                                        <td className="py-3 px-6 font-extrabold text-[#0D4379] uppercase">{data.clientInfo.type}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section 2: Technical Specifications */}
                    <div>
                        <h2 className="text-xl font-extrabold text-[#0D4379] text-center tracking-wide uppercase mb-3">
                            TECHNICAL
                        </h2>

                        {/* Solar PV Modules Table */}
                        <div className="w-full border border-[#7AAAD8] rounded-xl overflow-hidden mb-4 text-xs">
                            <div className="bg-[#134D8B] text-white py-2.5 px-4 font-bold text-center uppercase tracking-wider break-words">
                                Solar PV Modules - {data.technicalSpecs.solarPvModules.brand}
                            </div>
                            <table className="w-full text-left border-collapse">
                                <tbody className="divide-y divide-[#BED6EE]">
                                    <tr className="bg-[#EEF6FE]">
                                        <td className="py-3 px-6 font-bold text-[#0D4379] w-1/3 border-r border-[#BED6EE]">Type / Model</td>
                                        <td className="py-3 px-6 font-extrabold text-[#0D4379] uppercase leading-tight">{data.technicalSpecs.solarPvModules.model}</td>
                                    </tr>
                                    <tr className="bg-white">
                                        <td className="py-3 px-6 font-bold text-[#0D4379] border-r border-[#BED6EE]">QTY</td>
                                        <td className="py-3 px-6 font-extrabold text-[#0D4379]">{data.technicalSpecs.solarPvModules.qty}</td>
                                    </tr>
                                    <tr className="bg-[#EEF6FE]">
                                        <td className="py-3 px-6 font-bold text-[#0D4379] border-r border-[#BED6EE]">WARRANTY</td>
                                        <td className="py-3 px-6 font-bold text-[#0D4379] leading-snug">{data.technicalSpecs.solarPvModules.warranty}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* On Grid Inverter Table */}
                        <div className="w-full border border-[#7AAAD8] rounded-xl overflow-hidden text-xs">
                            <div className="bg-[#134D8B] text-white py-2.5 px-4 font-bold text-center uppercase tracking-wider break-words">
                                ON GRID INVERTER - {data.technicalSpecs.inverter.brand}
                            </div>
                            <table className="w-full text-left border-collapse">
                                <tbody className="divide-y divide-[#BED6EE]">
                                    <tr className="bg-[#EEF6FE]">
                                        <td className="py-3 px-6 font-bold text-[#0D4379] w-1/3 border-r border-[#BED6EE]">QTY</td>
                                        <td className="py-3 px-6 font-extrabold text-[#0D4379]">{data.technicalSpecs.inverter.qty}</td>
                                    </tr>
                                    <tr className="bg-white">
                                        <td className="py-3 px-6 font-bold text-[#0D4379] border-r border-[#BED6EE]">Warranty</td>
                                        <td className="py-3 px-6 font-bold text-[#0D4379]">{data.technicalSpecs.inverter.warranty}</td>
                                    </tr>
                                    <tr className="bg-[#EEF6FE]">
                                        <td className="py-3 px-6 font-bold text-[#0D4379] border-r border-[#BED6EE]">ADDITIONAL WORK</td>
                                        <td className="py-3 px-6 font-extrabold text-[#0D4379]">{data.technicalSpecs.inverter.additionalWork}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <QuotationFooter />
            </div>

            {/* ════════════════════════════════════════════════════════════
                PAGE 5: PRICING, KSEB PERMITS & WARRANTY (Auto-paginated)
            ════════════════════════════════════════════════════════════ */}
            {permitFeeChunks.map((feeChunk, chunkIdx) => (
                <div
                    key={`permit-page-${chunkIdx}`}
                    data-section="pricing"
                    id={chunkIdx === 0 ? "preview-page-pricing" : undefined}
                    className="quotation-page w-[210mm] min-h-[297mm] h-[297mm] bg-white shadow-xl print:shadow-none flex flex-col justify-between relative overflow-hidden box-border page-break-after-always"
                >
                    <QuotationHeader />

                    <div className="px-10 py-5 flex-1 flex flex-col gap-4 relative z-10">
                        {chunkIdx === 0 && (
                            <>
                                {/* Header System Banner */}
                                <div className="bg-[#F0F4F8] border border-[#D0E2F3] rounded-2xl p-4 text-center">
                                    <h2 className="text-base font-extrabold text-[#0D4379] uppercase leading-tight break-words">
                                        {data.pricing.headerTitle}
                                    </h2>
                                </div>

                                {/* Table 1: Roof Type & Total Payable */}
                                <div className="w-full border border-[#7AAAD8] rounded-xl overflow-hidden text-xs">
                                    <table className="w-full text-center border-collapse">
                                        <thead>
                                            <tr className="bg-[#134D8B] text-white font-bold uppercase tracking-wider">
                                                <th className="py-3 px-4 w-1/2 border-r border-blue-400/40">ROOF TYPE</th>
                                                <th className="py-3 px-4 w-1/2">TOTAL PROJECT PAYABLE</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="bg-[#F4F9FF]">
                                                <td className="py-4 px-6 font-bold text-[#0D4379] border-r border-[#BED6EE]">
                                                    {data.pricing.roofTypeLabel}
                                                </td>
                                                <td className="py-4 px-6 font-extrabold text-[#0D4379]">
                                                    <span className="text-xl block">{data.pricing.totalPayable}</span>
                                                    <span className="text-xs font-semibold text-neutral-600 block mt-0.5">{data.pricing.amountInWords}</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {/* Table 2: KSEB Permits & Fees */}
                        <div className="w-full border border-[#7AAAD8] rounded-xl overflow-hidden text-xs">
                            <div className="bg-[#134D8B] text-white py-3 px-4 font-bold uppercase tracking-wider">
                                OTHER FEES PAY TO OBTAIN PERMITS FROM KSEB {permitFeeChunks.length > 1 ? `(PART ${chunkIdx + 1})` : ''}
                            </div>
                            <table className="w-full text-left border-collapse">
                                <tbody className="divide-y divide-[#BED6EE]">
                                    {feeChunk.map((feeRow, idx) => (
                                        <tr key={feeRow.id || idx} className={idx % 2 === 0 ? "bg-[#F4F9FF]" : "bg-white"}>
                                            <td className="py-3 px-6 font-bold text-[#0D4379] w-1/2 border-r border-[#BED6EE]">
                                                {feeRow.item}
                                            </td>
                                            <td className="py-3 px-6 font-extrabold text-[#0D4379] leading-snug">
                                                {feeRow.fee}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* If this is the last permit fee page, render Subsidy Note & Warranty */}
                        {chunkIdx === permitFeeChunks.length - 1 && (
                            <>
                                <p className="text-xs text-[#0D4379] font-semibold leading-relaxed">
                                    {data.subsidyNote}
                                </p>

                                <div className="pt-2">
                                    <h3 className="text-base font-extrabold text-[#0D4379] tracking-wide uppercase border-b-2 border-[#134D8B] pb-1 inline-block mb-3">
                                        WARRANTY
                                    </h3>
                                    <div className="flex flex-col gap-2 text-xs text-[#0D4379]">
                                        <p className="font-bold">{data.warranties.panel}</p>
                                        <p className="font-bold">{data.warranties.inverter}</p>
                                        <p className="font-bold">{data.warranties.isolator}</p>
                                        <p className="font-bold">{data.warranties.acdb}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <QuotationFooter />
                </div>
            ))}

            {/* ════════════════════════════════════════════════════════════
                PAGE 6: TERMS AND CONDITIONS (Auto-paginated)
            ════════════════════════════════════════════════════════════ */}
            {termsChunks.map((termsChunk, chunkIdx) => (
                <div
                    key={`terms-page-${chunkIdx}`}
                    data-section="terms"
                    id={chunkIdx === 0 ? "preview-page-terms" : undefined}
                    className={`quotation-page w-[210mm] min-h-[297mm] h-[297mm] bg-white shadow-xl print:shadow-none flex flex-col justify-between relative overflow-hidden box-border ${chunkIdx === termsChunks.length - 1 ? 'page-break-after-avoid' : 'page-break-after-always'}`}
                >
                    <QuotationHeader />

                    <div className="px-10 py-4 flex-1 flex flex-col relative z-10">
                        <h2 className="text-xl font-extrabold text-[#0D4379] text-center tracking-wide uppercase mb-4">
                            TERMS AND CONDITIONS {termsChunks.length > 1 ? `(PART ${chunkIdx + 1})` : ''}
                        </h2>

                        <div className="flex flex-col gap-2.5 text-[11px] text-neutral-800 leading-relaxed">
                            {termsChunk.map((term, idx) => (
                                <p key={idx} className="text-justify">
                                    <strong className="text-[#0D4379] font-bold">{term.label}: </strong>
                                    <span className="text-neutral-700">{term.text}</span>
                                </p>
                            ))}
                        </div>
                    </div>

                    <QuotationFooter />
                </div>
            ))}
        </div>
    );
};