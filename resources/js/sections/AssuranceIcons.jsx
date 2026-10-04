import React from 'react'
import { motion } from 'framer-motion'
import { assuranceIcons } from '../assets/assets'

const AssuranceIcons = () => {
    return (
        <>
            {/* Assurance Icons Container */}
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.9, ease: "easeIn", delay: 0 }}
                className="w-[95%] sm:w-[90%] md:w-[80%] bg-green-dark p-6 sm:p-10 md:p-13 rounded-3xl z-30 shadow-xl">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 text-center text-white">
                    {
                        assuranceIcons.map((icons, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <img src={icons.img} alt={icons.heading} className="w-10 sm:w-16 h-10 sm:h-16 mb-3" />
                                <p className="text-xs sm:text-sm md:text-lg font-medium">{icons.heading}</p>
                            </div>
                        ))
                    }
                </div>
            </motion.div>
        </>

    )
}

export default AssuranceIcons