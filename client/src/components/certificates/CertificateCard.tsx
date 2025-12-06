import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Award, Download, Share2, ExternalLink, 
  Calendar, CheckCircle2, QrCode 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CertificateCardProps {
  id: string;
  title: string;
  description?: string;
  category?: string;
  skillName?: string;
  score?: number;
  issueDate: Date;
  verificationCode?: string;
  isPublic?: boolean;
  onDownload?: () => void;
  onShare?: () => void;
  onView?: () => void;
  className?: string;
}

export default function CertificateCard({
  id,
  title,
  description,
  category,
  skillName,
  score,
  issueDate,
  verificationCode,
  isPublic,
  onDownload,
  onShare,
  onView,
  className,
}: CertificateCardProps) {
  const formattedDate = new Date(issueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className={cn(
      "overflow-hidden group hover:shadow-lg transition-all",
      "bg-gradient-to-br from-primary/5 via-background to-yellow-500/5",
      "border-primary/20",
      className
    )}>
      {/* Certificate header decoration */}
      <div className="h-2 bg-gradient-to-r from-primary via-yellow-500 to-primary" />
      
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {/* Certificate icon */}
          <div className="shrink-0 p-3 rounded-xl bg-gradient-to-br from-primary/20 to-yellow-500/20 border border-primary/20">
            <Award className="w-8 h-8 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-2">
              {category && (
                <Badge variant="secondary">{category}</Badge>
              )}
              {skillName && (
                <Badge variant="outline">{skillName}</Badge>
              )}
              {score && score >= 90 && (
                <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  Excellence
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>

            {description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
              
              {score && (
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Score: {score}%</span>
                </div>
              )}

              {verificationCode && (
                <div className="flex items-center gap-1">
                  <QrCode className="w-4 h-4" />
                  <span className="font-mono text-xs">{verificationCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          {onView && (
            <Button variant="default" size="sm" className="flex-1 gap-2" onClick={onView}>
              <ExternalLink className="w-4 h-4" />
              View
            </Button>
          )}
          {onDownload && (
            <Button variant="outline" size="sm" className="gap-2" onClick={onDownload}>
              <Download className="w-4 h-4" />
            </Button>
          )}
          {onShare && (
            <Button variant="outline" size="sm" className="gap-2" onClick={onShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Certificate Preview Component for full view
export function CertificatePreview({
  title,
  recipientName,
  issueDate,
  score,
  verificationCode,
  className,
}: {
  title: string;
  recipientName: string;
  issueDate: Date;
  score?: number;
  verificationCode?: string;
  className?: string;
}) {
  const formattedDate = new Date(issueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={cn(
      "relative aspect-[1.4/1] p-8 rounded-lg overflow-hidden",
      "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800",
      "border-4 border-double border-primary/30",
      className
    )}>
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-4 border-t-4 border-primary/40 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-4 border-t-4 border-primary/40 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-4 border-b-4 border-primary/40 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-4 border-b-4 border-primary/40 rounded-br-lg" />

      <div className="relative h-full flex flex-col items-center justify-center text-center">
        {/* Logo */}
        <div className="mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Award className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Header */}
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
          Certificate of Completion
        </p>

        {/* Title */}
        <h2 className="text-2xl font-bold text-primary mb-4">{title}</h2>

        {/* Recipient */}
        <p className="text-sm text-muted-foreground mb-1">This certifies that</p>
        <p className="text-xl font-semibold mb-4">{recipientName}</p>

        {/* Achievement */}
        <p className="text-sm text-muted-foreground">
          has successfully completed this course
          {score && ` with a score of ${score}%`}
        </p>

        {/* Date & Verification */}
        <div className="mt-6 flex items-center gap-6 text-xs text-muted-foreground">
          <div>
            <p className="font-medium">Issue Date</p>
            <p>{formattedDate}</p>
          </div>
          {verificationCode && (
            <div>
              <p className="font-medium">Verification ID</p>
              <p className="font-mono">{verificationCode}</p>
            </div>
          )}
        </div>

        {/* LearnFlow branding */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <p className="text-xs text-muted-foreground">
            Issued by <span className="font-semibold text-primary">LearnFlow</span>
          </p>
        </div>
      </div>
    </div>
  );
}
