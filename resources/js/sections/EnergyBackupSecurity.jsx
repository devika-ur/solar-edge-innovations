import React from 'react'
import { assets } from '../assets/assets'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import { HashLink } from 'react-router-hash-link';


const EnergyBackupSecurity = () => {
    return (
        <section className="px-6 sm:px-8 md:px-16 lg:px-20 py-20 flex flex-col lg:flex-row items-center gap-10 max-w-7xl mx-auto">
            {/* Left Content */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 1, ease: "easeIn" }}
                className='w-full lg:w-1/2 my-3'>
                <h1 className='text-main-heading font-playfair font-bold'>
                    Energy. Backup. Security.
                </h1>
                <p>
                    Empowering your spaces with clean solar energy, reliable inverter
                    backups, and advanced CCTV surveillance.
                </p>
            </motion.div>

            {/* Right Cards in Grid */}
            <div className='w-full lg:1/2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-25 lg:gap-10 mt-6 lg:my-0'>
                {/* Solar Card */}
                <HashLink smooth to="/services#solar-section">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 1, ease: "easeIn", delay: 0.2 }}
                        className="w-72 hover:scale-106 duration-300 2xl:w-full h-auto flex flex-col justify-center items-center gap-3 relative rounded-4xl bg-[#fff] shadow-[0_4px_7.3px_0_rgba(0,0,0,0.1)] p-6 pt-16">
                        <img src={assets.solarPanel} alt="solar panel image" className='absolute -top-12 left-1/2 -translate-x-1/2 w-35 h-35 object-contain' />
                        <h1 className='text-[30px] text-green-medium mt-9 font-bold'>SOLAR</h1>
                        <Button text={'VIEW'} bgColor='bg-white' textColor='text-black' border='border border-green-medium' />
                    </motion.div>
                </HashLink>

                {/* Inverter Card */}
                <HashLink smooth to="/services#inverter-section">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 1, ease: "easeIn", delay: 0.8 }}
                        className="w-72 hover:scale-106 duration-300 2xl:w-full h-auto flex flex-col justify-center items-center gap-3 relative rounded-4xl bg-[#fff] shadow-[0_4px_7.3px_0_rgba(0,0,0,0.1)] p-6 pt-16">
                        <img src={assets.solarInverter} alt="solar inverter image" className='absolute -top-12 left-1/2 -translate-x-1/2 w-35 h-35 object-contain' />
                        <h1 className='text-[30px] text-green-medium mt-9 font-bold'>INVERTERS</h1>
                        <Button text={'VIEW'} bgColor='bg-white' textColor='text-black' border='border border-green-medium' />
                    </motion.div>
                </HashLink>

                {/* CCTV Card */}
                <HashLink smooth to="/services#cctv-section">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 1, ease: "easeIn", delay: 1 }}
                        className="w-72 hover:scale-106 duration-300 2xl:w-full h-auto flex flex-col justify-center items-center gap-3 relative rounded-4xl bg-[#fff] shadow-[0_4px_7.3px_0_rgba(0,0,0,0.1)] p-6 pt-16">
                        <img src={assets.cctvCamera} alt="cctv camera image" className='absolute -top-15 left-1/2 -translate-x-1/2 w-40 h-40  object-contain' />
                        <h1 className='text-[30px] text-green-medium mt-9 font-bold'>CCTV</h1>
                        <Button text={'VIEW'} bgColor='bg-white' textColor='text-black' border='border border-green-medium' />
                    </motion.div>
                </HashLink>
            </div>
        </section>
    )
}

export default EnergyBackupSecurity;
