"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: "default" | "duo" | "gradient";
  showShimmer?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = "default", showShimmer = false, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      variant === "duo" && "h-5 shadow-inner",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 transition-all duration-500 ease-out relative",
        variant === "default" && "bg-primary",
        variant === "duo" && "bg-gradient-to-r from-green-500 via-green-400 to-yellow-400 rounded-full",
        variant === "gradient" && "bg-gradient-to-r from-primary via-primary to-yellow-400 rounded-full"
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    >
      {/* Inner highlight for 3D effect */}
      {variant === "duo" && (
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-full" />
      )}
      
      {/* Shimmer effect */}
      {showShimmer && (
        <div className="absolute inset-0 progress-shimmer" />
      )}
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
