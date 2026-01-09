import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Calculator, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import type { ScreeningRecord } from '@/types/screening-record';

interface QuantitativeScreenSectionProps {
  record: ScreeningRecord;
}

export function QuantitativeScreenSection({ record }: QuantitativeScreenSectionProps) {
  const ruleResult = record.rule_result;
  const hasRatios = record.debt_ratio_pct !== null || record.cash_inv_ratio_pct !== null || record.npin_ratio_pct !== null;

  if (!hasRatios) return null;

  const ratios = [
    { label: 'Debt Ratio', value: record.debt_ratio_pct, threshold: record.debt_threshold_pct ?? 33, status: record.debt_status, formula: record.debt_ratio_formula },
    { label: 'Cash & Investments', value: record.cash_inv_ratio_pct, threshold: record.cash_inv_threshold_pct ?? 33, status: record.cash_inv_status, formula: record.cash_inv_ratio_formula },
    { label: 'NPIN Ratio', value: record.npin_ratio_pct, threshold: record.npin_threshold_pct ?? 5, status: record.npin_status, formula: record.npin_ratio_formula },
  ];

  const getStatusIcon = (status: string | null | undefined) => {
    if (status === 'PASS') return <CheckCircle2 className="w-4 h-4 text-compliant" />;
    if (status === 'FAIL') return <XCircle className="w-4 h-4 text-non-compliant" />;
    return <HelpCircle className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <Card className="premium-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Quantitative Screen</CardTitle>
          </div>
          {ruleResult && (
            <Badge className={ruleResult === 'PASS' ? 'bg-compliant/15 text-compliant' : 'bg-non-compliant/15 text-non-compliant'}>
              {ruleResult}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {ratios.map((ratio, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-border bg-muted/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{ratio.label}</span>
                {getStatusIcon(ratio.status)}
              </div>
              <p className="text-2xl font-bold">
                {ratio.value !== null && ratio.value !== undefined ? `${ratio.value.toFixed(2)}%` : 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground">Threshold: {ratio.threshold}%</p>
            </div>
          ))}
        </div>

        <Accordion type="single" collapsible>
          <AccordionItem value="formulas" className="border-none">
            <AccordionTrigger className="text-sm text-muted-foreground hover:no-underline py-2">
              Explain calculations
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2">
              {ratios.filter(r => r.formula).map((ratio, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-muted/10 border border-border/50">
                  <p className="text-sm font-medium mb-1">{ratio.label}</p>
                  <p className="text-xs text-muted-foreground font-mono">{ratio.formula}</p>
                </div>
              ))}
              {record.npin_adjustments_notes && (
                <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                  <p className="text-sm font-medium mb-1">NPIN Adjustments</p>
                  <p className="text-xs text-muted-foreground">{record.npin_adjustments_notes}</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
