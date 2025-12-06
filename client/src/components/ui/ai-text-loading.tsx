"use client";

/**
 * @author: @kokonutui
 * @description: AI Text Loading
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface AITextLoadingProps {
    texts?: string[];
    className?: string;
    interval?: number;
}

export default function AITextLoading({
    texts = [
        "Thinking...",
        "Processing...",
        "Analyzing...",
        "Computing...",
        "Almost...",
    ],
    className,
    interval = 1500,
}: AITextLoadingProps) {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
        }, interval);

        return () => clearInterval(timer);
    }, [interval, texts.length]);

    return (
        <div className="flex items-center justify-center">
            <motion.div
                className="relative"
                style={{ perspective: "1000px" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentTextIndex}
                        initial={{ 
                            opacity: 0, 
                            scale: 0.8,
                            rotateX: -90,
                            y: 20
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            rotateX: 0,
                            y: 0,
                            backgroundPosition: ["200% center", "-200% center"],
                        }}
                        exit={{ 
                            opacity: 0, 
                            scale: 0.8,
                            rotateX: 90,
                            y: -20
                        }}
                        transition={{
                            opacity: { duration: 0.4, ease: "easeOut" },
                            scale: { duration: 0.4, ease: "easeOut" },
                            rotateX: { duration: 0.4, ease: "easeOut" },
                            y: { duration: 0.4, ease: "easeOut" },
                            backgroundPosition: {
                                duration: 2.5,
                                ease: "linear",
                                repeat: Infinity,
                            },
                        }}
                        className={cn(
                            "flex justify-center font-bold bg-gradient-to-r from-foreground via-muted-foreground to-foreground bg-[length:200%_100%] bg-clip-text text-transparent whitespace-nowrap min-w-max",
                            className
                        )}
                    >
                        {texts[currentTextIndex]}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
