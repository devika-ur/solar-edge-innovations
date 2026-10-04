import React from 'react';
import { RiBattery2ChargeLine, RiBatteryChargeLine, RiPlugLine } from "react-icons/ri";
import { FaTools } from "react-icons/fa";

const InverterServices = () => {
    return (
        <div className="relative w-full overflow-hidden bg-black py-16 px-4 sm:px-8 md:px-16 lg:px-20 mt-20">
            {/* Animated diagonal lines */}
            <div className="absolute inset-0 bg-[linear-gradient(120deg,#22c55e_2px,transparent_2px)] bg-[length:40px_40px] animate-moveLines opacity-60"></div>

            {/* Page Content */}
            <div className="relative z-10 text-white">
                
                <h2 className="font-playfair font-bold text-main-heading text-center mb-12">
                    <span className='text-green-light'>Inverter</span> Service includes
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-12 justify-items-center">
                    
                    <div className="flex flex-col items-center">
                        <RiBattery2ChargeLine className="text-5xl mb-3" />
                        <p className="text-body text-center">
                            Solar hybrid battery supply <br /> and service
                        </p>
                    </div>

                    <div className="flex flex-col items-center">
                        <RiBatteryChargeLine className="text-5xl mb-3" />
                        <p className="text-body text-center">
                            Lithium battery supply <br /> and installation
                        </p>
                    </div>

                    <div className="flex flex-col items-center">
                        <RiPlugLine className="text-5xl mb-3" />
                        <p className="text-body text-center">
                            Inverter, battery supply <br /> and installation
                        </p>
                    </div>

                    <div className="flex flex-col items-center">
                        <FaTools className="text-5xl mb-3" />
                        <p className="text-body text-center">
                            Sales, service <br /> and maintenance
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default InverterServices;
