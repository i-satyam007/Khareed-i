import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useAnimation } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface IntroSequenceProps {
    onComplete: () => void;
}

const LiquidBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        const render = () => {
            time += 0.005;
            const width = canvas.width;
            const height = canvas.height;

            // Clear with dark background
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, width, height);

            // Create liquid effect using sine waves
            // Colors: #EF5350 (Red), #9D73FF (Purple)

            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#0a0a0a');
            gradient.addColorStop(0.5, '#18181b');
            gradient.addColorStop(1, '#0a0a0a');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Draw flowing blobs
            const drawBlob = (x: number, y: number, radius: number, color: string, t: number) => {
                ctx.beginPath();
                ctx.fillStyle = color;
                ctx.filter = 'blur(60px)';
                ctx.arc(
                    x + Math.sin(t) * 50,
                    y + Math.cos(t * 0.8) * 50,
                    radius + Math.sin(t * 1.5) * 20,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                ctx.filter = 'none';
            };

            // Purple Blob
            drawBlob(width * 0.3, height * 0.4, 200, 'rgba(157, 115, 255, 0.15)', time);

            // Red Blob
            drawBlob(width * 0.7, height * 0.6, 250, 'rgba(239, 83, 80, 0.1)', time + 2);

            // Center Mix
            drawBlob(width * 0.5, height * 0.5, 150, 'rgba(157, 115, 255, 0.1)', time * 0.5 + 4);

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

export default function IntroSequence({ onComplete }: IntroSequenceProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Phase 1: Anticipation (0% - 15%)
    const bagShake = useTransform(scrollYProgress, [0, 0.05, 0.1, 0.15], [0, -5, 5, 0]);
    const bagGlow = useTransform(scrollYProgress, [0, 0.15], ["drop-shadow(0 0 0px rgba(157, 115, 255, 0))", "drop-shadow(0 0 30px rgba(157, 115, 255, 0.6))"]);

    // Phase 2: The Release (15% - 100%)
    const bagY = useTransform(scrollYProgress, [0.15, 1], ["0vh", "40vh"]);
    const bagScale = useTransform(scrollYProgress, [0.15, 1], [1, 0.8]);

    // Items Animation
    // Start appearing after 15%, fully out by 60%, spread by 100%
    const itemsProgress = useTransform(scrollYProgress, [0.15, 0.8], [0, 1]);

    // Item Transforms
    const itemScale = useTransform(itemsProgress, [0, 0.5], [0, 1]);
    const itemOpacity = useTransform(itemsProgress, [0, 0.2], [0, 1]);

    // Trajectories
    // Shirt: Top-Left
    const shirtX = useTransform(itemsProgress, [0, 1], [0, -200]);
    const shirtY = useTransform(itemsProgress, [0, 1], [0, -250]);
    const shirtRotate = useTransform(itemsProgress, [0, 1], [0, -15]);

    // Apple: Top-Right
    const appleX = useTransform(itemsProgress, [0, 1], [0, 200]);
    const appleY = useTransform(itemsProgress, [0, 1], [0, -250]);
    const appleRotate = useTransform(itemsProgress, [0, 1], [0, 15]);

    // Books: Center-Up
    const bookY = useTransform(itemsProgress, [0, 1], [0, -350]);
    const bookRotate = useTransform(itemsProgress, [0, 1], [0, 5]);

    // Calculator: Mid-Left
    const calcX = useTransform(itemsProgress, [0, 1], [0, -300]);
    const calcY = useTransform(itemsProgress, [0, 1], [0, -50]);
    const calcRotate = useTransform(itemsProgress, [0, 1], [0, -30]);

    // Dumbell: Mid-Right
    const dumbellX = useTransform(itemsProgress, [0, 1], [0, 300]);
    const dumbellY = useTransform(itemsProgress, [0, 1], [0, -50]);
    const dumbellRotate = useTransform(itemsProgress, [0, 1], [0, 30]);

    // Completion Check
    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            if (latest >= 0.99) {
                // Optional: Auto-complete on scroll end? 
                // User requested "Upon scroll completion OR Skip click"
                // Let's give it a slight delay so they see the final state
                setTimeout(onComplete, 500);
            }
        });
        return () => unsubscribe();
    }, [scrollYProgress, onComplete]);

    return (
        <div ref={containerRef} className="relative w-full h-[300vh] bg-kh-light">
            <LiquidBackground />

            {/* Sticky Container for Animation */}
            <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">

                {/* Items Container - Behind Bag */}
                <div className="absolute z-10 flex items-center justify-center">
                    {/* Shirt */}
                    <motion.img
                        src="/assets/item-shirt.png"
                        style={{ x: shirtX, y: shirtY, scale: itemScale, opacity: itemOpacity, rotate: shirtRotate }}
                        className="absolute w-32 h-auto object-contain"
                    />
                    {/* Apple */}
                    <motion.img
                        src="/assets/item-apple.png"
                        style={{ x: appleX, y: appleY, scale: itemScale, opacity: itemOpacity, rotate: appleRotate }}
                        className="absolute w-24 h-auto object-contain"
                    />
                    {/* Books */}
                    <motion.img
                        src="/assets/item-book.png"
                        style={{ y: bookY, scale: itemScale, opacity: itemOpacity, rotate: bookRotate }}
                        className="absolute w-28 h-auto object-contain"
                    />
                    {/* Calculator */}
                    <motion.img
                        src="/assets/item-calculator.png"
                        style={{ x: calcX, y: calcY, scale: itemScale, opacity: itemOpacity, rotate: calcRotate }}
                        className="absolute w-24 h-auto object-contain"
                    />
                    {/* Dumbell */}
                    <motion.img
                        src="/assets/item-dumbell.png"
                        style={{ x: dumbellX, y: dumbellY, scale: itemScale, opacity: itemOpacity, rotate: dumbellRotate }}
                        className="absolute w-32 h-auto object-contain"
                    />
                </div>

                {/* Main Bag - In Front */}
                <motion.div
                    style={{ x: bagShake, y: bagY, scale: bagScale, filter: bagGlow }}
                    className="relative z-20"
                >
                    <img src="/assets/shopping-bag.png" alt="Shopping Bag" className="w-64 md:w-80 h-auto object-contain drop-shadow-2xl" />
                </motion.div>

                {/* Skip Button */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    onClick={onComplete}
                    className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white text-sm font-medium hover:bg-white/10 transition-colors group"
                >
                    Skip to Home
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                {/* Scroll Indicator */}
                <motion.div
                    style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 text-xs animate-bounce"
                >
                    Scroll to Explore
                </motion.div>
            </div>
        </div>
    );
}
