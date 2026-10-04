export const defaultQuotationData = {
    // Reference & Header Info
    refNo: "DCR:09-26-13",
    date: "06/09/2026",
    systemTitle: "SOLAR POWERPLANT",
    systemSubtitle: "Grid Tie System",

    // Client Information
    clientInfo: {
        name: "SUNIL",
        address: "ELAKAMON",
        contactNo: "7306251522",
        capacity: "3Kw",
        type: "ON GRID"
    },

    // Proposed Manufacturers (Page 3)
    manufacturers: [
        { id: 1, item: "SPV Modules MONOPERC (Half-Cut) Bi Facial", manufacturer: "MICROTEK", origin: "India" },
        { id: 2, item: "Inverter On grid", manufacturer: "MICROTEK", origin: "India" },
        { id: 3, item: "ACDB with IP65 enclosure, SPDs switchgears.", manufacturer: "Havells", origin: "India" },
        { id: 4, item: "Standard module mounting structure over the rooftop for installing 3 kWp solar panels", manufacturer: "Solaredge Innovations", origin: "India" },
        { id: 5, item: "DC Cables - PVC Insulated & UV Protected", manufacturer: "MICROTEK", origin: "India" },
        { id: 6, item: "AC Cables PVC Insulated", manufacturer: "R R KABEL/Havells", origin: "India" },
        { id: 7, item: "Solar Energy Meter Tested & Calibrated", manufacturer: "L&T/Genus / Visiontek / Any Standard Make", origin: "India" },
        { id: 8, item: "Lightning arrestor 1.2m copper bonded Multi spike", manufacturer: "Excel Earthing", origin: "India" }
    ],

    // Technical Specs (Page 4)
    technicalSpecs: {
        solarPvModules: {
            brand: "MICROTEK",
            model: "545 W MONOPERC TOPCON HALFCUT BIFACIAL DCR PANELS",
            qty: "6 Nos",
            warranty: "30 Years, Power Output Warranty, 15 Years Replacement Onsite Warranty"
        },
        inverter: {
            brand: "MICROTEK",
            qty: "1 Nos",
            warranty: "10 Year Onsite Warranty",
            additionalWork: "NA"
        }
    },

    // Pricing & System Specs (Page 5)
    pricing: {
        headerTitle: "3 KW MICROTEK SYSTEM WITH BIFACIAL MICROTEK MONOPERC HALFCUT DCR PANELS - 3270 W",
        roofTypeLabel: "Project Cost for Solar System",
        totalPayable: "2,10,000",
        amountInWords: "(Two Lakh Ten Thousand only)"
    },

    // KSEB Permit Fees Table (Page 5)
    permitFees: [
        { id: 1, item: "KSEB feasibility fee", fee: "Rs.1000" },
        { id: 2, item: "KSEB Registration fee", fee: "Rs590 (RS.9676+GST) (Rs1180 per KW) 80% (Rs.4720) refundable" },
        { id: 3, item: "Inspectorate Charge", fee: "NIL" },
        { id: 4, item: "KSEB Registration fee", fee: "Single Phase (Rs. 4,900) / Three Phase (Rs. 10,000): CUSTOMER SIDE" }
    ],

    // Subsidy & Warranty Notes (Page 5)
    subsidyNote: "Government subsidy will be provided within 35 days after completion of work and KSEB connection is obtained.",
    warranties: {
        panel: "PANEL-30 YEARS (15+15): Performance warranty as per manufacturer, Breakage of glass is not covered under warranty for replacement",
        inverter: "INVERTER - 10 YEARS (ONSITE COMPANY WARRANTY)",
        isolator: "Isolator - 3 Years",
        acdb: "ACDB, DCDB, Wi-Fi Dongle - 1 Year"
    },

    // Terms and Conditions (Page 6)
    termsAndConditions: [
        { label: "Prices", text: "FOR - Kerala." },
        { label: "Freight and handling(offloading)", text: "Included" },
        { label: "Implementation Note", text: "For the effective implementation of the project the beneficiary will have to support us for handle and settle loading. unloading and any other outside interference, if any, in connection with the installation work." },
        { label: "Installation", text: "Included" },
        { label: "GST", text: "Included" },
        { label: "Structure cost", text: "Included" },
        { label: "KSEB Fee", text: "Included in the estimate" },
        { label: "Payment Terms", text: "50% as advance along with the workorder.50% cost after Installation" },
        { label: "Delivery and Commissioning of project", text: "Materials will be delivered within 15 Days from the date of advance payment and signing of work Order. Installation will be completed within 7 days, after delivered of materials." },
        { label: "Complaint registering and Service Support", text: "Kindly contact us on this number +91 9526801406 for any complaints between 9:30AM and 5:00 PM from Monday to Saturday" },
        { label: "Validity", text: "Quotation is valid up to 15days" },
        { label: "Governance Clause", text: "The quotation is governed by terms and conditions here in contained. We shallnot be deemed to be governed by your terms and conditions if any, unless a specific written acceptance of the same is given by us." },
        { label: "Jurisdiction", text: "Courts in Kollam City alone will have the Jurisdiction, in respect of any claimed spite or any matter arising out of this quotation" },
        { label: "Force Majeure Clause", text: "Our offered Prices are fixed. However, may change as per Indian Government regulation. We trust that our offer is in line with your requirements and look forward to receive your valuable" }
    ]
};
