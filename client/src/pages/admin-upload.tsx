import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { UploadForm } from '@/components/upload-form';
import { BookOpen, FileText, Upload, Users, LogIn, MessageSquare, ListChecks } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Department } from '@shared/schema';

export default function AdminUploadPage() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isQuestionPapers, setIsQuestionPapers] = useState(true); // true = Question Papers, false = Study Notes
  const { data: departments = [], isLoading } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
  });

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/');
    }
  }, [user, authLoading, setLocation]);

  if (authLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <LogIn className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to upload content. Please login to continue.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading departments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8 pt-16 md:pt-4 sm:md:pt-8">
      {/* Header */}
      <div className="text-center space-y-2 sm:space-y-4">
        <h1 className="text-2xl sm:text-4xl font-bold text-foreground">
          Upload Center
        </h1>
        <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
          Upload question papers and study notes to help polytechnic students succeed
        </p>
        <Alert className="max-w-2xl mx-auto mx-2 sm:mx-auto">
          <AlertDescription className="text-sm">
            📋 All uploads require admin approval before being published. You'll be notified once your content is reviewed.
          </AlertDescription>
        </Alert>
      </div>



      {/* Upload Type Toggle */}
      <div className="flex justify-center mb-4 sm:mb-6 px-2">
        <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <FileText className={cn(
              "w-4 h-4 transition-colors",
              isQuestionPapers ? "text-primary" : "text-muted-foreground"
            )} />
            <Label htmlFor="upload-mode" className="text-sm font-medium cursor-pointer">
              {isQuestionPapers ? 'Question Papers' : 'Study Notes'}
            </Label>
          </div>
          <Switch
            id="upload-mode"
            checked={isQuestionPapers}
            onCheckedChange={(checked) => setIsQuestionPapers(checked)}
          />
          <BookOpen className={cn(
            "w-4 h-4 transition-colors",
            !isQuestionPapers ? "text-primary" : "text-muted-foreground"
          )} />
        </div>
      </div>

      {/* Upload Form */}
      <div className="space-y-4">
        {isQuestionPapers ? (
          <UploadForm
            type="question-paper"
            departments={departments}
            onSuccess={() => {
              console.log('Question paper uploaded successfully');
            }}
          />
        ) : (
          <UploadForm
            type="study-note"
            departments={departments}
            onSuccess={() => {
              console.log('Study note uploaded successfully');
            }}
          />
        )}
      </div>
    </div>
  );
}