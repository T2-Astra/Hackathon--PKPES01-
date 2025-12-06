import { cn } from "@/lib/utils";

interface ShimmerTextProps {
  text: string;
  className?: string;
}

export const ShimmerText: React.FC<ShimmerTextProps> = ({ text, className = '' }) => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative overflow-hidden">
        <h1 
          className={cn(
            "bg-gradient-to-r from-primary via-chart-1 to-primary bg-[length:200%_100%] bg-clip-text text-transparent font-sans text-2xl font-semibold mb-2 tracking-wide animate-shimmer",
            className
          )}
        >
          {text}
        </h1>
      </div>
    </div>
  );
};
