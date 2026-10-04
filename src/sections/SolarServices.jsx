import React from 'react'
import { FiSearch } from "react-icons/fi";
import { FaRegFileAlt } from "react-icons/fa";
import { RiBuilding2Line } from "react-icons/ri";
import { FaRegIdCard } from "react-icons/fa";
import { FaSolarPanel } from "react-icons/fa6";
import { FaHeadphonesSimple } from "react-icons/fa6";

const SolarServices = () => {
    return (
        <div className="relative w-full overflow-hidden bg-black py-16 px-4 sm:px-8 md:px-16 lg:px-20 my-20">
            {/* Animated diagonal lines */}
            <div className="absolute inset-0 bg-[linear-gradient(120deg,#22c55e_2px,transparent_2px)] bg-[length:40px_40px] animate-moveLines opacity-60"></div>

            {/* Page Content */}
            <div className="relative z-10 text-white">
                <h2 className="font-playfair text-main-heading font-bold text-center mb-12">
                    <span className='text-green-light'>Solar</span> Services Includes
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-12 justify-items-center">
                    
                    <div className="flex flex-col items-center">
                        <FiSearch className="text-4xl mb-3" />
                        <p className="text-body text-center">Free Site Inspection</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <FaRegFileAlt className="text-4xl mb-3" />
                        <p className="text-body text-center">KSEB Documentation</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <RiBuilding2Line className="text-4xl mb-3" />
                        <p className="text-body text-center">Structure Fabrication</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <FaRegIdCard className="text-4xl mb-3" />
                        <p className="text-body text-center">Subsidy Registration [Residential]</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <FaSolarPanel className="text-4xl mb-3" />
                        <p className="text-body text-center">Solar Installation</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <FaHeadphonesSimple className="text-4xl mb-3" />
                        <p className="text-body text-center">On-Call Service Support</p>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default SolarServices
