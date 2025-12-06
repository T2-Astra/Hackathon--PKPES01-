"use client";

/**
 * @author: @dorian_baffier
 * @description: Card Flip
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { cn } from "@/lib/utils";
import { ArrowRight, Repeat2 } from "lucide-react";
import { useState } from "react";

export interface CardFlipProps {
    title?: string;
    subtitle?: string;
    description?: string;
    features?: string[];
    icon?: React.ReactNode;
    frontSubtitle?: string;
}

export default function CardFlip({
    title = "Design Systems",
    subtitle = "Explore the fundamentals",
    description = "Dive deep into the world of modern UI/UX design.",
    features = ["UI/UX", "Modern Design", "Tailwind CSS", "Kokonut UI"],
    icon,
    frontSubtitle,
}: CardFlipProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div
            className="relative w-full h-[200px] group [perspective:2000px] transition-transform duration-300 hover:scale-[1.02]"
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
        >
            <div
                className={cn(
                    "relative w-full h-full",
                    "[transform-style:preserve-3d]",
                    "transition-all duration-700",
                    isFlipped
                        ? "[transform:rotateY(180deg)]"
                        : "[transform:rotateY(0deg)]"
                )}
            >
                {/* Front of card */}
                <div
                    className={cn(
                        "absolute inset-0 w-full h-full",
                        "[backface-visibility:hidden] [transform:rotateY(0deg)]",
                        "overflow-hidden rounded-lg",
                        "bg-card border border-border",
                        "shadow-sm",
                        "transition-all duration-300",
                        "group-hover:shadow-lg group-hover:bg-accent/50",
                        isFlipped ? "opacity-0" : "opacity-100"
                    )}
                >
                    <div className="p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                                {icon}
                            </div>
                            <div className="flex items-center text-emerald-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1">
                                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                                    <polyline points="16 7 22 7 22 13"></polyline>
                                </svg>
                                <span className="text-xs font-medium">{subtitle}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-bold text-foreground font-sans" data-testid={`stats-${description.toLowerCase().replace(/\s+/g, '-')}`}>
                                {title}
                            </div>
                            <div className="text-sm text-foreground font-medium">{description}</div>
                            <div className="text-xs text-muted-foreground">
                                {frontSubtitle || (features[0] && features.length > 0 ? 
                                    (description === "Departments" ? "Engineering streams available" :
                                     description === "Question Papers" ? "Previous year papers" :
                                     description === "Study Notes" ? "Comprehensive materials" :
                                     description === "Mock Tests" ? "AI-powered test generation" : "")
                                    : "")}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back of card */}
                <div
                    className={cn(
                        "absolute inset-0 w-full h-full",
                        "[backface-visibility:hidden] [transform:rotateY(180deg)]",
                        "p-4 rounded-lg",
                        "bg-card border border-border",
                        "shadow-sm",
                        "flex flex-col",
                        "transition-all duration-300",
                        "group-hover:shadow-lg group-hover:bg-accent/50",
                        !isFlipped ? "opacity-0" : "opacity-100",
                        "overflow-hidden"
                    )}
                >
                    <div className="space-y-2 h-full flex flex-col">
                        <div className="space-y-0.5">
                            <h3 className="text-base font-semibold text-foreground">
                                {description}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Available features:
                            </p>
                        </div>

                        <div className="space-y-1.5 flex-1 overflow-y-auto">
                            {features.map((feature, index) => (
                                <div
                                    key={feature}
                                    className="flex items-center gap-2 text-xs text-foreground transition-all duration-500"
                                    style={{
                                        transform: isFlipped
                                            ? "translateX(0)"
                                            : "translateX(-10px)",
                                        opacity: isFlipped ? 1 : 0,
                                        transitionDelay: `${
                                            index * 100 + 200
                                        }ms`,
                                    }}
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                    <span className="line-clamp-1">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}


