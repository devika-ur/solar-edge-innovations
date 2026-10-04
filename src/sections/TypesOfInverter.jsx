import React from 'react'
import { typesOfInverter } from '../assets/assets'
import ImageWithLoader from '../utils/ImageWithLoader';
import { motion } from 'framer-motion'

const TypesOfInverter = () => {
   return (
      <div id="inverter-section" className='flex flex-col items-center gap-10 px-4 sm:px-8 md:px-16 lg:px-20 mt-13'>
         <div className="relative inline-block">
            <h2 className="font-playfair text-main-heading font-bold text-center relative">
             <span className="text-green-medium">Inverter</span> Solutions
            </h2>
            {/* Curved underline */}
            <svg
               className="absolute right-0 -bottom-2 w-38 h-5 -translate-x-1/2 text-yellow-medium"
               viewBox="0 0 100 10"
               fill="none"
               xmlns="http://www.w3.org/2000/svg"
            >
               <path d="M5 5 C 30 15, 70 -5, 95 5"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
               />
            </svg>

         </div>

         <div className='flex flex-col gap-15 w-full'>
            {
               typesOfInverter.map((inverters, index) => (
                  <div
                     key={inverters.id}
                     className={`flex flex-col md:flex-row items-center gap-8 
                        ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                  >
                     {/* Image */}
                     <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true, amount: 0.3 }}
                        className="flex-1 flex justify-center"
                     >
                        <ImageWithLoader
                           src={inverters.image}
                           alt={inverters.heading}
                           className={inverters.classes}
                        />
                     </motion.div>


                     {/* Text */}
                     <div className='flex-1'>
                        <h3 className='text-card-title font-bold mb-3'>{inverters.heading}</h3>
                        <p className='text-body mb-4'>{inverters.description}</p>
                        <ul className='text-card-description list-disc list-inside space-y-1'>
                           {inverters.point1 && <li>{inverters.point1}</li>}
                           {inverters.point2 && <li>{inverters.point2}</li>}
                        </ul>
                     </div>
                  </div>
               ))
            }
         </div>
      </div>
   )
}
export default TypesOfInverter;

