import React from 'react'
import { aboutusServiceData } from '../assets/assets'
import { motion } from 'framer-motion'

const ServicesDisplay = () => {

    return (
        <div className=' my-10 xl:my-15 '>
            <div className='flex flex-col justify-center items-center'>
                <h2 className='text-4xl lg:text-main-heading font-playfair font-bold max-w-6xl text-center mb-15'>Personalized Solar Solutions For Your Needs</h2>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                    {
                        aboutusServiceData.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 100 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.1 }}
                                transition={{ duration: 0.7, ease: "easeIn", delay: `${service.delay}` }}
                                className='p-6 bg-white flex flex-col gap-4  rounded-[10px] '>
                                <div>
                                    <h2 className='text-card-title font-bold text-green-medium'>{service.heading1}</h2>
                                    <h2 className='text-card-title font-bold text-green-medium'>{service.heading2}</h2>
                                </div>
                                <img src={service.image} alt="services" className='w-20 h-20' />
                                <p className='text-card-description '>{service.description}</p>
                            </motion.div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default ServicesDisplay