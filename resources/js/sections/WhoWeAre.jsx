import React from "react";
import { assets } from "../assets/assets";
import Button from "../components/Button";
import { motion } from 'framer-motion';
import { HiDownload } from "react-icons/hi";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
// import "swiper/css/scrollbar";
import { Autoplay } from "swiper/modules";

// import { Scrollbar } from "swiper/modules";

const Card = ({ icon, title, children }) => (
    <div className="w-full xl:w-[46%] h-90 p-7 flex flex-col gap-3 rounded-2xl bg-[#f7f7f7] border border-gray-200 md:border-none shadow-[-10px_-10px_30px_#ffffff,10px_10px_30px_rgba(174,174,192,0.4)]">
        <motion.div className="max-w-max"
            initial={{ scale: 0.2, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeIn" }}
            viewport={{ once: true, amount: 0.3 }}>
            <img src={icon} alt={title} className="w-20 h-18" />
        </motion.div>
        <h2 className="text-card-title font-bold">{title}</h2>
        {children}
    </div>
);

const WhoWeAre = () => {
    return (
        <section className="min-h-screen bg-light-white px-6 sm:px-8 md:px-16 lg:px-20">
            {/* Intro Section */}
            <div className="flex flex-col gap-6">
                <h1 className="text-main-heading font-playfair font-bold">Who we are?</h1>
                <p className="text-body text-justify">
                    At Solar Edge Innovation, we are committed to delivering smart,
                    reliable, and future-ready energy and security solutions. With
                    expertise spanning across solar power systems, advanced inverters, and
                    CCTV surveillance, we empower homes, businesses, and industries to
                    stay powered, secure, and efficient.
                </p>
                <a href="/brochures/SolarEdge_Brochure.pdf" download>
                    <Button
                        text=" Download Brochure"
                        bgColor="bg-green-medium"
                        textColor="text-white"
                        icon={HiDownload}
                    />
                </a>
            </div>

            {/* Cards Section */}
            <div className="mt-10 flex flex-col xl:flex-row gap-20">
                <motion.div className="w-full xl:w-2/5"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.3 }}>
                    <img src={assets.whoWeAre} alt="who we are" className=" xl:w-full xl:h-full w-1/2 " />
                </motion.div>

                {/* Right Cards */}
                <div className="hidden lg:flex flex-col gap-10 w-full xl:w-1/2">
                    {/* Desktop layout */}
                    <div className="flex gap-10">
                        <Card icon={assets.whyChooseUsPattern1} title="Why choose us?">
                            <p className="text-justify">
                                With a strong focus on quality, innovation, and customer
                                satisfaction, we provide end-to-end solutions from consultation
                                and installation to after-sales service and maintenance.
                            </p>
                        </Card>
                        <Card icon={assets.whyChooseUsPattern2} title="Solar Solutions">
                            <ul className="list-disc flex flex-col gap-3 px-5 text-card-description">
                                <li>On-Grid Solar Systems</li>
                                <li>Hybrid Solar Systems</li>
                                <li>Off-Grid Solar Systems</li>
                            </ul>
                        </Card>
                    </div>

                    <div className="flex gap-10">
                        <Card icon={assets.whyChooseUsPattern2} title="Inverter Solutions">
                            <ul className="list-disc flex flex-col gap-3 px-5 text-card-description">
                                <li>On-Grid Inverters</li>
                                <li>Hybrid Inverters</li>
                                <li>Micro Inverters</li>
                            </ul>
                        </Card>
                        <Card icon={assets.whyChooseUsPattern2} title="CCTV & Security">
                            <ul className="list-disc flex flex-col gap-3 px-5 text-card-description">
                                <li>Sales & Installation</li>
                                <li>Service & Maintenance</li>
                                <li>NVR & DVR Solutions</li>
                            </ul>
                        </Card>
                    </div>
                </div>

                {/* Mobile Swiper */}
                <div className="lg:hidden w-full">
                    <Swiper
                        modules={[Autoplay]}
                        autoplay={{
                            delay: 4000, // 3 seconds
                            disableOnInteraction: false, // keeps autoplay even after manual swipe
                        }}
                        spaceBetween={20}
                        slidesPerView={1.1}
                        loop={true} // makes it infinite
                        className="mySwiper"
                    >
                        <SwiperSlide>
                            <Card icon={assets.whyChooseUsPattern1} title="Why choose us?">
                                <p className="text-justify">
                                    With a strong focus on quality, innovation, and customer
                                    satisfaction, we provide end-to-end solutions from consultation
                                    and installation to after-sales service and maintenance.
                                </p>
                            </Card>
                        </SwiperSlide>

                        <SwiperSlide>
                            <Card icon={assets.whyChooseUsPattern2} title="Solar Solutions">
                                <ul className="list-disc flex flex-col gap-3 px-5 text-card-description">
                                    <li>On-Grid Solar Systems</li>
                                    <li>Hybrid Solar Systems</li>
                                    <li>Off-Grid Solar Systems</li>
                                </ul>
                            </Card>
                        </SwiperSlide>

                        <SwiperSlide>
                            <Card icon={assets.whyChooseUsPattern2} title="Inverter Solutions">
                                <ul className="list-disc flex flex-col gap-3 px-5 text-card-description">
                                    <li>On-Grid Inverters</li>
                                    <li>Hybrid Inverters</li>
                                    <li>Micro Inverters</li>
                                </ul>
                            </Card>
                        </SwiperSlide>

                        <SwiperSlide>
                            <Card icon={assets.whyChooseUsPattern2} title="CCTV & Security">
                                <ul className="list-disc flex flex-col gap-3 px-5 text-card-description">
                                    <li>Sales & Installation</li>
                                    <li>Service & Maintenance</li>
                                    <li>NVR & DVR Solutions</li>
                                </ul>
                            </Card>
                        </SwiperSlide>
                    </Swiper>
                </div>

            </div>
        </section>
    );
};

export default WhoWeAre;
