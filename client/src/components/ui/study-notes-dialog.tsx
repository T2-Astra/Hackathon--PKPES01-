import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useLanguageContext } from '@/hooks/useLanguageContext';
import { 
  PenTool, 
  FileText, 
  BookOpen, 
  Lightbulb,
  Target,
  Clock,
  Save,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudyNotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNotesCreate: (file: File) => void;
}

const NOTE_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Notes',
    icon: FileText,
    description: 'Start with a blank document',
    template: ''
  },
  {
    id: 'lecture',
    name: 'Lecture Notes',
    icon: GraduationCap,
    description: 'Structured format for class notes',
    template: `# Lecture Notes - [Subject Name]
**Date:** ${new Date().toLocaleDateString()}
**Topic:** [Lecture Topic]
**Professor:** [Professor Name]

## Key Concepts
- 
- 
- 

## Important Formulas/Definitions
1. 
2. 
3. 

## Examples
### Example 1:
Problem: 
Solution: 

### Example 2:
Problem: 
Solution: 

## Questions/Doubts
- 
- 

## Summary
[Main takeaways from today's lecture]

## Next Class
[What to prepare for next class]`
  },
  {
    id: 'study-plan',
    name: 'Study Plan',
    icon: Target,
    description: 'Plan your study schedule',
    template: `# Study Plan - [Subject/Topic]
**Created:** ${new Date().toLocaleDateString()}
**Exam Date:** [Date]
**Time Available:** [X weeks/days]

## Study Goals
### Primary Goals:
- [ ] 
- [ ] 
- [ ] 

### Secondary Goals:
- [ ] 
- [ ] 

## Topics to Cover
### High Priority (Must Know):
1. [ ] Topic 1 - [Estimated time: X hours]
2. [ ] Topic 2 - [Estimated time: X hours]
3. [ ] Topic 3 - [Estimated time: X hours]

### Medium Priority (Should Know):
1. [ ] Topic 4
2. [ ] Topic 5

### Low Priority (Good to Know):
1. [ ] Topic 6
2. [ ] Topic 7

## Weekly Schedule
### Week 1:
- Monday: 
- Tuesday: 
- Wednesday: 
- Thursday: 
- Friday: 
- Weekend: 

## Resources Needed
- [ ] Textbooks: 
- [ ] Online materials: 
- [ ] Practice problems: 
- [ ] Past papers: 

## Progress Tracking
- [ ] Week 1 completed
- [ ] Week 2 completed
- [ ] Mock test taken
- [ ] Revision completed`
  },
  {
    id: 'problem-solving',
    name: 'Problem Solving',
    icon: Lightbulb,
    description: 'Template for working through problems',
    template: `# Problem Solving - [Subject]
**Date:** ${new Date().toLocaleDateString()}
**Chapter/Topic:** [Chapter Name]

## Problem Statement
[Write the problem here]

## Given Information
- 
- 
- 

## Required to Find
- 
- 

## Solution Approach
### Step 1: [Analysis]
[Understand what the problem is asking]

### Step 2: [Formula/Method Selection]
[Choose the right formula or method]

### Step 3: [Calculation]
[Show your work step by step]

### Step 4: [Verification]
[Check if the answer makes sense]

## Final Answer
[Your final answer with units]

## Key Learning Points
- 
- 
- 

## Similar Problems to Practice
1. 
2. 
3. `
  },
  {
    id: 'revision',
    name: 'Revision Notes',
    icon: BookOpen,
    description: 'Quick revision and summary notes',
    template: `# Revision Notes - [Subject/Chapter]
**Date:** ${new Date().toLocaleDateString()}
**Exam:** [Exam name and date]

## Quick Summary
[2-3 sentence summary of the topic]

## Key Formulas
1. **Formula Name:** Formula here
   - When to use: 
   - Units: 

2. **Formula Name:** Formula here
   - When to use: 
   - Units: 

## Important Points to Remember
⭐ 
⭐ 
⭐ 
⭐ 

## Common Mistakes to Avoid
❌ 
❌ 
❌ 

## Quick Practice Questions
1. Q: 
   A: 

2. Q: 
   A: 

3. Q: 
   A: 

## Last-Minute Tips
💡 
💡 
💡 `
  }
];

export function StudyNotesDialog({ isOpen, onClose, onNotesCreate }: StudyNotesDialogProps) {
  const { t } = useLanguageContext();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [subject, setSubject] = useState('');

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = NOTE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setNoteContent(template.template);
    }
  };

  const handleCreateNotes = () => {
    const title = noteTitle || `Study Notes - ${subject || 'Untitled'}`;
    const content = noteContent || 'Start writing your notes here...';
    
    const notesText = `${title}\n\n${content}`;
    const blob = new Blob([notesText], { type: 'text/markdown' });
    const file = new File([blob], `${title.replace(/[^a-zA-Z0-9]/g, '_')}.md`, { type: 'text/markdown' });
    
    onNotesCreate(file);
    onClose();
    
    // Reset form
    setNoteTitle('');
    setNoteContent('');
    setSubject('');
    setSelectedTemplate('blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5" />
            Create Study Notes
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* Template Selection */}
          <div className="w-80 shrink-0 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              <div className="space-y-2">
                <Label>Note Template</Label>
                <div className="grid gap-2">
                  {NOTE_TEMPLATES.map((template) => {
                    const Icon = template.icon;
                    return (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border text-left transition-colors",
                          selectedTemplate === template.id 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:bg-muted/50"
                        )}
                      >
                        <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{template.name}</p>
                          <p className="text-xs text-muted-foreground">{template.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Settings - Fixed at bottom */}
            <div className="shrink-0 border-t pt-4 mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="note-title" className="text-sm font-medium">Note Title</Label>
                <Input
                  id="note-title"
                  placeholder="Enter your note title..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="h-10 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:ring-offset-2"
                />
                <p className="text-xs text-muted-foreground">
                  Examples: "Physics Chapter 5", "Math Revision"
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="h-10 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:ring-offset-2">
                    <SelectValue placeholder="Choose your subject..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="mathematics">📐 Mathematics</SelectItem>
                    <SelectItem value="physics">⚡ Physics</SelectItem>
                    <SelectItem value="chemistry">🧪 Chemistry</SelectItem>
                    <SelectItem value="engineering">⚙️ Engineering</SelectItem>
                    <SelectItem value="computer-science">💻 Computer Science</SelectItem>
                    <SelectItem value="electronics">📡 Electronics</SelectItem>
                    <SelectItem value="mechanical">🔧 Mechanical</SelectItem>
                    <SelectItem value="civil">🏗️ Civil Engineering</SelectItem>
                    <SelectItem value="electrical">⚡ Electrical</SelectItem>
                    <SelectItem value="other">📚 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Note Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <Label>Note Content</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Markdown supported
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {noteContent.length} characters
                </Badge>
              </div>
            </div>
            
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Start writing your notes here... You can use Markdown formatting."
              className="flex-1 resize-none font-mono text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-border shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>AI will help you improve and expand these notes</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCreateNotes} disabled={!noteContent.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Create Notes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
