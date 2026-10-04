import React from 'react'
import { assets } from '../assets/assets'
import ServiceHero from '../sections/ServiceHero'
import ServicesDisplay from '../sections/ServicesDisplay'
import TypesOfSolars from '../sections/TypesOfSolars'
import TypesOfInverter from '../sections/TypesOfInverter'
import MalayalamSection from '../sections/MalayalamSection'
import AssuranceIcons from '../sections/AssuranceIcons'
import SolarServices from '../sections/SolarServices'
import InverterServices from '../sections/InverterServices'
import CctvSection from '../sections/CctvSection'
import CctvServices from '../sections/CctvServices'
import ServiceAreas from '../sections/ServiceAreas'
import { Helmet } from 'react-helmet-async'
import PdfDownload from '../sections/PdfDownload'


const Services = () => {

  const pdfs = [
    { id: "p1", title: "Battery", path: "/brochures/solaredgeinnovation-battery.pdf" },
    { id: "p2", title: "Inverter", path: "/brochures/solaredgeinnovation-inverter.pdf" },
    { id: "p3", title: "Solar", path: "/brochures/solaredgeinnovation-solar.pdf" },
  ];
  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Our Services | Solar Edge Innovation - Solar Panels, Inverters, Batteries, CCTV</title>
        <meta
          name="description"
          content="Explore Solar Edge Innovation’s wide range of services including solar panels, inverters, batteries, and CCTV solutions for homes and businesses."
        />
        <meta
          name="keywords"
          content="solar panels, inverter, batteries, CCTV, solar energy solutions, sustainable energy, Solar Edge Innovation, security cameras, best solar in varkala, best inverter in varkala, best cctv in varkala, best solar in elakamon, best inverter in elakamon, best cctv in elakamon, best solar in onninmoodu, best inverter in onninmoodu, best cctv in onninmoodu, best solar in parippally, best inverter in parippally, best cctv in parippally, best solar in paravur, best inverter in paravur, best cctv in paravur, elakamon, onninmoodu, parippally, paravur, solar varkala, inverter varkala, cctv varkala, solar panel installation varkala, inverter battery varkala, cctv camera installation varkala, solar company varkala, inverter shop varkala, cctv dealers varkala, solar panel price in varkala, inverter service varkala, security cameras varkala, solar elakamon, inverter elakamon, cctv elakamon, solar onninmoodu, inverter onninmoodu, cctv onninmoodu, solar parippally, inverter parippally, cctv parippally, solar paravur, inverter paravur, cctv paravur, kollam, pthanamthitta, pathanamthitta, thrivananthapuram, trivandrum, varkala, ayroor, elakamon, solar trivandrum, solar edge trivandrum, solar varkala, solar kollam, solar store, inverter kollam, inverter paripally, inverter parippally, battery varkala, camera pathanamthita, camera pathanamthitta, cctv kollam, solar pthanamthitta, solar pathanamthitta, solar edge kollam, solar edge pathanamthitta, solar edge varkala, solar edge thrivananthapuram, solar ayroor, inverter ayroor, battery ayroor, cctv ayroor, inverter trivandrum, inverter pathanamthitta, battery trivandrum, battery kollam, camera trivandrum, camera kollam, camera varkala, cctv trivandrum, cctv pathanamthitta, cctv varkala, cctv elakamon, solar store kollam, solar store trivandrum, solar store varkala"
        />
        <link rel="canonical" href="https://www.solaredgeinnovation.in/services" />

        {/* Social Media Preview */}
        <meta property="og:title" content="Our Services | Solar Edge Innovation - Solar Panels, Inverters, Batteries, CCTV" />
        <meta property="og:description" content="Discover our services: solar panels, inverters, batteries, and CCTV solutions for sustainable and reliable energy." />
        <meta property="og:image" content="https://www.solaredgeinnovation.in/logo.png" />
        <meta property="og:url" content="https://www.solaredgeinnovation.in/services" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="bg-[#FAFCFA]">
        {/* Service Hero, Services We Offer & Assurance Banner matching mockup UI */}
        <ServiceHero />

        <MalayalamSection />
        <PdfDownload files={pdfs} />
        <TypesOfSolars />
        <SolarServices />
        <TypesOfInverter />
        <InverterServices />
        <CctvSection />
        <CctvServices />
      </div>
    </>

  )
}

export default Services
