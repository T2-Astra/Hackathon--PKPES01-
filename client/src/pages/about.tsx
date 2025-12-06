"use client";

/**
 * @description: About PolyLearnHub - Bento Grid Layout
 * @customized: For PolyLearnHub student platform
 */

import { cn } from "@/lib/utils";
import {
    BookOpen,
    Users,
    GraduationCap,
    Building2,
    TrendingUp,
    CheckCircle2,
    Clock,
    Sparkles,
    Zap,
    ArrowUpRight,
    MessageSquare,
    Upload,
    Search,
    Star,
    HelpCircle,
    Shield,
    FileText,
    Video,
} from "lucide-react";
import {
    motion,
    useMotionValue,
    useTransform,
    type Variants,
} from "framer-motion";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SmoothTab from "@/components/ui/smooth-tab";
import BasicAccordion from "@/components/ui/basic-accordion";

interface BentoItem {
    id: string;
    title: string;
    description: string;
    href?: string;
    feature?:
        | "counter"
        | "timeline"
        | "spotlight"
        | "metrics"
        | "departments";
    spotlightItems?: string[];
    timeline?: Array<{ year: string; event: string }>;
    metrics?: Array<{
        label: string;
        value: number;
        suffix?: string;
        color?: string;
    }>;
    statistic?: {
        value: string;
        label: string;
        start?: number;
        end?: number;
        suffix?: string;
    };
    size?: "sm" | "md" | "lg";
    className?: string;
}

const bentoItems: BentoItem[] = [
    {
        id: "main",
        title: "Empowering Polytechnic Students",
        description:
            "PolyLearnHub is your comprehensive academic resource platform designed specifically for Maharashtra Polytechnic students. Access thousands of study materials, question papers, and resources.",
        href: "/search",
        feature: "spotlight",
        spotlightItems: [
            "Previous year question papers",
            "Comprehensive study notes",
            "AI-powered study assistant",
            "7 engineering departments",
            "Community-driven content",
        ],
        size: "lg",
        className: "col-span-2 row-span-1 md:col-span-2 md:row-span-1",
    },
    {
        id: "departments",
        title: "Interactive Departments",
        description:
            "Explore our engineering departments with interactive tabs. Click through different streams to see specialized resources.",
        feature: "departments",
        size: "md",
        className: "col-span-2 row-span-1 col-start-1 col-end-3",
    },
    {
        id: "features",
        title: "Platform Features",
        description:
            "Everything you need for successful polytechnic education in one comprehensive platform.",
        href: "/chatbot",
        feature: "metrics",
        metrics: [
            { label: "Study Resources", value: 95, suffix: "%", color: "emerald" },
            { label: "AI Assistance", value: 100, suffix: "%", color: "blue" },
            { label: "Free Access", value: 100, suffix: "%", color: "violet" },
        ],
        size: "md",
        className: "col-span-1 row-span-1",
    },
    {
        id: "timeline",
        title: "Platform Development",
        description:
            "Building the future of polytechnic education with continuous development and upcoming features.",
        href: "#",
        feature: "timeline",
        timeline: [
            { year: "Sep 2025", event: "Project Initiated & Planning" },
            { year: "Oct 2025", event: "Core Platform Development" },
            { year: "Nov 2025", event: "AI Study Assistant Integration" },
            { year: "Dec 2025", event: "Beta Launch & Testing Phase" },
        ],
        size: "sm",
        className: "col-span-1 row-span-1",
    },
];

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.3,
        },
    },
};

const SpotlightFeature = ({ items }: { items: string[] }) => {
    return (
        <ul className="mt-2 space-y-1.5">
            {items.map((item, index) => (
                <motion.li
                    key={`spotlight-${item.toLowerCase().replace(/\s+/g, "-")}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-2"
                >
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                        {item}
                    </span>
                </motion.li>
            ))}
        </ul>
    );
};

const CounterAnimation = ({
    start,
    end,
    suffix = "",
}: {
    start: number;
    end: number;
    suffix?: string;
}) => {
    const [count, setCount] = useState(start);

    useEffect(() => {
        const duration = 2000;
        const frameRate = 1000 / 60;
        const totalFrames = Math.round(duration / frameRate);

        let currentFrame = 0;
        const counter = setInterval(() => {
            currentFrame++;
            const progress = currentFrame / totalFrames;
            const easedProgress = 1 - (1 - progress) ** 3;
            const current = start + (end - start) * easedProgress;

            setCount(Math.min(current, end));

            if (currentFrame === totalFrames) {
                clearInterval(counter);
            }
        }, frameRate);

        return () => clearInterval(counter);
    }, [start, end]);

    return (
        <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">
                {count.toFixed(1).replace(/\.0$/, "")}
            </span>
            <span className="text-xl font-medium text-foreground">
                {suffix}
            </span>
        </div>
    );
};

const DepartmentsFeature = () => {
    return (
        <div className="mt-4 h-[280px]">
            <SmoothTab />
        </div>
    );
};

const TimelineFeature = ({
    timeline,
}: {
    timeline: Array<{ year: string; event: string }>;
}) => {
    return (
        <div className="mt-3 relative">
            <div className="absolute top-0 bottom-0 left-[9px] w-[2px] bg-border" />
            {timeline.map((item, index) => (
                <motion.div
                    key={`timeline-${item.year}-${item.event.toLowerCase().replace(/\s+/g, "-")}`}
                    className="flex gap-3 mb-3 relative"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 * index }}
                >
                    <div className="w-5 h-5 rounded-full bg-background border-2 border-primary flex-shrink-0 z-10 mt-0.5" />
                    <div>
                        <div className="text-sm font-medium text-foreground">
                            {item.year}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {item.event}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

const MetricsFeature = ({
    metrics,
}: {
    metrics: Array<{
        label: string;
        value: number;
        suffix?: string;
        color?: string;
    }>;
}) => {
    const getColorClass = (color = "emerald") => {
        const colors = {
            emerald: "bg-emerald-500",
            blue: "bg-blue-500",
            violet: "bg-violet-500",
            amber: "bg-amber-500",
            rose: "bg-rose-500",
        };
        return colors[color as keyof typeof colors] || colors.emerald;
    };

    return (
        <div className="mt-3 space-y-3">
            {metrics.map((metric, index) => (
                <motion.div
                    key={`metric-${metric.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className="space-y-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 * index }}
                >
                    <div className="flex justify-between items-center text-sm">
                        <div className="text-foreground font-medium flex items-center gap-1.5">
                            {metric.label === "Study Resources" && (
                                <BookOpen className="w-3.5 h-3.5" />
                            )}
                            {metric.label === "AI Assistance" && (
                                <Sparkles className="w-3.5 h-3.5" />
                            )}
                            {metric.label === "Free Access" && (
                                <Star className="w-3.5 h-3.5" />
                            )}
                            {metric.label}
                        </div>
                        <div className="text-foreground font-semibold">
                            {metric.value}
                            {metric.suffix}
                        </div>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full rounded-full ${getColorClass(metric.color)}`}
                            initial={{ width: 0 }}
                            animate={{
                                width: `${Math.min(100, metric.value)}%`,
                            }}
                            transition={{
                                duration: 1.2,
                                ease: "easeOut",
                                delay: 0.15 * index,
                            }}
                        />
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

const BentoCard = ({ item }: { item: BentoItem }) => {
    const [isHovered, setIsHovered] = useState(false);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [2, -2]);
    const rotateY = useTransform(x, [-100, 100], [-2, 2]);

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct * 100);
        y.set(yPct * 100);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
        setIsHovered(false);
    }

    return (
        <motion.div
            variants={fadeInUp}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-full"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={handleMouseLeave}
            onMouseMove={handleMouseMove}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
        >
            {item.href ? (
                <Link
                    href={item.href}
                    className={`
                        group relative flex flex-col gap-4 h-full rounded-xl p-5
                        bg-gradient-to-b from-card/60 via-card/40 to-card/30 
                        border border-border/60
                        before:absolute before:inset-0 before:rounded-xl
                        before:bg-gradient-to-b before:from-background/10 before:via-background/20 before:to-transparent 
                        before:opacity-100 before:transition-opacity before:duration-500
                        after:absolute after:inset-0 after:rounded-xl after:bg-card/70
                        after:z-[-1] after:blur-xl
                        backdrop-blur-xl backdrop-saturate-150
                        shadow-lg hover:shadow-xl
                        hover:border-border
                        hover:backdrop-blur-2xl
                        hover:bg-gradient-to-br hover:from-card/50 hover:via-card/40 hover:to-card/30
                        transition-all duration-500 ease-out ${item.className}
                    `}
                >
                    <div
                        className="relative z-10 flex flex-col gap-3 h-full"
                        style={{ transform: "translateZ(20px)" }}
                    >
                        <div className="space-y-2 flex-1 flex flex-col">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                                    {item.title}
                                </h3>
                                <div className="text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                    <ArrowUpRight className="h-5 w-5" />
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground tracking-tight">
                                {item.description}
                            </p>

                            {/* Feature specific content */}
                            {item.feature === "spotlight" && item.spotlightItems && (
                                <SpotlightFeature items={item.spotlightItems} />
                            )}

                            {item.feature === "counter" && item.statistic && (
                                <div className="mt-auto pt-3">
                                    <CounterAnimation
                                        start={item.statistic.start || 0}
                                        end={item.statistic.end || 100}
                                        suffix={item.statistic.suffix}
                                    />
                                </div>
                            )}

                            {item.feature === "departments" && (
                                <DepartmentsFeature />
                            )}

                            {item.feature === "timeline" && item.timeline && (
                                <TimelineFeature timeline={item.timeline} />
                            )}

                            {item.feature === "metrics" && item.metrics && (
                                <MetricsFeature metrics={item.metrics} />
                            )}
                        </div>
                    </div>
                </Link>
            ) : (
                <div
                    className={`
                        group relative flex flex-col gap-4 h-full rounded-xl p-5
                        bg-gradient-to-b from-card/60 via-card/40 to-card/30 
                        border border-border/60
                        before:absolute before:inset-0 before:rounded-xl
                        before:bg-gradient-to-b before:from-background/10 before:via-background/20 before:to-transparent 
                        before:opacity-100 before:transition-opacity before:duration-500
                        after:absolute after:inset-0 after:rounded-xl after:bg-card/70
                        after:z-[-1] after:blur-xl
                        backdrop-blur-xl backdrop-saturate-150
                        shadow-lg hover:shadow-xl
                        hover:border-border
                        hover:backdrop-blur-2xl
                        hover:bg-gradient-to-br hover:from-card/50 hover:via-card/40 hover:to-card/30
                        transition-all duration-500 ease-out ${item.className}
                    `}
                >
                    <div
                        className="relative z-10 flex flex-col gap-3 h-full"
                        style={{ transform: "translateZ(20px)" }}
                    >
                        <div className="space-y-2 flex-1 flex flex-col">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                                    {item.title}
                                </h3>
                                <div className="text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                    <ArrowUpRight className="h-5 w-5" />
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground tracking-tight">
                                {item.description}
                            </p>

                            {/* Feature specific content */}
                            {item.feature === "spotlight" && item.spotlightItems && (
                                <SpotlightFeature items={item.spotlightItems} />
                            )}

                            {item.feature === "counter" && item.statistic && (
                                <div className="mt-auto pt-3">
                                    <CounterAnimation
                                        start={item.statistic.start || 0}
                                        end={item.statistic.end || 100}
                                        suffix={item.statistic.suffix}
                                    />
                                </div>
                            )}

                            {item.feature === "departments" && (
                                <DepartmentsFeature />
                            )}

                            {item.feature === "timeline" && item.timeline && (
                                <TimelineFeature timeline={item.timeline} />
                            )}

                            {item.feature === "metrics" && item.metrics && (
                                <MetricsFeature metrics={item.metrics} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default function About() {
    return (
        <div className="min-h-screen bg-background md:pl-16">
            {/* Header */}
            <div className="border-b border-border bg-card/30 backdrop-blur-sm">
                <div className="container mx-auto px-4 lg:px-8 py-6 pt-16 md:pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">About PolyLearnHub</h1>
                                <p className="text-sm text-muted-foreground">Your comprehensive polytechnic education platform</p>
                            </div>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/">
                                Back to Home
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bento Grid Section */}
            <section className="py-12">
                <div className="container mx-auto px-4 lg:px-8">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid gap-6"
                    >
                        <div className="grid md:grid-cols-3 gap-6">
                            <motion.div
                                variants={fadeInUp}
                                className="md:col-span-2"
                            >
                                <BentoCard item={bentoItems[0]} />
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                className="md:col-span-1"
                            >
                                <BentoCard item={bentoItems[2]} />
                            </motion.div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <motion.div
                                variants={fadeInUp}
                                className="md:col-span-1"
                            >
                                <BentoCard item={bentoItems[1]} />
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                className="md:col-span-1"
                            >
                                <BentoCard item={bentoItems[3]} />
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-12 border-t border-border">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Everything you need to know about PolyLearnHub and how it can help you succeed in your polytechnic studies.
                            </p>
                        </div>
                        
                        <Card>
                            <CardContent className="p-6">
                                <BasicAccordion 
                                    items={[
                                        {
                                            id: "what-is-polylearn",
                                            title: "What is PolyLearnHub?",
                                            content: (
                                                <div className="space-y-3">
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        PolyLearnHub is a comprehensive academic resource platform designed specifically for Maharashtra Polytechnic students. We provide access to previous year question papers, study notes, AI-powered study assistance, and educational videos across 7 engineering departments.
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-primary">
                                                        <GraduationCap className="w-4 h-4" />
                                                        <span>Built by students, for students</span>
                                                    </div>
                                                </div>
                                            )
                                        },
                                        {
                                            id: "how-to-get-started",
                                            title: "How do I get started with PolyLearnHub?",
                                            content: (
                                                <div className="space-y-3">
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        Simply sign up for a free account, select your department, and start exploring resources. You can search for specific subjects, browse by department, or use our AI chatbot for personalized study assistance.
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-primary">
                                                        <Sparkles className="w-4 h-4" />
                                                        <span>Free registration with instant access</span>
                                                    </div>
                                                </div>
                                            )
                                        },
                                        {
                                            id: "departments-covered",
                                            title: "Which departments and subjects are covered?",
                                            content: (
                                                <div className="space-y-3">
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        We cover all 7 major polytechnic departments: Computer Engineering, Mechanical Engineering, Civil Engineering, Electrical Engineering, Electronics Engineering, Information Technology, and Artificial Intelligence & Machine Learning.
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-primary">
                                                        <Building2 className="w-4 h-4" />
                                                        <span>Complete curriculum coverage for all streams</span>
                                                    </div>
                                                </div>
                                            )
                                        },
                                        {
                                            id: "ai-features",
                                            title: "What AI features does PolyLearnHub offer?",
                                            content: (
                                                <div className="space-y-3">
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        Our AI-powered features include an intelligent chatbot for study assistance, automated mock test generation, file analysis and summarization, and personalized learning recommendations based on your study patterns.
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-primary">
                                                        <Zap className="w-4 h-4" />
                                                        <span>Advanced AI technology for enhanced learning</span>
                                                    </div>
                                                </div>
                                            )
                                        },
                                        {
                                            id: "upload-contribute",
                                            title: "Can I upload and contribute my own study materials?",
                                            content: (
                                                <div className="space-y-3">
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        Yes! We encourage students to contribute to our community by uploading their own notes, solved papers, and study materials. All uploads go through a quality review process to ensure they meet our educational standards.
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-primary">
                                                        <Upload className="w-4 h-4" />
                                                        <span>Build the community together</span>
                                                    </div>
                                                </div>
                                            )
                                        },
                                        {
                                            id: "video-content",
                                            title: "Are there video lectures available?",
                                            content: (
                                                <div className="space-y-3">
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        Yes, we provide curated educational video content with our AI-powered study assistant. You can ask questions about the videos, get explanations of complex topics, and receive personalized study recommendations.
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-primary">
                                                        <Video className="w-4 h-4" />
                                                        <span>Interactive video learning experience</span>
                                                    </div>
                                                </div>
                                            )
                                        },
                                        {
                                            id: "mobile-access",
                                            title: "Can I access PolyLearnHub on my mobile device?",
                                            content: (
                                                <div className="space-y-3">
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        Absolutely! PolyLearnHub is fully responsive and works seamlessly on all devices - smartphones, tablets, and desktops. Study anywhere, anytime with the same great experience.
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-primary">
                                                        <Star className="w-4 h-4" />
                                                        <span>Study on-the-go with mobile optimization</span>
                                                    </div>
                                                </div>
                                            )
                                        },
                                        {
                                            id: "data-security",
                                            title: "How secure is my data on PolyLearnHub?",
                                            content: (
                                                <div className="space-y-3">
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        We take data security seriously. All user data is encrypted, we follow industry-standard security practices, and we never share your personal information with third parties. Your study progress and uploaded materials are completely private.
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-primary">
                                                        <Shield className="w-4 h-4" />
                                                        <span>Your privacy and security are our priority</span>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    ]}
                                    allowMultiple={true}
                                    defaultExpandedIds={["what-is-polylearn"]}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-12 border-t border-border">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="text-center space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold text-foreground">Ready to Start Learning?</h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Join thousands of polytechnic students who are already using PolyLearnHub to excel in their studies.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" className="px-8">
                                <Link href="/search">
                                    <Search className="w-4 h-4 mr-2" />
                                    Explore Resources
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="px-8">
                                <Link href="/chatbot">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Try AI Assistant
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}