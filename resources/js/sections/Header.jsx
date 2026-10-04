import React from 'react'
import { assets } from '../assets/assets';
import { motion } from 'framer-motion';

const Header = () => {
    return (
        <div className="relative min-h-screen bg-cover bg-center flex items-end justify-center p-4 md:p-8"
            style={{ backgroundImage: `url(${assets.headerImage})`, clipPath: "ellipse(100% 97% at 50% 0%)" }}>
            <div className="absolute bottom-5 left-0 w-full h-1/2 bg-gradient-to-t from-black opacity-80 to-transparent z-10"></div>

            <motion.div
                className="relative z-20 bottom-10 text-center"
                initial={{ opacity: 0, y: 100 }}          
                animate={{ opacity: 1, y: 0 }}             
                transition={{ duration: 2, ease: "easeOut" }}
            >
                <p className="text-white mb-3">100% CLEAN – 100% POWER</p>
                <h1 className="max-w-4xl text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white font-playfair">
                    Energy for a Brighter Tomorrow with Solar Power
                </h1>
            </motion.div>
        </div>
    )
}

export default Header;