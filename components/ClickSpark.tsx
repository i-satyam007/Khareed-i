import React, { useEffect, useRef } from 'react';

interface Spark {
    x: number;
    y: number;
    angle: number;
    startTime: number;
}

const ClickSpark: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sparksRef = useRef<Spark[]>([]);
    const requestRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', resize);
        resize();

        const createSpark = (e: MouseEvent) => {
            const x = e.clientX;
            const y = e.clientY;
            const now = performance.now();

            // Create multiple particles per click
            for (let i = 0; i < 8; i++) {
                sparksRef.current.push({
                    x,
                    y,
                    angle: Math.random() * Math.PI * 2,
                    startTime: now + Math.random() * 50,
                });
            }
        };

        window.addEventListener('click', createSpark);

        const animate = (time: number) => {
            ctx.clearRect(0, 0, width, height);

            const duration = 600; // ms

            sparksRef.current = sparksRef.current.filter(spark => {
                const elapsed = time - spark.startTime;
                if (elapsed >= duration) return false;
                if (elapsed < 0) return true;

                const progress = elapsed / duration;
                const easeOut = 1 - Math.pow(1 - progress, 3);

                const distance = 60 * easeOut;
                const currentX = spark.x + Math.cos(spark.angle) * distance;
                const currentY = spark.y + Math.sin(spark.angle) * distance;

                const alpha = 1 - progress;

                ctx.fillStyle = `rgba(239, 83, 80, ${alpha})`; // kh-red
                ctx.beginPath();
                ctx.arc(currentX, currentY, 2 * (1 - progress), 0, Math.PI * 2);
                ctx.fill();

                // Secondary particle (Purple)
                ctx.fillStyle = `rgba(157, 115, 255, ${alpha})`; // kh-purple
                ctx.beginPath();
                ctx.arc(currentX + Math.cos(spark.angle + 0.5) * 5, currentY + Math.sin(spark.angle + 0.5) * 5, 1.5 * (1 - progress), 0, Math.PI * 2);
                ctx.fill();

                return true;
            });

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('click', createSpark);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[9999]"
            style={{ width: '100%', height: '100%' }}
        />
    );
};

export default ClickSpark;
