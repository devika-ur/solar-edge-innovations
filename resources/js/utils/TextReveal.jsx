import { useEffect } from "react";
import { gsap } from "gsap";

const TextReveal = ({ lines }) => {
    useEffect(() => {
        gsap.from(".line span", {
            y: 100,
            duration: 1.8,
            ease: "power4.out",
            delay: 1,
            skewY: 7,
            stagger: { amount: 0.3 },
        });
    }, []);

    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center bg-black text-white font-roboto">
            {
                lines.map((text, index) => (
                    <div
                        key={index}
                        className="line w-4/5 h-[70px] relative overflow-hidden"
                    >
                        <span className="absolute text-5xl leading-[4.2rem]">{text}</span>
                    </div>
                ))
            }
        </div>
    );
};

export default TextReveal;
