import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DragDropUpload } from '@/components/ui/drag-drop-upload';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, BookOpen } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuthContext';
import { cn } from '@/lib/utils';

interface UploadFormProps {
  type: 'question-paper' | 'study-note';
  departments: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export function UploadForm({ type, departments, onSuccess }: UploadFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    departmentId: '',
    semester: '',
    year: new Date().getFullYear().toString(),
    session: 'Winter',
    marks: '100',
    chapter: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [previousType, setPreviousType] = useState(type);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, token } = useAuth();

  // Handle flip animation when type changes
  useEffect(() => {
    if (previousType !== type) {
      setIsFlipping(true);
      setTimeout(() => {
        setPreviousType(type);
        setIsFlipping(false);
      }, 300);
    }
  }, [type, previousType]);
  
  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!user || !token) {
        throw new Error('You must be logged in to upload files');
      }

      const endpoint = type === 'question-paper' ? '/api/question-papers' : '/api/study-notes';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      const result = await response.json();
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'Upload Successful!',
        description: `Your ${type === 'question-paper' ? 'question paper' : 'study note'} has been uploaded and is pending admin approval.`,
      });
      
      // Reset form
      setFormData({
        title: '',
        subject: '',
        departmentId: '',
        semester: '',
        year: '',
        session: '',
        marks: '',
        chapter: '',
      });
      setFile(null);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/question-papers/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/study-notes'] });
      
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to upload files.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a PDF file to upload.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your upload.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.subject.trim()) {
      toast({
        title: 'Subject required',
        description: 'Please enter the subject.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.departmentId) {
      toast({
        title: 'Department required',
        description: 'Please select a department.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.semester) {
      toast({
        title: 'Semester required',
        description: 'Please select a semester.',
        variant: 'destructive',
      });
      return;
    }
    
    const data = new FormData();
    data.append('file', file);
    data.append('title', formData.title.trim());
    data.append('subject', formData.subject.trim());
    data.append('departmentId', formData.departmentId);
    data.append('semester', formData.semester);
    
    if (type === 'question-paper') {
      data.append('year', formData.year);
      data.append('session', formData.session);
      data.append('marks', formData.marks || '100');
    } else {
      data.append('chapter', formData.chapter.trim());
    }
    
    uploadMutation.mutate(data);
  };
  
  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
  };
  
  return (
    <div className="relative [perspective:1000px]">
      <Card className={cn(
        "max-w-2xl mx-auto transition-all duration-500 transform-gpu",
        isFlipping && "animate-pulse scale-[0.98]"
      )}>
        <CardHeader className="pb-4">
          <CardTitle className={cn(
            "flex items-center gap-2 text-lg transition-all duration-300",
            isFlipping && "opacity-50"
          )}>
            {type === 'question-paper' ? (
              <FileText className="h-4 w-4" />
            ) : (
              <BookOpen className="h-4 w-4" />
            )}
            Upload {type === 'question-paper' ? 'Question Paper' : 'Study Note'}
          </CardTitle>
        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mt-2">
            <p className="text-xs text-yellow-800">
              ⚠️ You must be logged in to upload files. Please log in to continue.
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className={cn(
        "pt-0 transition-all duration-300",
        isFlipping && "opacity-50 scale-[0.99]"
      )}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label data-testid="label-file" className="text-xs">PDF File</Label>
            <DragDropUpload
              onFileSelect={handleFileSelect}
              selectedFile={file}
              accept="application/pdf"
              maxSize={10}
              disabled={uploadMutation.isPending}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="title" data-testid="label-title" className="text-xs">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter title"
                required
                data-testid="input-title"
                className="h-8 text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="subject" data-testid="label-subject" className="text-xs">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Enter subject"
                required
                data-testid="input-subject"
                className="h-8 text-sm"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <Label data-testid="label-department" className="text-xs">Department</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {departments.map((dept) => {
                  const departmentColors: Record<string, string> = {
                    'ai': 'rgb(0, 85, 255)',
                    'civil': 'rgb(230, 96, 0)', 
                    'mechanical': 'rgb(41, 163, 41)',
                    'computer': 'rgb(140, 48, 232)',
                    'electrical': 'rgb(242, 185, 13)',
                    'electronics': 'rgb(223, 32, 96)',
                    'bigdata': 'rgb(17, 147, 212)'
                  };
                  
                  const departmentDescriptions: Record<string, string> = {
                    'ai': 'AI & ML Technologies',
                    'civil': 'Infrastructure & Construction',
                    'mechanical': 'Manufacturing & Design', 
                    'computer': 'Software & Systems',
                    'electrical': 'Power & Control Systems',
                    'electronics': 'Circuits & Communication',
                    'bigdata': 'Data Analytics & Processing'
                  };
                  
                  const isSelected = formData.departmentId === dept.id;
                  
                  return (
                    <div 
                      key={dept.id}
                      className={`flex items-center gap-2 p-2 border rounded-md cursor-pointer transition-all hover:shadow-sm ${
                        isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setFormData({ ...formData, departmentId: dept.id })}
                      data-testid={`dept-card-${dept.id}`}
                    >
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: departmentColors[dept.id] || 'rgb(107, 114, 128)' }}
                      ></div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs truncate">{dept.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {departmentDescriptions[dept.id] || 'Engineering Department'}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="semester" data-testid="label-semester" className="text-xs">Semester</Label>
              <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })}>
                <SelectTrigger data-testid="select-semester" className="h-8 text-sm">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((sem) => (
                    <SelectItem key={sem} value={sem.toString()} data-testid={`option-semester-${sem}`}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {type === 'question-paper' && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="year" data-testid="label-year" className="text-xs">Year</Label>
                <Input
                  id="year"
                  type="number"
                  min="2020"
                  max="2030"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2024"
                  required
                  data-testid="input-year"
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="session" data-testid="label-session" className="text-xs">Session</Label>
                <Select value={formData.session} onValueChange={(value) => setFormData({ ...formData, session: value })}>
                  <SelectTrigger data-testid="select-session" className="h-8 text-sm">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Summer" data-testid="option-session-summer">Summer</SelectItem>
                    <SelectItem value="Winter" data-testid="option-session-winter">Winter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="marks" data-testid="label-marks" className="text-xs">Total Marks</Label>
                <Input
                  id="marks"
                  type="number"
                  min="10"
                  max="200"
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                  placeholder="100"
                  data-testid="input-marks"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          )}
          
          {type === 'study-note' && (
            <div className="space-y-1">
              <Label htmlFor="chapter" data-testid="label-chapter" className="text-xs">Chapter</Label>
              <Input
                id="chapter"
                value={formData.chapter}
                onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                placeholder="Enter chapter name"
                required
                data-testid="input-chapter"
                className="h-8 text-sm"
              />
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={uploadMutation.isPending}
            className="w-full h-9 text-sm"
            data-testid="button-upload"
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
          </Button>
        </form>
      </CardContent>
    </Card>
    </div>
  );
}