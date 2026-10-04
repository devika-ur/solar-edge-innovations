import React from 'react';
import { motion } from 'framer-motion';
import { assets } from '../assets/assets';
import {
    Leaf,
    Lightbulb,
    Users,
    Target,
} from 'lucide-react';
import aboutImage from '../assets/about-image.png';

export default function ProfileCard() {
    return (
        <section
            className="
        w-full
        px-6 sm:px-10 lg:px-16 xl:px-20
        pt-4 sm:pt-6 lg:pt-8
        pb-12 sm:pb-16 lg:pb-24
        relative
        overflow-hidden
        bg-cover
        bg-center
        bg-no-repeat
    "
            style={{
                backgroundImage: `
        linear-gradient(
            rgba(255, 255, 255, 0.78),
            rgba(255, 255, 255, 0.84)
        ),
        url(${aboutImage})
    `,
            }}
        >
            {/* Optional soft background overlay */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[#E8F5EB]/40 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#DDF1E3]/30 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1460px] mx-auto relative z-10">

                {/* =========================================================
                    TOP HALF: TWO-COLUMN LEADERSHIP CONTENT
                ========================================================= */}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 xl:gap-14 items-center">

                    {/* =====================================================
                        LEFT COLUMN: MR. JOSE JO PORTRAIT
                    ===================================================== */}

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                            duration: 0.7,
                            ease: 'easeOut',
                        }}
                        className="
                            lg:col-span-5
                            xl:col-span-5
                            relative
                            flex
                            items-center
                            justify-center
                        "
                    >

                        {/* Mr. Jose Jo Portrait Image */}
                        <div className="relative w-full max-w-[420px] flex items-end justify-center">

                            <img
                                src={assets.joseJoNoBg}
                                alt="Mr. Jose Jo - Owner, SolarEdge Innovation"
                                className="
                                    w-full
                                    h-auto
                                    object-contain
                                    relative
                                    z-10
                                    filter
                                    contrast-[1.02]
                                "
                            />

                        </div>


                        {/* =================================================
                            FLOATING BADGE 1
                        ================================================= */}

                        <motion.div
                            animate={{
                                y: [-3, 3, -3],
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 4.5,
                                ease: 'easeInOut',
                            }}
                            className="
                                absolute
                                top-10
                                sm:top-12
                                -left-3
                                sm:-left-6
                                z-20
                                bg-[#0E361D]
                                text-white
                                p-3.5
                                sm:p-4
                                rounded-2xl
                                shadow-xl
                                flex
                                flex-col
                                gap-2
                                max-w-[135px]
                            "
                        >
                            <div
                                className="
                                    w-8
                                    h-8
                                    rounded-lg
                                    bg-white/10
                                    flex
                                    items-center
                                    justify-center
                                    text-emerald-300
                                "
                            >
                                <Leaf className="w-4 h-4 fill-emerald-300" />
                            </div>

                            <div
                                className="
                                    text-[11px]
                                    sm:text-xs
                                    font-semibold
                                    leading-snug
                                    text-white/95
                                    font-sans
                                "
                            >
                                Leading
                                <br />
                                Clean Energy
                                <br />
                                Tomorrow
                            </div>
                        </motion.div>


                        {/* =================================================
                            FLOATING BADGE 2
                        ================================================= */}

                        <motion.div
                            animate={{
                                y: [3, -3, 3],
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 5,
                                ease: 'easeInOut',
                                delay: 0.3,
                            }}
                            className="
                                absolute
                                -bottom-5
                                sm:-bottom-6
                                -left-2
                                sm:-left-5
                                z-20
                                bg-white/95
                                backdrop-blur-md
                                rounded-2xl
                                p-4
                                shadow-xl
                                border
                                border-neutral-100
                                flex
                                flex-col
                                gap-1
                                min-w-[140px]
                            "
                        >
                            <div
                                className="
                                    w-8
                                    h-8
                                    rounded-lg
                                    bg-[#E5F5E8]
                                    flex
                                    items-center
                                    justify-center
                                    text-[#1A4D2E]
                                "
                            >
                                <svg
                                    className="w-5 h-5 text-[#1A4D2E]"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polygon points="3 14 6 5 18 5 21 14 3 14" />
                                    <line x1="12" y1="5" x2="12" y2="14" />
                                    <line x1="8" y1="9" x2="16" y2="9" />
                                    <line x1="9" y1="14" x2="7" y2="20" />
                                    <line x1="15" y1="14" x2="17" y2="20" />
                                    <line x1="6" y1="20" x2="18" y2="20" />
                                </svg>
                            </div>

                            <div
                                className="
                                    text-xl
                                    sm:text-2xl
                                    font-black
                                    text-neutral-900
                                    leading-tight
                                    mt-1
                                    font-sans
                                "
                            >
                                3+ Years
                            </div>

                            <div
                                className="
                                    text-[10px]
                                    sm:text-[11px]
                                    text-neutral-500
                                    font-medium
                                "
                            >
                                of Solar Innovation
                            </div>

                            <div
                                className="
                                    w-8
                                    h-[2px]
                                    bg-emerald-600
                                    rounded-full
                                    mt-1
                                "
                            />
                        </motion.div>


                        {/* =================================================
                            FLOATING BADGE 3
                        ================================================= */}

                        <motion.div
                            animate={{
                                y: [-3, 3, -3],
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 4.8,
                                ease: 'easeInOut',
                                delay: 0.5,
                            }}
                            className="
                                absolute
                                -bottom-4
                                sm:-bottom-5
                                -right-2
                                sm:-right-5
                                z-20
                                bg-white/95
                                backdrop-blur-md
                                rounded-2xl
                                p-4
                                sm:p-5
                                shadow-xl
                                border
                                border-neutral-100
                                flex
                                flex-col
                                gap-0.5
                                min-w-[170px]
                            "
                        >
                            <div
                                className="
                                    font-['Caveat',cursive]
                                    text-2xl
                                    sm:text-3xl
                                    text-neutral-800
                                    -rotate-3
                                    select-none
                                    leading-none
                                    mb-1
                                "
                            >
                                Jose Jo
                            </div>

                            <div
                                className="
                                    text-sm
                                    font-bold
                                    text-neutral-900
                                    leading-tight
                                    font-sans
                                "
                            >
                                Mr. Jose Jo
                            </div>

                            <div
                                className="
                                    text-[11px]
                                    text-neutral-500
                                    font-medium
                                "
                            >
                                Owner
                            </div>

                            <div
                                className="
                                    text-[10px]
                                    text-neutral-400
                                    font-medium
                                "
                            >
                                SolarEdge Innovation
                            </div>
                        </motion.div>

                    </motion.div>


                    {/* =====================================================
                        RIGHT COLUMN: LEADERSHIP PHILOSOPHY
                    ===================================================== */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 25,
                        }}
                        whileInView={{
                            opacity: 1,
                            y: 0,
                        }}
                        viewport={{
                            once: true,
                            amount: 0.2,
                        }}
                        transition={{
                            duration: 0.7,
                            ease: 'easeOut',
                        }}
                        className="
                            lg:col-span-7
                            xl:col-span-7
                            relative
                            flex
                            flex-col
                            justify-center
                            pl-0
                            lg:pl-6
                        "
                    >

                        {/* Giant Watermark Quotation Mark */}

                        <span
                            className="
                                absolute
                                -top-12
                                right-0
                                sm:right-6
                                text-[180px]
                                sm:text-[230px]
                                font-serif
                                font-black
                                text-[#E8F5EB]/60
                                leading-none
                                select-none
                                -z-10
                                pointer-events-none
                            "
                        >
                            “
                        </span>


                        {/* =================================================
                            TOP-RIGHT HANDWRITTEN ANNOTATION
                        ================================================= */}

                        <div
                            className="
                                absolute
                                top-0
                                right-0
                                z-10
                                flex
                                flex-col
                                items-end
                                pointer-events-none
                                select-none
                            "
                        >
                            <div
                                className="
                                    font-['Caveat',cursive]
                                    text-[#55695A]
                                    text-2xl
                                    sm:text-3xl
                                    font-bold
                                    -rotate-6
                                    text-right
                                    leading-tight
                                "
                            >
                                Sustainable
                                <br />
                                Growth
                                <br />
                                Together
                            </div>

                            <svg
                                width="60"
                                height="18"
                                viewBox="0 0 70 20"
                                fill="none"
                                className="
                                    text-[#55695A]
                                    opacity-75
                                    -rotate-6
                                    mr-1
                                    mt-0.5
                                "
                            >
                                <path
                                    d="M5 14 C 25 5, 45 8, 65 15"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>


                        {/* =================================================
                            OVERLINE / LABEL
                        ================================================= */}

                        <div
                            className="
                                flex
                                items-center
                                gap-2.5
                                mb-3
                                sm:mb-4
                            "
                        >
                            <span className="w-7 h-[2px] bg-neutral-800" />

                            <span
                                className="
                                    text-xs
                                    font-bold
                                    tracking-[0.2em]
                                    text-neutral-800
                                    uppercase
                                    font-sans
                                "
                            >
                                OUR LEADERSHIP
                            </span>
                        </div>


                        {/* =================================================
                            HEADLINE
                        ================================================= */}

                        <h2
                            className="
                                font-playfair
                                font-bold
                                text-4xl
                                sm:text-5xl
                                lg:text-[48px]
                                xl:text-[54px]
                                leading-[1.1]
                                tracking-[-0.02em]
                                text-neutral-900
                                max-w-xl
                            "
                        >
                            Every Step Counts
                            <br />

                            <span className="text-[#1A4D2E]">
                                Towards a Better
                            </span>

                            <br />

                            Future
                        </h2>


                        {/* =================================================
                            BODY PARAGRAPH
                        ================================================= */}

                        <p
                            className="
                                mt-5
                                text-neutral-600
                                text-sm
                                sm:text-[15px]
                                leading-relaxed
                                max-w-xl
                                font-sans
                                font-normal
                            "
                        >
                            Innovation isn't just about creating new
                            technology—it's about transforming how we harness
                            and distribute clean energy for generations to
                            come. At SolarEdge Innovation, we're not just
                            building solar solutions; we're architecting a
                            sustainable future where every ray of sunlight
                            becomes a promise of progress.
                        </p>


                        {/* =================================================
                            4 CORE LEADERSHIP PILLARS
                        ================================================= */}

                        <div
                            className="
                                mt-8
                                grid
                                grid-cols-2
                                sm:grid-cols-4
                                gap-4
                                sm:gap-5
                            "
                        >

                            {/* =================================================
                                1. SUSTAINABILITY
                            ================================================= */}

                            <div className="flex flex-col items-start group">

                                <div
                                    className="
                                        w-12
                                        h-12
                                        rounded-2xl
                                        bg-[#E8F5E9]
                                        flex
                                        items-center
                                        justify-center
                                        text-[#1A4D2E]
                                        group-hover:scale-105
                                        transition-transform
                                        shadow-2xs
                                    "
                                >
                                    <Leaf
                                        className="
                                            w-5
                                            h-5
                                            fill-[#1A4D2E]
                                        "
                                    />
                                </div>

                                <div
                                    className="
                                        mt-3
                                        font-bold
                                        text-sm
                                        sm:text-base
                                        text-neutral-900
                                        leading-tight
                                        font-sans
                                    "
                                >
                                    Sustainability
                                </div>

                                <div
                                    className="
                                        text-xs
                                        text-neutral-500
                                        font-medium
                                        mt-0.5
                                    "
                                >
                                    First
                                </div>

                            </div>


                            {/* =================================================
                                2. INNOVATION
                            ================================================= */}

                            <div className="flex flex-col items-start group">

                                <div
                                    className="
                                        w-12
                                        h-12
                                        rounded-2xl
                                        bg-[#E8F5E9]
                                        flex
                                        items-center
                                        justify-center
                                        text-[#1A4D2E]
                                        group-hover:scale-105
                                        transition-transform
                                        shadow-2xs
                                    "
                                >
                                    <Lightbulb className="w-5 h-5" />
                                </div>

                                <div
                                    className="
                                        mt-3
                                        font-bold
                                        text-sm
                                        sm:text-base
                                        text-neutral-900
                                        leading-tight
                                        font-sans
                                    "
                                >
                                    Innovation
                                </div>

                                <div
                                    className="
                                        text-xs
                                        text-neutral-500
                                        font-medium
                                        mt-0.5
                                    "
                                >
                                    Driven
                                </div>

                            </div>


                            {/* =================================================
                                3. PEOPLE
                            ================================================= */}

                            <div className="flex flex-col items-start group">

                                <div
                                    className="
                                        w-12
                                        h-12
                                        rounded-2xl
                                        bg-[#E8F5E9]
                                        flex
                                        items-center
                                        justify-center
                                        text-[#1A4D2E]
                                        group-hover:scale-105
                                        transition-transform
                                        shadow-2xs
                                    "
                                >
                                    <Users className="w-5 h-5" />
                                </div>

                                <div
                                    className="
                                        mt-3
                                        font-bold
                                        text-sm
                                        sm:text-base
                                        text-neutral-900
                                        leading-tight
                                        font-sans
                                    "
                                >
                                    People
                                </div>

                                <div
                                    className="
                                        text-xs
                                        text-neutral-500
                                        font-medium
                                        mt-0.5
                                    "
                                >
                                    Focused
                                </div>

                            </div>


                            {/* =================================================
                                4. LONG-TERM IMPACT
                            ================================================= */}

                            <div className="flex flex-col items-start group">

                                <div
                                    className="
                                        w-12
                                        h-12
                                        rounded-2xl
                                        bg-[#E8F5E9]
                                        flex
                                        items-center
                                        justify-center
                                        text-[#1A4D2E]
                                        group-hover:scale-105
                                        transition-transform
                                        shadow-2xs
                                    "
                                >
                                    <Target className="w-5 h-5" />
                                </div>

                                <div
                                    className="
                                        mt-3
                                        font-bold
                                        text-sm
                                        sm:text-base
                                        text-neutral-900
                                        leading-tight
                                        font-sans
                                    "
                                >
                                    Long-Term
                                </div>

                                <div
                                    className="
                                        text-xs
                                        text-neutral-500
                                        font-medium
                                        mt-0.5
                                    "
                                >
                                    Impact
                                </div>

                            </div>

                        </div>

                    </motion.div>

                </div>

            </div>
        </section>
    );
}