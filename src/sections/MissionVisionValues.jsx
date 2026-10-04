import React from 'react'
import { assets } from '../assets/assets'
import { motion } from 'framer-motion';

const MissionVisionValues = () => {
    return (
        <div className='px-4 sm:px-8 md:px-16 lg:px-20 pb-10'>
            <div className="relative z-10 flex items-center justify-center h-full p-4 md:p-8">
                <h2 className='text-8xl font-extrabold '>
                    <span className="text-transparent" style={{ WebkitTextStroke: '1px green', textStroke: '2px green' }}>Bright </span>
                    <span className='text-green-medium'>Energy</span>
                    <span className="text-transparent" style={{ WebkitTextStroke: '1px green', textStroke: '2px green' }}>, Bright </span>
                    <span className='text-green-medium'>Life</span>
                </h2>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-20'>

                <motion.div
                    initial={{ opacity: 0, x: 200 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.7, ease: "easeIn", delay: 0.6 }}
                    className='bg-[#e0f9e6] p-7 rounded-[30px] flex flex-col gap-3'>

                    <img src={assets.mission} alt="mission image" className='w-20 h-20' />
                    <h3 className='text-[25px] font-bold text-green-dark'>MISSION</h3>
                    <p>Deliver innovative, reliable solar, security, and backup solutions.
                        Provide expert installation, proactive maintenance, and fast support for peace of mind.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.7, ease: 'easeIn', delay: 0 }}
                    className='bg-green-medium p-7 rounded-[30px] flex flex-col gap-3 text-white translate-0 lg:-translate-y-10'>

                    <img src={assets.vision} alt="vision image" className='w-20 h-20' />
                    <h3 className='text-[25px] font-bold'>VISION</h3>
                    <p>To be the trusted leader in sustainable energy and smart security.
                        Empowering homes, businesses, and industries with independence, safety, and value.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -200 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.7, ease: 'easeIn', delay: 0.6 }}
                    className='bg-[#e0f9e6] p-7 rounded-[30px] flex flex-col gap-3'>

                    <img src={assets.values} alt="values image" className='w-20 h-20' />
                    <h3 className='text-[25px] font-bold text-green-dark'>VALUES</h3>
                    <p>Innovation • Reliability • Sustainability • Customer Focus.
                        Integrity • Excellence • Long-term partnerships & service.</p>
                </motion.div>
            </div>
        </div>
    )
}

export default MissionVisionValues;