import React from 'react'
import Header from '../sections/Header'
import ProjectShowcase from '../sections/ProjectShowcase'
import CategorySection from '../sections/CategorySection'
import WhoWeAre from '../sections/WhoWeAre'
import EnergyBackupSecurity from '../sections/EnergyBackupSecurity'
import OurProviders from '../sections/OurProviders'
import GetInTouch from '../sections/GetInTouch'
import SolarAnimation from '../utils/SolarAnimation'
import { Helmet } from "react-helmet-async";
import SolarShowcase from '../sections/SolarShowcase'
import WhoWeAreSection from '../sections/WhoWeAreSection'
import ServicesWeOffer from '../sections/ServicesWeOffer'
import ServiceAreas from '../sections/ServiceAreas'

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Solar Edge Innovation | Solar Panels, Inverters, Batteries & CCTV</title>
        <meta
          name="description"
          content="Solar Edge Innovation provides reliable solar energy solutions, including solar panels, inverters, batteries, and CCTV systems for homes and businesses."
        />
        <meta
          name="keywords"
          content="
solar panels, inverter, batteries, CCTV, solar energy, sustainable energy, security cameras,
Solar Edge Innovation, home solar system, commercial solar solutions, energy storage,

solar Elakamon, solar panels Elakamon, inverter Elakamon, batteries Elakamon, battery Elakamon, CCTV Elakamon,
solar Varkala, solar panels Varkala, inverter Varkala, batteries Varkala, CCTV Varkala,
solar Parippally, solar panels Parippally, inverter Parippally, batteries Parippally, CCTV Parippally,
solar Trivandrum, solar panels Trivandrum, inverter Trivandrum, batteries Trivandrum, CCTV Trivandrum,
solar Thiruvananthapuram, solar panels Thiruvananthapuram, inverter Thiruvananthapuram, batteries Thiruvananthapuram, CCTV Thiruvananthapuram,
solar Kollam, solar panels Kollam, inverter Kollam, batteries Kollam, CCTV Kollam,
solar Paravoor, solar panels Paravoor, inverter Paravoor, batteries Paravoor, CCTV Paravoor,
solar Attingal, solar panels Attingal, inverter Attingal, batteries Attingal, CCTV Attingal,
solar Kallambalam, solar panels Kallambalam, inverter Kallambalam, batteries Kallambalam, CCTV Kallambalam,

best solar in varkala, best inverter in varkala, best cctv in varkala,
best solar in elakamon, best inverter in elakamon, best cctv in elakamon,
best solar in onninmoodu, best inverter in onninmoodu, best cctv in onninmoodu,
best solar in parippally, best inverter in parippally, best cctv in parippally,
best solar in paravur, best inverter in paravur, best cctv in paravur,
onninmoodu, solar onninmoodu, solar panels onninmoodu, inverter onninmoodu, batteries onninmoodu, CCTV onninmoodu,
solar varkala, inverter varkala, cctv varkala, solar elakamon, inverter elakamon, cctv elakamon,
solar onninmoodu, inverter onninmoodu, cctv onninmoodu, solar parippally, inverter parippally, cctv parippally,
solar paravur, inverter paravur, cctv paravur, solar panel installation varkala, inverter battery varkala,
cctv camera installation varkala, solar company varkala, inverter shop varkala, cctv dealers varkala,
solar panel price in varkala, inverter service varkala, security cameras varkala,

residential solar Kerala, industrial solar Kerala, solar installation Kerala, solar service Kerala,
kollam, pthanamthitta, pathanamthitta, thrivananthapuram, trivandrum, varkala, ayroor, elakamon,
solar trivandrum, solar edge trivandrum, solar varkala, solar kollam, solar store, inverter kollam,
inverter paripally, inverter parippally, battery varkala, camera pathanamthita, camera pathanamthitta,
cctv kollam, solar pthanamthitta, solar pathanamthitta, solar edge kollam, solar edge pathanamthitta,
solar edge varkala, solar edge thrivananthapuram, solar ayroor, inverter ayroor, battery ayroor,
cctv ayroor, inverter trivandrum, inverter pathanamthitta, battery trivandrum, battery kollam,
camera trivandrum, camera kollam, camera varkala, cctv trivandrum, cctv pathanamthitta,
cctv varkala, cctv elakamon, solar store kollam, solar store trivandrum, solar store varkala
"
        />

        <link rel="canonical" href="https://www.solaredgeinnovation.in/" />

        {/* Social Media Preview */}
        <meta property="og:title" content="Solar Edge Innovation | Solar Panels, Inverters, Batteries & CCTV" />
        <meta property="og:description" content="Explore Solar Edge Innovation’s solar panels, inverters, batteries, and CCTV solutions for homes and businesses." />
        <meta property="og:image" content="https://www.solaredgeinnovation.in/logo.png" />
        <meta property="og:url" content="https://www.solaredgeinnovation.in/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />

        <script type="application/ld+json">
          {`
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Solar Edge Innovation",
  "url": "https://www.solaredgeinnovation.in/",
  "logo": "https://www.solaredgeinnovation.in/logo.png",
  "image": "https://www.solaredgeinnovation.in/logo.png",
  "description": "Solar Edge Innovation provides high-quality solar panels, inverters, batteries, and CCTV solutions with expert installation and reliable customer support across Kerala.",
  
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Elakamon, Ayiroor, Varkala",
    "addressLocality": "Varkala",
    "addressRegion": "Kerala",
    "postalCode": "695310",
    "addressCountry": "IN"
  },

  "areaServed": [
    { "@type": "AdministrativeArea", "name": "Kerala" },
    { "@type": "City", "name": "Thiruvananthapuram" },
    { "@type": "City", "name": "Trivandrum" },
    { "@type": "City", "name": "TVM" },
    { "@type": "City", "name": "Kollam" },
    { "@type": "City", "name": "Parippally" },
    { "@type": "City", "name": "Varkala" },
    { "@type": "City", "name": "Elakamon" },
    { "@type": "City", "name": "Onninmoodu" },
    { "@type": "City", "name": "Paravoor" },
    { "@type": "City", "name": "Attingal" },
    { "@type": "City", "name": "Kallambalam" }
  ],

  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+919526801406",
      "contactType": "customer service",
      "availableLanguage": ["English", "Malayalam"],
      "areaServed": "Kerala"
    }
  ],

  "email": "solaredgeinnovations25@gmail.com",

  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "09:00",
      "closes": "20:00"
    }
  ],

  "sameAs": [
    "https://maps.google.com?q=Elakamon,Ayiroor,Varkala"
  ]
}
`}
        </script>

      </Helmet>
      <div className='bg-[#F8F8FA]'>
        {/* <Header /> */}
        <SolarShowcase />
        <ServicesWeOffer />
        <WhoWeAreSection />
        {/* <WhoWeAre /> */}
        {/* <EnergyBackupSecurity /> */}
        {/* <SolarAnimation /> */}
        <ProjectShowcase />
        {/* <CategorySection /> */}
        <OurProviders />
        <ServiceAreas />
        <GetInTouch />
      </div>
    </>

  )
}

export default Home