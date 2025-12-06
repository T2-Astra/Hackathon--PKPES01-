import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useState } from 'react';

interface RateWebsiteSheetProps {
  children: React.ReactNode;
}

export default function RateWebsiteSheet({ children }: RateWebsiteSheetProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult("Sending your feedback...");
    
    // Create FormData for Web3Forms
    const formData = new FormData();
    formData.append("access_key", "6128421b-e763-42fd-8011-5149d6453b7e");
    formData.append("name", name);
    formData.append("email", email);
    formData.append("message", feedback);
    formData.append("rating", rating.toString());
    formData.append("subject", `Website Feedback - ${rating} Star Rating`);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult("Feedback sent successfully! Thank you for helping us improve.");
        // Reset form
        setName('');
        setEmail('');
        setFeedback('');
        setRating(0);
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

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Quick Feedback</SheetTitle>
          <SheetDescription>Share your feedback to help us improve.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-5">
          {/* Rating */}
          <div className="flex flex-col gap-2">
            <Label>How would you rate your experience?</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs text-muted-foreground">
                {rating === 1 && "We're sorry to hear that. Please let us know how we can improve."}
                {rating === 2 && "We appreciate your feedback. How can we do better?"}
                {rating === 3 && "Thank you for the feedback. What can we improve?"}
                {rating === 4 && "Great! We're glad you had a good experience. Any suggestions?"}
                {rating === 5 && "Awesome! We're thrilled you love our website!"}
              </p>
            )}
          </div>
          
          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              name="name"
              placeholder="Your Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          
          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email"
              type="email" 
              placeholder="Your Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          
          {/* Feedback */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea 
              id="feedback" 
              name="message"
              placeholder="Describe your suggestion." 
              rows={4} 
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <p className="text-sm text-muted-foreground">Please don&apos;t include any sensitive information</p>
          </div>

          {/* Result Message */}
          {result && (
            <div className={`p-3 rounded-md text-sm ${
              result.includes("successfully") 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : result.includes("error") || result.includes("wrong")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}>
              {result}
            </div>
          )}
        </div>
          </form>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button 
            type="submit" 
            className="cursor-target"
            disabled={isSubmitting || rating === 0}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
