import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionPaper, StudyNote } from "@shared/schema";
import { FileText, Download, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuthContext";

interface ResourceCardProps {
  resource: QuestionPaper | StudyNote;
  type: 'question-paper' | 'study-note';
}

export default function ResourceCard({ resource, type }: ResourceCardProps) {
  const { toast } = useToast();
  const { user, token } = useAuth();

  const handleDownload = async () => {
    try {
      if (!resource.fileUrl) {
        toast({
          title: "Download Failed",
          description: "File URL is not available.",
          variant: "destructive",
        });
        return;
      }

      // Create a temporary link element to force download
      const link = document.createElement('a');
      link.href = resource.fileUrl;
      link.download = resource.title || 'download';
      link.target = '_blank';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: "The file download has been initiated.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Unable to download the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleView = () => {
    window.open(resource.fileUrl, '_blank');
  };

  const handleDelete = async () => {
    if (!user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete resources.",
        variant: "destructive",
      });
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${resource.title}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      console.log(`🗑️ Deleting resource: ${resource.id}`);
      
      const response = await fetch(`/api/admin/resources/${resource.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "Resource Deleted",
          description: "The resource has been permanently removed.",
        });
        
        // Refresh the page to update search results
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast({
          title: "Delete Failed",
          description: errorData.message || "Unable to delete the resource.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        title: "Delete Failed",
        description: "An error occurred while deleting the resource.",
        variant: "destructive",
      });
    }
  };

  const isQuestionPaper = (res: QuestionPaper | StudyNote): res is QuestionPaper => {
    return 'marks' in res;
  };

  return (
    <Card className="cursor-target hover:shadow-lg transition-shadow duration-300 overflow-hidden" data-testid={`card-resource-${resource.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3 md:mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="font-sans text-sm md:text-base font-semibold mb-2 md:mb-1.5 leading-tight" data-testid={`text-title-${resource.id}`}>
              {resource.title}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center text-xs text-muted-foreground space-y-1 sm:space-y-0 sm:space-x-3 mb-2 md:mb-1.5">
              <span className="font-medium" data-testid={`text-subject-${resource.id}`}>{resource.subject}</span>
              <span data-testid={`text-semester-${resource.id}`}>Sem {resource.semester}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center text-xs text-muted-foreground space-y-1 sm:space-y-0">
              {isQuestionPaper(resource) && (
                <>
                  <span data-testid={`text-session-${resource.id}`}>
                    {resource.session} {resource.year}
                  </span>
                  <span className="hidden sm:inline mx-1.5">•</span>
                  <span data-testid={`text-marks-${resource.id}`}>{resource.marks} Marks</span>
                </>
              )}
              {!isQuestionPaper(resource) && resource.chapter && (
                <span data-testid={`text-chapter-${resource.id}`}>{resource.chapter}</span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 w-8 h-8 md:w-8 md:h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          {/* Download and View buttons */}
          <div className="flex gap-1.5">
            <Button 
              onClick={handleDownload}
              size="sm"
              className="cursor-target flex-1 sm:flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground h-11 sm:h-9 px-2 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-[10px] md:text-xs font-medium"
              data-testid={`button-download-${resource.id}`}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleView}
              className="cursor-target w-11 sm:w-9 h-11 sm:h-9 px-0 py-0 flex items-center justify-center"
              data-testid={`button-view-${resource.id}`}
            >
              <Eye className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </Button>
            
            {/* Admin-only delete button - desktop only */}
            {user?.isAdmin && (
              <Button 
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="cursor-target hidden sm:flex px-2 py-1.5 text-xs font-medium text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                data-testid={`button-delete-${resource.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
          
          {/* Admin-only delete button - mobile only */}
          {user?.isAdmin && (
            <Button 
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="cursor-target sm:hidden w-full px-3 py-1.5 text-xs font-medium text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              data-testid={`button-delete-mobile-${resource.id}`}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
