import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, Lock, Globe, Clock, BookOpen, 
  Video, MessageSquare, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudyRoomCardProps {
  id: string;
  name: string;
  description?: string;
  hostName: string;
  category?: string;
  topic?: string;
  maxParticipants: number;
  currentParticipants: number;
  isActive: boolean;
  isPrivate: boolean;
  hasVideo?: boolean;
  hasChat?: boolean;
  onJoin?: () => void;
  onView?: () => void;
  className?: string;
}

export default function StudyRoomCard({
  id,
  name,
  description,
  hostName,
  category,
  topic,
  maxParticipants,
  currentParticipants,
  isActive,
  isPrivate,
  hasVideo = true,
  hasChat = true,
  onJoin,
  onView,
  className,
}: StudyRoomCardProps) {
  const isFull = currentParticipants >= maxParticipants;
  const occupancyPercent = (currentParticipants / maxParticipants) * 100;

  return (
    <Card className={cn(
      "group transition-all hover:shadow-lg",
      !isActive && "opacity-60",
      className
    )}>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {isPrivate ? (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Lock className="w-3 h-3" />
                    Private
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Globe className="w-3 h-3" />
                    Public
                  </Badge>
                )}
                {category && (
                  <Badge variant="outline" className="text-xs">
                    {category}
                  </Badge>
                )}
                {isActive && (
                  <Badge className="bg-green-500 text-white text-xs gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Live
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                {name}
              </h3>
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}

          {/* Topic */}
          {topic && (
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Studying:</span>
              <span className="font-medium">{topic}</span>
            </div>
          )}

          {/* Host */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-primary/10">
                {hostName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              Hosted by <span className="font-medium text-foreground">{hostName}</span>
            </span>
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {currentParticipants}/{maxParticipants} participants
                </span>
              </div>
              {isFull && (
                <Badge variant="destructive" className="text-xs">Full</Badge>
              )}
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all",
                  isFull ? "bg-red-500" : 
                  occupancyPercent > 75 ? "bg-yellow-500" : "bg-green-500"
                )}
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
          </div>

          {/* Features */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {hasVideo && (
              <div className="flex items-center gap-1">
                <Video className="w-3 h-3" />
                Video
              </div>
            )}
            {hasChat && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                Chat
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {onJoin && isActive && !isFull && (
              <Button className="flex-1 gap-2" onClick={onJoin}>
                Join Room
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            {onJoin && isActive && isFull && (
              <Button className="flex-1" disabled>
                Room Full
              </Button>
            )}
            {onView && (
              <Button 
                variant={isActive && !isFull ? "outline" : "default"} 
                className="gap-2"
                onClick={onView}
              >
                View Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
