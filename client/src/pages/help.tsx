import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import BasicAccordion from '@/components/ui/basic-accordion';
import { 
  HelpCircle, 
  MessageSquare, 
  Bug, 
  AlertTriangle, 
  CheckCircle, 
  Send,
  Book,
  Search,
  Upload,
  Video,
  GraduationCap,
  Mail,
  Clock,
  Users,
  FileText,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react';

export default function Help() {
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult("Sending your message...");
    
    const formData = new FormData(event.target as HTMLFormElement);
    formData.append("access_key", "6128421b-e763-42fd-8011-5149d6453b7e");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult("Message sent successfully! We'll get back to you soon.");
        (event.target as HTMLFormElement).reset();
      } else {
        console.log("Error", data);
        setResult(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setResult("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqItems = [
    {
      id: "access-materials",
      title: "How do I access study materials?",
      content: (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Navigate to the Search page or browse by department on the Home page. You can filter by subject, year, and document type.
          </p>
          <div className="flex items-center gap-2 text-xs text-primary">
            <Book className="w-4 h-4" />
            <span>Available 24/7 with instant access</span>
          </div>
        </div>
      )
    },
    {
      id: "upload-resources",
      title: "How do I upload my own resources?",
      content: (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Go to the Upload page from the sidebar. Select your department, add a title and description, then upload your file. Admin approval may be required.
          </p>
          <div className="flex items-center gap-2 text-xs text-primary">
            <Upload className="w-4 h-4" />
            <span>Help build our community resource library</span>
          </div>
        </div>
      )
    },
    {
      id: "educational-videos",
      title: "Can I watch educational videos?",
      content: (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Yes! Visit the Videos page to access curated educational content with our AI-powered study assistant for questions and explanations.
          </p>
          <div className="flex items-center gap-2 text-xs text-primary">
            <Video className="w-4 h-4" />
            <span>Interactive learning with AI assistance</span>
          </div>
        </div>
      )
    },
    {
      id: "ai-chatbot",
      title: "How does the AI ChatBot work?",
      content: (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our ChatBot uses advanced AI to help with your studies. You can ask questions, upload files for analysis, and get explanations on various topics.
          </p>
          <div className="flex items-center gap-2 text-xs text-primary">
            <Sparkles className="w-4 h-4" />
            <span>Powered by cutting-edge AI technology</span>
          </div>
        </div>
      )
    },
    {
      id: "file-formats",
      title: "What file formats are supported?",
      content: (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            We support PDF, DOC, DOCX, PPT, PPTX, TXT, and most image formats. Files should be under 10MB for optimal performance.
          </p>
          <div className="flex items-center gap-2 text-xs text-primary">
            <FileText className="w-4 h-4" />
            <span>Multiple formats for maximum compatibility</span>
          </div>
        </div>
      )
    },
    {
      id: "report-content",
      title: "How do I report inappropriate content?",
      content: (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Use the contact form below to report any inappropriate content. Include details about the specific resource and why it should be reviewed.
          </p>
          <div className="flex items-center gap-2 text-xs text-primary">
            <Shield className="w-4 h-4" />
            <span>Keeping our community safe and educational</span>
          </div>
        </div>
      )
    },
    {
      id: "mock-tests",
      title: "How do I generate mock tests?",
      content: (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Visit the Mock Test page to generate AI-powered practice tests. Choose your subject, difficulty level, and number of questions for personalized practice sessions.
          </p>
          <div className="flex items-center gap-2 text-xs text-primary">
            <Zap className="w-4 h-4" />
            <span>Instant test generation with detailed explanations</span>
          </div>
        </div>
      )
    },
    {
      id: "departments",
      title: "Which departments are supported?",
      content: (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            PolyLearnHub supports 7 major engineering departments: Computer Engineering, Mechanical Engineering, Civil Engineering, Electrical Engineering, Electronics Engineering, Information Technology, and Artificial Intelligence & Machine Learning.
          </p>
          <div className="flex items-center gap-2 text-xs text-primary">
            <GraduationCap className="w-4 h-4" />
            <span>Comprehensive coverage for all polytechnic streams</span>
          </div>
        </div>
      )
    }
  ];


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl pt-16 md:pt-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Help & Support</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get help with PolyLearnHub, report issues, or contact our support team
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - FAQ */}
          <div className="space-y-8">
            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>
                  Find answers to common questions about PolyLearnHub
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BasicAccordion 
                  items={faqItems}
                  allowMultiple={true}
                  className="border-0 divide-y-0"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact Form (More Prominent) */}
          <div className="space-y-6">
            {/* Featured Contact Form */}
            <div className="relative">
              {/* Highlight Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/3 to-primary/5 rounded-xl blur-sm"></div>
              
              <Card className="relative border shadow-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    Contact Support
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Have a question or need help? We're here to assist you with any issues or feedback about PolyLearnHub.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={onSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-foreground">
                          Name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Your full name"
                          required
                          disabled={isSubmitting}
                          className="transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">
                          Email *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your.email@example.com"
                          required
                          disabled={isSubmitting}
                          className="transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-foreground">
                        Subject *
                      </label>
                      <Select name="subject" required disabled={isSubmitting}>
                        <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary">
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bug-report">🐛 Bug Report</SelectItem>
                          <SelectItem value="feature-request">✨ Feature Request</SelectItem>
                          <SelectItem value="content-issue">📄 Content Issue</SelectItem>
                          <SelectItem value="account-help">👤 Account Help</SelectItem>
                          <SelectItem value="technical-support">🔧 Technical Support</SelectItem>
                          <SelectItem value="general-question">❓ General Question</SelectItem>
                          <SelectItem value="other">📝 Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-foreground">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Describe your issue or question in detail..."
                        className="min-h-[140px] resize-none transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>

                    {result && (
                      <Alert className={result.includes("successfully") ? "border-green-200 bg-green-50" : result.includes("error") || result.includes("wrong") ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}>
                        <div className="flex items-center gap-2">
                          {result.includes("successfully") ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : result.includes("error") || result.includes("wrong") ? (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          )}
                          <AlertDescription className="text-sm font-medium">
                            {result}
                          </AlertDescription>
                        </div>
                      </Alert>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

