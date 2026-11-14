import React from 'react';
import headerImg from '../../assets/header.jpeg';
import footerImg from '../../assets/footer.jpeg';
import paleBlueSolarEcoEmblem from '../../assets/Pale Blue Solar Eco Emblem.png';

export const DEFAULT_PAYMENT_TERMS = `• Milestone 1: 20% Advance upon signing agreement & completion of site feasibility survey.
• Milestone 2: 60% upon delivery of Solar PV Panels, Inverter & mounting structure at site.
• Milestone 3: 20% upon completion of installation, testing, DISCOM inspection & net-meter grid synchronization.`;

export const AgreementPageContent = ({
    pageIdx = 0,
    fields = {},
    baseFontSize = 14,
    isPrintable = false,
}) => {
    const pageNumber = pageIdx + 1;

    return (
        <div
            id={isPrintable ? `agreement-sheet-${pageIdx}` : undefined}
            className={`letterhead-printable-sheet ${
                isPrintable ? 'agreement-printable-sheet' : ''
            } w-[210mm] min-h-[297mm] h-[297mm] bg-white shadow-2xl print:shadow-none flex flex-col justify-start relative overflow-hidden box-border font-sans select-none`}
        >
            {/* 1. Official Letterhead Top Header Banner - Fixed at top */}
            <div className="w-full relative z-10 shrink-0 select-none pointer-events-none">
                <img
                    src={headerImg}
                    alt="Solaredge Innovations Letterhead Header"
                    className="w-full h-auto object-contain block select-none pointer-events-none"
                />
            </div>

            {/* 2. Soft Background Watermark - Fixed in center */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none select-none z-0">
                <img
                    src={paleBlueSolarEcoEmblem}
                    alt="Solar Edge Watermark"
                    className="w-[460px] h-[460px] object-contain"
                />
            </div>

            {/* 3. Official Letterhead Bottom Footer Banner - FIXED AT BOTTOM */}
            <div className="w-full absolute bottom-0 left-0 right-0 z-10 select-none pointer-events-none">
                <img
                    src={footerImg}
                    alt="Solaredge Innovations Letterhead Footer"
                    className="w-full h-auto object-contain block"
                />
            </div>

            {/* 4. Page Number - Fixed above bottom footer banner on the right */}
            <div className="absolute bottom-3 right-8 z-30 flex items-center justify-end text-[12px] font-semibold text-neutral-700 select-none pointer-events-none font-sans">
                <span>{pageNumber}</span>
            </div>

            {/* 5. Document Content Area - Overlays on top of fixed letterhead logo elements */}
            <div className="px-14 pt-3 pb-24 relative z-20 text-neutral-900 select-text">
                <div
                    className="w-full font-sans text-left text-neutral-900 space-y-2.5"
                    style={{
                        fontSize: `${baseFontSize}px`,
                        lineHeight: '1.7',
                    }}
                >
                    {/* ============================================================== */}
                    {/* PAGE 1: Annexure 2 + Parties & Recitals */}
                    {/* ============================================================== */}
                    {pageIdx === 0 && (
                        <>
                            {/* Annexure 2 (Centered) */}
                            <div className="text-center font-bold text-[15px] text-neutral-950">
                                Annexure 2
                            </div>

                            {/* Main Heading (Centered) */}
                            <div className="text-center font-bold text-[13.5px] leading-snug px-3 text-neutral-950">
                                Model Draft Agreement between Consumer & Vendor for installation of grid connected rooftop solar (RTS) project under PM – Surya Ghar: Muft Bijli Yojana
                            </div>

                            {/* Execution Clause (Left-aligned) */}
                            <div className="text-left font-normal text-neutral-900">
                                This agreement is executed on {fields.executionDay ? <strong className="font-semibold text-neutral-950">{fields.executionDay}</strong> : '-------'} (Day) {fields.executionMonth ? <strong className="font-semibold text-neutral-950">{fields.executionMonth}</strong> : '------'} (Month) {fields.executionYear ? <strong className="font-semibold text-neutral-950">{fields.executionYear}</strong> : '------'} (Year) for design, supply, installation, commissioning and 5-year comprehensive maintenance of RTS project/system along with warranty under PM Surya Ghar: Muft Bijli Yojana
                            </div>

                            {/* Between (Centered) */}
                            <div className="text-center font-bold text-[13px] text-neutral-950 py-0.5">
                                Between
                            </div>

                            {/* Consumer Details (Left-aligned) */}
                            <div className="text-left font-normal text-neutral-900">
                                <span className={fields.consumerName ? "font-semibold text-neutral-950" : "underline decoration-dotted underline-offset-4 font-semibold text-neutral-950"}>
                                    {fields.consumerName || '.......................................................'}
                                </span> (Name of Consumer) having address at{' '}
                                <span className={fields.consumerAddress ? "font-semibold text-neutral-950" : "underline decoration-dotted underline-offset-4 font-semibold text-neutral-950"}>
                                    {fields.consumerAddress || '.................................................................................................................................................'}
                                </span> (hereinafter referred to as first Party i.e. /consumer/consumer/purchaser /owner of system).
                            </div>

                            {/* And (Centered) */}
                            <div className="text-center font-bold text-[13px] text-neutral-950 py-0.5">
                                And
                            </div>

                            {/* Vendor Details (Left-aligned) */}
                            <div className="text-left font-normal text-neutral-900">
                                <span className="uppercase font-semibold text-neutral-950">{fields.secondPartyName || 'SOLAREDGE INNOVATIONS'}</span> having registered office at{' '}
                                <span className="font-semibold text-neutral-950">{fields.secondPartyAddress || '476/5, AYIROOR VARKALA ROAD, ELAKAMON, VARKALA 695310'}.</span> (here in after referred to as second Party i.e. Vendor/ contractor/ System Integrator).
                            </div>

                            {/* Whereas (Centered) */}
                            <div className="text-center font-bold text-[13px] text-neutral-950 py-0.5">
                                Whereas
                            </div>

                            {/* Recital 1 (Left-aligned) */}
                            <div className="text-left font-normal text-neutral-900">
                                First Party wishes to install a Grid Connected Rooftop Solar Plant on the rooftop of the residential building of the Consumer under PM Surya Ghar: Muft Bijli Yojana.
                            </div>

                            {/* And whereas (Left-aligned) */}
                            <div className="text-left font-bold text-neutral-950">
                                And whereas
                            </div>

                            {/* Recital 2 (Left-aligned) */}
                            <div className="text-left font-normal text-neutral-900">
                                Second Party has verified availability of appropriate roof and found it feasible to install a Grid Connected Roof Top Solar plant and that the second party is willing to design, supply, install, test, commission and carry out Operation & Maintenance of the Rooftop Solar plant for 5year period on this day, the First Party and Second Party agree to the following:
                            </div>

                            {/* Undertaking Heading (Left-aligned) */}
                            <div className="text-left font-bold underline text-neutral-950 pt-0.5">
                                The First Party hereby undertakes to perform the following activities:
                            </div>

                            {/* Point 1 Initial (Left-aligned) */}
                            <div className="text-left font-normal text-neutral-900">
                                Submission of online application at National Portal for installation of RTS project/system, Submission of application for net-metering and system inspection and upload of the relevant documents on the National Portal of the scheme.
                            </div>
                        </>
                    )}

                    {/* ============================================================== */}
                    {/* PAGE 2: Undertakings Points 1 to 4 */}
                    {/* ============================================================== */}
                    {pageIdx === 1 && (
                        <>
                            {/* First Party Points Continued (Left-aligned) */}
                            <div className="text-left font-normal text-neutral-900">
                                1. Provide electricity during plant installation and water for cleaning of the panels.
                            </div>
                            <div className="text-left font-normal text-neutral-900">
                                2. Report any malfunctioning of the plant to the Vendor during the warranty period
                            </div>
                            <div className="text-left font-normal text-neutral-900">
                                3. Pay the amount as per the payment schedule as mutually agreed with the vendor,including any additional amount to the second party for any additional work
                            </div>
                            <div className="text-left font-normal text-neutral-900">
                                4. /customization required depending upon the building condition .
                            </div>

                            {/* Second Party Undertaking Heading (Left-aligned) */}
                            <div className="text-left font-bold underline text-neutral-950 pt-1.5">
                                The Second Party hereby undertakes to perform the following activities:
                            </div>

                            {/* Second Party Points 1 to 4 (Left-aligned) */}
                            <div className="text-left font-normal text-neutral-900">
                                1. The Vendor must follow all the standards and safety guidelines prescribed under state regulations and technical standards prescribed by MNRE for RTS projects, failing which the vendor is liable for blacklisting from participation in the govt. project/ scheme and other penal actions in accordance with the law. The responsibility of supply, installation and commissioning of the rooftop solar project/system in complete compliance with MNRE scheme guidelines lies with the Vendor.
                            </div>

                            <div className="text-left font-normal text-neutral-900">
                                2. Site Survey: Site visit, survey and development of detailed project report for installation of RTS system. This also includes, feasibility study of roof, strength of roof and shadow free area. If any additional work or customization is involved for the plant installation asper site condition and requirement of the consumer building, the Vendor shall prepare an estimate and can raise separate invoice including GST in addition to the amount towards standard plant cost. The consumer shall pay the amount for such additional work directly to the Vendor.
                            </div>

                            <div className="text-left font-normal text-neutral-900">
                                3. Design & Engineering: Design of plant along with drawings and selection of components as per standard provided by the DISCOM/SERC/MNRE for best performance and safety of the plant.
                            </div>

                            <div className="text-left font-normal text-neutral-900">
                                4. Module and Inverter: The solar modules, including the solar cells, should be manufactured in India. Both the solar modules and inverters shall conform to the relevant standards and specifications prescribed by MNRE. Any other requirement, viz. star labelling (solar modules), quality control orders and standards & labelling (inverters)etc., shall also be complied.
                            </div>
                        </>
                    )}

                    {/* ============================================================== */}
                    {/* PAGE 3: Second Party Points 5 to 13 */}
                    {/* ============================================================== */}
                    {pageIdx === 2 && (
                        <>
                            <div className="text-left font-normal text-neutral-900">
                                5. Procurement & Supply: Procurement of complete system as per BIS/IS/IEC standard (whatever applicable) & safety guidelines for installation of rooftop solar plants. The supplied materials should comply with all MNRE standards for release of subsidy.
                            </div>

                            <div className="text-left font-normal text-neutral-900">
                                6. Installation & Civil work: Complete civil work, structure work and electrical work (including drawings) following all the safety and relevant BIS standards.
                            </div>

                            <div className="text-left font-normal text-neutral-900">
                                7. Documentation (Technical Catalogues/Warranty Certificates/BIS certificates/other test reports etc ): All such documents shall be provided to the consumer for online uploading and submission of technical specifications,
                            </div>

                            <div className="text-left font-normal text-neutral-900">
                                8. IEC/BIS report, Sr. Nos, Warranty card of Solar Panel & Inverter, Layout & Electrical SLD, Structure Design and Drawing, Cable and other detailed documents.
                            </div>

                            <div className="text-left font-normal text-neutral-900">
                                9. Project completion report (PCR): Assisting the consumer in filling and uploading of signed documents (Consumer & Vendor) on the national portal.
                            </div>

                            <div className="text-left font-normal text-neutral-900">
                                10. Warranty: System warranty certificates should be provided to the consumer. The complete system should be warranted for 5 years from the date of commissioning by DISCOM. Individual component warranty documents provided by the manufacturer shall be provided to the consumer and all possible assistance should be extended to the consumer for claiming the warranty from the manufacturer.
                            </div>

                            <div className="text-left font-normal text-neutral-900">
                                11. NET meter & Grid Connectivity: Net meter supply/procurement, testing and approvals shall be in the scope of vendor. Grid connection of the plant shall be in the scope of the vendor.
                            </div>

                            <div className="text-left font-normal text-neutral-900">
                                12. Testing and Commissioning: The vendor shall be present at the time of testing and commissioning by the DISCOM.
                            </div>

                            <div className="text-left font-normal text-neutral-900">
                                13. Operation & Maintenance: Five (5) years Comprehensive Operation and Maintenance including overhauling, wear and tear and regular checking of healthiness of system at proper interval shall be in the scope of vendor. The vendor shall also educate the consumer on best practices for cleaning of the modules and system maintenance, Insurance: Any insurance cost pertaining to material transfer/storage before commissioning of the system shall be in the scope of the vendor.
                            </div>
                        </>
                    )}

                    {/* ============================================================== */}
                    {/* PAGE 4: Second Party Points 14 to 18 */}
                    {/* ============================================================== */}
                    {pageIdx === 3 && (
                        <>
                            <div className="text-left font-normal text-neutral-900">
                                14. Applicable Standard: The system must meet the technical standards and specifications notified by MNRE. The vendor is solely responsible to supply component and service which meets the technical standards and specification prescribed by MNRE and State DISCOMs.
                            </div>

                            <div className="text-left font-normal text-neutral-900">
                                15. Project/system cost & payment terms: The cost of the plant and payment schedule should be mutually discussed and decided between the vendor and consumer. The consumer may opt for milestone-based payment to the vendor and the same shall be included in the agreement.
                            </div>

                            <div className="text-left font-normal text-neutral-900">
                                16. Dispute: In-case of any dispute between consumer and vendor (in supply/installation/maintenance of system or payment terms), both parties must settle the same mutually or as per law. MNRE/DISCOM shall not be liable for, and would not be a party to any dispute arising between vendor and consumer.
                            </div>

                            <div className="text-left font-normal text-neutral-900">
                                17. Subsidy / Project Related Documents: Vendor must provide all the documents toconsumer and help in uploading the same to National Portal for smooth release of subsidy.
                            </div>

                            <div className="text-left font-normal text-neutral-900">
                                18. Performance of Plant: The Performance Ratio (PR) of Plant must be 75% at the time of commissioning of the project by DISCOM or its authorised agency. Vendor must provide(returnable basis) radiation sensor with valid calibration certificate of any NABL / International laboratory at the time of commissioning / testing of the plant. Vendor mustmaintain the PR of the plant till warranty of project i.e. 5 years from the date of commissioning.
                            </div>
                        </>
                    )}

                    {/* ============================================================== */}
                    {/* PAGE 5: Payment Terms & Signatures */}
                    {/* ============================================================== */}
                    {pageIdx === 4 && (
                        <>
                            {/* Clause 19: Mutually Agreed Terms of Payment (Left-aligned) */}
                            <div className="pt-1">
                                <div className="text-left font-bold text-[15px] text-neutral-950 mb-1.5">
                                    19. Mutually Agreed Terms of Payment …
                                </div>
                                <div className="text-left font-normal text-neutral-800 whitespace-pre-line pl-3 leading-[1.7]">
                                    {fields.paymentTerms || DEFAULT_PAYMENT_TERMS}
                                </div>
                            </div>

                            {/* Signatures Block (2 Columns) */}
                            <div className="pt-6 pb-2">
                                <div className="grid grid-cols-2 gap-8 text-[13.5px]">
                                    {/* First Party Column */}
                                    <div className="space-y-2.5">
                                        <div className="font-bold text-neutral-950 text-[14px]">First Party</div>
                                        <div className="min-h-[46px] leading-tight text-neutral-900">
                                            <span>Name: </span>
                                            <span className="font-semibold text-neutral-950">{fields.firstPartySignName || fields.consumerName || '…………………………………'}</span>
                                        </div>
                                        <div className="pt-4 font-normal text-neutral-900">
                                            <span>Sign: _________________________</span>
                                        </div>
                                        <div className="font-normal text-neutral-900">
                                            <span>Date: </span>
                                            <span className="font-semibold text-neutral-950">{fields.firstPartySignDate || '…………………………'}</span>
                                        </div>
                                    </div>

                                    {/* Second Party Column */}
                                    <div className="space-y-2.5">
                                        <div className="font-bold text-neutral-950 text-[14px]">Second Party</div>
                                        <div className="min-h-[46px] leading-tight text-neutral-900">
                                            <div className="font-bold text-neutral-950">{fields.secondPartySignName || fields.secondPartyName || 'SOLAREDGE INNOVATIONS'}</div>
                                            <div className="text-[12px] font-normal leading-snug text-neutral-600 mt-0.5">
                                                {fields.secondPartyAddress || '476/5, AYIROOR VARKALA ROAD, ELAKAMON, VARKALA 695310'}
                                            </div>
                                        </div>
                                        <div className="pt-4 font-normal text-neutral-900">
                                            <span>Sign: _________________________</span>
                                        </div>
                                        <div className="font-normal text-neutral-900">
                                            <span>Date: </span>
                                            <span className="font-semibold text-neutral-950">{fields.secondPartySignDate || '…………………………'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div className="pt-4 text-[12px] font-normal italic text-neutral-600 text-left leading-normal border-t border-neutral-300">
                                Disclaimer: This agreement is between vendor and consumer and any dispute related to the sameshall not involve any third party including MNRE and Distribution Utilities.
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
