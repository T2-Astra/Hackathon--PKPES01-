import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Skill {
  name: string;
  currentLevel: number; // 0-100
  targetLevel?: number;
}

interface SkillRadarChartProps {
  skills: Skill[];
  className?: string;
}

export default function SkillRadarChart({ skills, className }: SkillRadarChartProps) {
  const maxSkills = 8;
  const displaySkills = skills.slice(0, maxSkills);
  const centerX = 150;
  const centerY = 150;
  const maxRadius = 100;
  const levels = [20, 40, 60, 80, 100];

  // Calculate points for the radar chart
  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / displaySkills.length - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  // Generate polygon points for current skills
  const currentPoints = displaySkills
    .map((skill, i) => {
      const point = getPoint(i, skill.currentLevel);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  // Generate polygon points for target skills
  const targetPoints = displaySkills
    .map((skill, i) => {
      const point = getPoint(i, skill.targetLevel || 100);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  const averageLevel = Math.round(
    displaySkills.reduce((sum, s) => sum + s.currentLevel, 0) / displaySkills.length
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            Skill Overview
          </CardTitle>
          <Badge variant="secondary" className="gap-1">
            <TrendingUp className="w-3 h-3" />
            Avg: {averageLevel}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative">
          <svg viewBox="0 0 300 300" className="w-full max-w-[300px] mx-auto">
            {/* Background circles */}
            {levels.map((level) => (
              <circle
                key={level}
                cx={centerX}
                cy={centerY}
                r={(level / 100) * maxRadius}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-muted-foreground/20"
              />
            ))}

            {/* Axis lines */}
            {displaySkills.map((_, i) => {
              const point = getPoint(i, 100);
              return (
                <line
                  key={i}
                  x1={centerX}
                  y1={centerY}
                  x2={point.x}
                  y2={point.y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-muted-foreground/20"
                />
              );
            })}

            {/* Target area (lighter) */}
            <polygon
              points={targetPoints}
              fill="currentColor"
              fillOpacity="0.1"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 2"
              className="text-muted-foreground"
            />

            {/* Current skills area */}
            <polygon
              points={currentPoints}
              fill="currentColor"
              fillOpacity="0.3"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
            />

            {/* Data points */}
            {displaySkills.map((skill, i) => {
              const point = getPoint(i, skill.currentLevel);
              return (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="currentColor"
                  className="text-primary"
                />
              );
            })}

            {/* Labels */}
            {displaySkills.map((skill, i) => {
              const labelPoint = getPoint(i, 120);
              const angle = (Math.PI * 2 * i) / displaySkills.length - Math.PI / 2;
              const textAnchor = 
                Math.abs(Math.cos(angle)) < 0.1 ? "middle" :
                Math.cos(angle) > 0 ? "start" : "end";
              
              return (
                <text
                  key={i}
                  x={labelPoint.x}
                  y={labelPoint.y}
                  textAnchor={textAnchor}
                  dominantBaseline="middle"
                  className="text-[10px] fill-muted-foreground font-medium"
                >
                  {skill.name.length > 12 ? skill.name.slice(0, 10) + "..." : skill.name}
                </text>
              );
            })}

            {/* Center label */}
            <text
              x={centerX}
              y={centerY - 8}
              textAnchor="middle"
              className="text-2xl font-bold fill-primary"
            >
              {averageLevel}%
            </text>
            <text
              x={centerX}
              y={centerY + 12}
              textAnchor="middle"
              className="text-[10px] fill-muted-foreground"
            >
              Overall
            </text>
          </svg>
        </div>

        {/* Skill list */}
        <div className="mt-4 space-y-2">
          {displaySkills.map((skill, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground truncate flex-1">{skill.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${skill.currentLevel}%` }}
                  />
                </div>
                <span className={cn(
                  "text-xs font-medium w-10 text-right",
                  skill.currentLevel >= 80 ? "text-green-500" :
                  skill.currentLevel >= 50 ? "text-yellow-500" : "text-muted-foreground"
                )}>
                  {skill.currentLevel}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
