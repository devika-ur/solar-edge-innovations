import React from 'react'
import { typesOfCctvs } from '../assets/assets'; // Create an array similar to typesOfSolars
import ImageWithLoader from '../utils/ImageWithLoader';
import { motion } from 'framer-motion';

const CctvSection = () => {
   return (
      <div id="cctv-section" className='flex flex-col items-center gap-10 px-4 sm:px-8 md:px-16 lg:px-20 mt-13'>
         <div className="relative inline-block">
            <h2 className="font-playfair text-main-heading font-bold text-center relative">
               <span className="text-green-medium">CCTV</span> Solutions
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

         <div className='flex flex-col gap-20 w-full'>
            {
               typesOfCctvs.map((cctv, index) => (
                  <div
                     key={cctv.id}
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
                           src={cctv.image}
                           alt={cctv.heading}
                           className={cctv.classes}
                        />
                     </motion.div>

                     {/* Text */}
                     <div className='flex-1'>
                        <h3 className='text-card-title font-bold mb-3'>{cctv.heading}</h3>
                        <p className='text-body mb-4'>{cctv.description}</p>
                        <ul className='text-card-description list-disc list-inside space-y-1'>
                           {cctv.point1 && <li>{cctv.point1}</li>}
                           {cctv.point2 && <li>{cctv.point2}</li>}
                           {cctv.point3 && <li>{cctv.point3}</li>}
                        </ul>
                     </div>
                  </div>
               ))
            }
         </div>
      </div>
   )
}

export default CctvSection;
