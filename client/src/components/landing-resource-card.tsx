import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionPaper, StudyNote } from "@shared/schema";
import { FileText, Download, Eye } from "lucide-react";

interface LandingResourceCardProps {
  resource: QuestionPaper | StudyNote;
  type: 'question-paper' | 'study-note';
  onLoginRedirect: () => void;
}

export default function LandingResourceCard({ resource, type, onLoginRedirect }: LandingResourceCardProps) {
  const handleDownload = () => {
    onLoginRedirect();
  };

  const handleView = () => {
    onLoginRedirect();
  };

  const isQuestionPaper = (res: QuestionPaper | StudyNote): res is QuestionPaper => {
    return 'marks' in res;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 overflow-hidden group cursor-pointer relative" data-testid={`card-resource-${resource.id}`} onClick={onLoginRedirect}>
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
          🔒 Sign In to Access
        </div>
      </div>
      
      <CardContent className="p-4 relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-sans text-base font-semibold mb-1.5 group-hover:text-primary transition-colors" data-testid={`text-title-${resource.id}`}>
              {resource.title}
            </h3>
            <div className="flex items-center text-xs text-muted-foreground space-x-3 mb-1.5">
              <span data-testid={`text-subject-${resource.id}`}>{resource.subject}</span>
              <span data-testid={`text-semester-${resource.id}`}>Sem {resource.semester}</span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {isQuestionPaper(resource) && (
                <>
                  <span data-testid={`text-session-${resource.id}`}>
                    {resource.session} {resource.year}
                  </span>
                  <span className="mx-1.5">•</span>
                  <span data-testid={`text-marks-${resource.id}`}>{resource.marks} Marks</span>
                </>
              )}
              {!isQuestionPaper(resource) && resource.chapter && (
                <span data-testid={`text-chapter-${resource.id}`}>{resource.chapter}</span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-destructive" />
          </div>
        </div>
        
        <div className="flex gap-1.5">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            size="sm"
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 text-xs font-medium"
            data-testid={`button-download-${resource.id}`}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleView();
            }}
            className="px-3 py-1.5 text-xs font-medium"
            data-testid={`button-view-${resource.id}`}
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
