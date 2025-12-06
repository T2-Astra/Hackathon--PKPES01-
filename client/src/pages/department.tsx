import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResourceCard from "@/components/resource-card";
import { Department, QuestionPaper, StudyNote } from "@shared/schema";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function DepartmentPage() {
  const [match, params] = useRoute("/department/:id");
  const departmentId = params?.id;

  const { data: department } = useQuery<Department>({
    queryKey: ["/api/departments", departmentId],
    enabled: !!departmentId,
  });

  const { data: questionPapers, isLoading: loadingPapers } = useQuery<QuestionPaper[]>({
    queryKey: ["/api/question-papers/department", departmentId],
    enabled: !!departmentId,
  });

  const { data: studyNotes, isLoading: loadingNotes } = useQuery<StudyNote[]>({
    queryKey: ["/api/study-notes/department", departmentId],
    enabled: !!departmentId,
  });

  if (!match || !departmentId) {
    return <div>Department not found</div>;
  }

  return (
    <div className="min-h-screen py-8 pt-16 md:pt-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Department Header */}
          {department && (
            <div className={`department-${department.id} mb-8`}>
              <Card className="overflow-hidden">
                <div className="dept-bg h-2"></div>
                <div className="p-8 dept-accent">
                  <h1 className="font-sans text-3xl lg:text-4xl font-bold mb-4" data-testid={`text-dept-name-${department.id}`}>
                    {department.name}
                  </h1>
                  <p className="text-muted-foreground text-lg mb-4">
                    {department.description}
                  </p>
                  <div className="flex items-center space-x-6 text-sm">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full" data-testid={`text-resource-count-${department.id}`}>
                      {department.resourceCount} Resources Available
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Resources Tabs */}
          <Tabs defaultValue="question-papers" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8" data-testid="tabs-department-resources">
              <TabsTrigger value="question-papers" data-testid="tab-dept-question-papers">
                Question Papers ({questionPapers?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="notes" data-testid="tab-dept-notes">
                Study Notes ({studyNotes?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="question-papers" className="space-y-6">
              {loadingPapers ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="h-64 animate-pulse bg-muted" />
                  ))}
                </div>
              ) : questionPapers && questionPapers.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {questionPapers.map((paper) => (
                    <ResourceCard key={paper.id} resource={paper} type="question-paper" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg" data-testid="text-no-dept-papers">
                    No question papers available for this department yet.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-6">
              {loadingNotes ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="h-64 animate-pulse bg-muted" />
                  ))}
                </div>
              ) : studyNotes && studyNotes.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {studyNotes.map((note) => (
                    <ResourceCard key={note.id} resource={note} type="study-note" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg" data-testid="text-no-dept-notes">
                    No study notes available for this department yet.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
