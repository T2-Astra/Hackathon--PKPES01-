"use client";

/**
 * Smooth Drawer Component for PolyLearnHub
 * Animated drawer with smooth transitions
 */

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { motion } from "framer-motion";
import { GraduationCap, Sparkles } from "lucide-react";

interface DrawerDemoProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  tertiaryButtonText?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  onTertiaryAction?: () => void;
  features?: string[];
  triggerText?: string;
  triggerVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  triggerClassName?: string;
  feature1?: string;
  feature2?: string;
  feature3?: string;
  feature4?: string;
}

const drawerVariants = {
  hidden: {
    y: "100%",
    opacity: 0,
    rotateX: 5,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  visible: {
    y: 0,
    opacity: 1,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8,
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    y: 20,
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
};

export default function SmoothDrawer({
  title = "PolyLearnHub",
  description = "AI-powered MCQ test generator with OpenRouter integration. Get instant, high-quality multiple choice questions on any topic.",
  primaryButtonText = "Start Testing",
  secondaryButtonText = "Maybe Later",
  tertiaryButtonText,
  onPrimaryAction,
  onSecondaryAction,
  onTertiaryAction,
  features = [
    "AI-Generated Questions",
    "Multiple Difficulty Levels",
    "Instant Results & Grading",
    "Voice & MCQ Modes"
  ],
  triggerText = "Learn More",
  triggerVariant = "outline",
  triggerClassName,
  feature1,
  feature2,
  feature3,
  feature4,
}: DrawerDemoProps) {
  const handlePrimaryClick = () => {
    onPrimaryAction?.();
  };

  const handleSecondaryClick = () => {
    onSecondaryAction?.();
  };

  const handleTertiaryClick = () => {
    onTertiaryAction?.();
  };

  // Use individual feature props if provided, otherwise use the features array
  const displayFeatures = feature1 || feature2 || feature3 || feature4 
    ? [feature1, feature2, feature3, feature4].filter(Boolean)
    : features;

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button 
          variant={triggerVariant}
          className={triggerClassName || "gap-2"}
        >
          <Sparkles className="w-4 h-4" />
          {triggerText}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-w-fit mx-auto p-6 rounded-2xl shadow-xl">
        <motion.div
          variants={drawerVariants as any}
          initial="hidden"
          animate="visible"
          className="mx-auto w-full max-w-[340px] space-y-6"
        >
          <motion.div variants={itemVariants as any}>
            <DrawerHeader className="px-0 space-y-2.5">
              <DrawerTitle className="text-2xl font-semibold flex items-center gap-2.5 tracking-tighter">
                <motion.div variants={itemVariants as any}>
                  <div className="p-1.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 shadow-inner">
                    <GraduationCap className="w-8 h-8 text-primary" />
                  </div>
                </motion.div>
                <motion.span variants={itemVariants as any}>
                  {title}
                </motion.span>
              </DrawerTitle>
              <motion.div variants={itemVariants as any}>
                <DrawerDescription className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 tracking-tighter">
                  {description}
                </DrawerDescription>
              </motion.div>
            </DrawerHeader>
          </motion.div>

          <motion.div variants={itemVariants as any}>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Features:</h4>
              <ul className="space-y-2">
                {displayFeatures.map((feature, index) => (
                  <motion.li
                    key={index}
                    variants={itemVariants as any}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div variants={itemVariants as any}>
            <DrawerFooter className="flex flex-col gap-3 px-0">
              {/* Primary and Tertiary buttons in the same row */}
              <div className="flex gap-3">
                <DrawerClose asChild>
                  <Button
                    onClick={handlePrimaryClick}
                    className="group flex-1 relative overflow-hidden h-11 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-semibold tracking-wide shadow-lg shadow-primary/20 transition-all duration-500 hover:shadow-xl hover:shadow-primary/30"
                  >
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%]"
                      whileHover={{
                        x: ["-200%", "200%"],
                      }}
                      transition={{
                        duration: 1.5,
                        ease: "easeInOut",
                        repeat: 0,
                      }}
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="relative flex items-center gap-2 tracking-tighter"
                    >
                      {primaryButtonText}
                      <motion.div
                        animate={{
                          rotate: [0, 15, -15, 0],
                          y: [0, -2, 2, 0],
                        }}
                        transition={{
                          duration: 2,
                          ease: "easeInOut",
                          repeat: Number.POSITIVE_INFINITY,
                          repeatDelay: 1,
                        }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                    </motion.div>
                  </Button>
                </DrawerClose>
                {tertiaryButtonText && (
                  <DrawerClose asChild>
                    <Button
                      onClick={handleTertiaryClick}
                      className="group flex-1 relative overflow-hidden h-11 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-semibold tracking-wide shadow-lg shadow-primary/20 transition-all duration-500 hover:shadow-xl hover:shadow-primary/30"
                    >
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%]"
                        whileHover={{
                          x: ["-200%", "200%"],
                        }}
                        transition={{
                          duration: 1.5,
                          ease: "easeInOut",
                          repeat: 0,
                        }}
                      />
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="relative flex items-center gap-2 tracking-tighter"
                      >
                        {tertiaryButtonText}
                      </motion.div>
                    </Button>
                  </DrawerClose>
                )}
              </div>
              {/* Secondary button (Close) on its own row */}
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  onClick={handleSecondaryClick}
                  className="w-full h-11 rounded-xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-sm font-semibold transition-colors tracking-tighter"
                >
                  {secondaryButtonText}
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </motion.div>
        </motion.div>
      </DrawerContent>
    </Drawer>
  );
}
