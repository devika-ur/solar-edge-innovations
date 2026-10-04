import React from 'react'
import { LuUserCheck } from "react-icons/lu";
import { FiClock } from "react-icons/fi";
import { RiCustomerService2Line } from "react-icons/ri";
import { MdOutlineSecurity } from "react-icons/md";

const CctvServices = () => {
    return (
        <div className="relative w-full overflow-hidden bg-black py-16 px-4 sm:px-8 md:px-16 lg:px-20 my-20">
            {/* Animated diagonal lines */}
            <div className="absolute inset-0 bg-[linear-gradient(120deg,#22c55e_2px,transparent_2px)] bg-[length:40px_40px] animate-moveLines opacity-60"></div>

            {/* Page Content */}
            <div className="relative z-10 text-white">
                <h2 className="font-playfair text-main-heading font-bold text-center mb-12">
                    <span className='text-green-light'>CCTV</span> Services Includes
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-12 justify-items-center">
                    
                    <div className="flex flex-col items-center">
                        <LuUserCheck className="text-4xl mb-3" />
                        <p className="text-body text-center">Installation</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <FiClock className="text-4xl mb-3" />
                        <p className="text-body text-center">Timely Maintenance</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <RiCustomerService2Line className="text-4xl mb-3" />
                        <p className="text-body text-center">After-Sales Support</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <MdOutlineSecurity className="text-4xl mb-3" />
                        <p className="text-body text-center">24/7 Monitoring</p>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default CctvServices
