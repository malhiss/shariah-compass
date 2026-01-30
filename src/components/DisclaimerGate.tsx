import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DisclaimerGateProps {
  userId: string;
  onAccepted: () => void;
}

export function DisclaimerGate({ userId, onAccepted }: DisclaimerGateProps) {
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAccept = async () => {
    if (!agreed) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ disclaimer_accepted_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      
      onAccepted();
    } catch (error) {
      console.error('Failed to save disclaimer acceptance:', error);
      toast({
        title: "Error",
        description: "Failed to save your acceptance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl bg-card border border-border rounded-lg sm:rounded-xl shadow-2xl my-4 sm:my-8"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-warning/10 shrink-0">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
            </div>
            <h1 className="text-lg sm:text-2xl font-serif font-bold text-foreground leading-tight">
              Risk Disclosure & Terms of Use
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Please read carefully before proceeding.
          </p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto space-y-4 sm:space-y-6">
          <p className="text-muted-foreground text-sm sm:text-base">
            By accessing and using this platform, you acknowledge and agree to the following:
          </p>

          {/* Section 1 */}
          <div className="space-y-1.5 sm:space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              1. Not Financial or Religious Advice
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              The information provided on this platform is for informational and educational purposes only. It does not constitute financial, investment, legal, or Shariah (religious) advice.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-1.5 sm:space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              2. Consult Qualified Advisors
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              Before making any investment or compliance-related decisions, you should consult with qualified financial professionals and recognized Shariah scholars who can assess your individual circumstances.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-1.5 sm:space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              3. No Guarantee of Accuracy
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              While we strive to provide accurate and up-to-date screening results, all outputs are based on publicly available information and proprietary screening methodologies. We do not guarantee the completeness, reliability, or timeliness of the data presented.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-1.5 sm:space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              4. Shariah Compliance Disclaimer
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              Shariah screening results reflect our interpretation based on the Invesense methodology. Different scholars, boards, or institutions may arrive at different conclusions. The final determination of Shariah compliance remains the responsibility of the user and their chosen religious authority.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-1.5 sm:space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              5. Investment Risk Warning
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              All investments involve risk, including the potential loss of principal. Past performance is not indicative of future results.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-1.5 sm:space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              6. Demonstration Environment
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              This platform may operate in a demonstration or testing environment. Information displayed may be illustrative and may not reflect real-time or current market conditions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-border space-y-3 sm:space-y-4">
          <label className="flex items-start gap-2 sm:gap-3 cursor-pointer group">
            <Checkbox
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
              className="mt-0.5"
            />
            <span className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
              I have read, understood, and agree to the above terms and disclosures.
            </span>
          </label>

          <Button
            onClick={handleAccept}
            disabled={!agreed || isSubmitting}
            className="w-full text-sm sm:text-base"
            size="lg"
          >
            {isSubmitting ? 'Processing...' : 'Accept & Continue'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
