import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Department } from "@shared/schema";
import { 
  Monitor, 
  Building, 
  Settings, 
  Cpu, 
  Zap, 
  Radio,
  GraduationCap,
  Database
} from "lucide-react";

interface DepartmentCardProps {
  department: Department;
}

const departmentIcons: Record<string, any> = {
  'ai': GraduationCap,
  'civil': Building,
  'mechanical': Settings,
  'computer': Monitor,
  'electrical': Zap,
  'electronics': Radio,
  'bigdata': Database,
};

const departmentColors: Record<string, string> = {
  'ai': 'bg-blue-500',
  'civil': 'bg-orange-500',
  'mechanical': 'bg-green-600',
  'computer': 'bg-purple-500',
  'electrical': 'bg-yellow-500',
  'electronics': 'bg-pink-500',
  'bigdata': 'bg-cyan-600',
};

export default function DepartmentCard({ department }: DepartmentCardProps) {
  const IconComponent = departmentIcons[department.id] || Monitor;
  const iconColor = departmentColors[department.id] || 'bg-gray-500';

  return (
    <Card className={`cursor-target department-${department.id} hover:shadow-lg transition-shadow duration-300 overflow-hidden`} data-testid={`card-department-${department.id}`}>
      <div className="dept-bg h-1.5"></div>
      <CardContent className="p-3 sm:p-4 dept-accent">
        <div className="flex items-center mb-2 sm:mb-3">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 ${iconColor} rounded-lg flex items-center justify-center mr-2 sm:mr-3`}>
            <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-sans text-sm sm:text-lg font-semibold truncate">{department.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{department.shortName}</p>
          </div>
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">  
          {department.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground" data-testid={`text-resources-${department.id}`}>
            {department.resourceCount} Resources
          </span>
          <Link href={`/department/${department.id}`}>
            <Button 
              variant="link" 
              className="cursor-target p-0 h-auto font-medium text-xs sm:text-sm"
              style={{ color: `var(--dept-${department.id})` }}
              data-testid={`button-explore-${department.id}`}
            >
              Explore →
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
