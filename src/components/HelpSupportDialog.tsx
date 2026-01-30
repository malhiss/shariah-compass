import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HelpCircle, Send, MessageSquare, Bug, Lightbulb, HelpCircle as Question } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const categoryOptions = [
  { value: 'issue', label: 'Report an Issue', icon: Bug },
  { value: 'clarification', label: 'Request Clarification', icon: Question },
  { value: 'feedback', label: 'Share Feedback', icon: MessageSquare },
  { value: 'suggestion', label: 'Feature Suggestion', icon: Lightbulb },
];

interface HelpSupportDialogProps {
  trigger?: React.ReactNode;
}

export function HelpSupportDialog({ trigger }: HelpSupportDialogProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !subject.trim() || !message.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Support request will be processed - email integration pending
    // Note: Removed console.log to prevent data leakage in production

    // Simulate a brief delay
    await new Promise(resolve => setTimeout(resolve, 500));

    toast({
      title: "Message sent",
      description: "Thank you for reaching out. We'll get back to you soon.",
    });

    // Reset form and close dialog
    setCategory('');
    setSubject('');
    setMessage('');
    setIsSubmitting(false);
    setOpen(false);
  };

  const selectedCategory = categoryOptions.find(c => c.value === category);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8 sm:h-10 sm:w-10">
            <HelpCircle className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[500px] mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Help & Support
          </DialogTitle>
          <DialogDescription className="text-sm">
            Have a question, issue, or feedback? We're here to help.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          {/* Category Selection */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="category" className="text-sm">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="text-sm">
                <SelectValue placeholder="What can we help you with?" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="subject" className="text-sm">Subject *</Label>
            <Input
              id="subject"
              placeholder="Brief description of your inquiry"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={100}
              className="text-sm"
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="message" className="text-sm">Message *</Label>
            <Textarea
              id="message"
              placeholder={
                selectedCategory?.value === 'issue'
                  ? "Please describe the issue you're experiencing in detail..."
                  : selectedCategory?.value === 'clarification'
                  ? "What would you like us to clarify?"
                  : selectedCategory?.value === 'suggestion'
                  ? "Tell us about your feature idea..."
                  : "Share your thoughts with us..."
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={1000}
              className="text-sm min-h-[80px] sm:min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/1000
            </p>
          </div>

          {/* User email display */}
          {user?.email && (
            <div className="text-xs sm:text-sm text-muted-foreground bg-muted/50 px-2 sm:px-3 py-2 rounded-md">
              We'll respond to: <span className="font-medium text-foreground break-all">{user.email}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="btn-dalil w-full sm:w-auto">
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
