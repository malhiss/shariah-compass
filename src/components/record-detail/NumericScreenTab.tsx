import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatPercent, coerceToNumber } from '@/types/mongodb';
import type { ScreeningRecord } from '@/types/screening-record';
import { Calculator, Info, CheckCircle2, XCircle } from 'lucide-react';

interface NumericScreenTabProps {
  record: ScreeningRecord;
}

const THRESHOLDS = {
  debt: 33,
  cashInv: 33,
  npin: 5,
};

export function NumericScreenTab({ record }: NumericScreenTabProps) {
  // Get ratios - prefer new field names, fallback to old
  const debtRatio = coerceToNumber(record.Debt_Ratio ?? record.Debt_Ratio_Percent);
  const cashInvRatio = coerceToNumber(record.CashInv_Ratio ?? record.Cash_Investment_Ratio_Percent);
  const npinRatio = coerceToNumber(record.NPIN_Ratio ?? record.Non_Permissible_Income_Percent);

  // Check within limits
  const debtWithin = debtRatio !== null ? debtRatio <= THRESHOLDS.debt : null;
  const cashInvWithin = cashInvRatio !== null ? cashInvRatio <= THRESHOLDS.cashInv : null;
  const npinWithin = npinRatio !== null ? npinRatio <= THRESHOLDS.npin : null;

  // Get formulas
  const debtFormula = record.Debt_Ratio_Formula;
  const cashInvFormula = record.CashInv_Ratio_Formula;
  const npinFormula = record.NPIN_Ratio_Formula;
  const npinNumeratorFormula = record.NPIN_Numerator_Formula;
  const npinAdjustments = record.NPIN_Adjustments_Notes;

  const hasFormulas = debtFormula || cashInvFormula || npinFormula || npinNumeratorFormula || npinAdjustments;

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Numeric Screening Ratios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ratios Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">Ratio</TableHead>
                <TableHead className="text-right text-muted-foreground">Value</TableHead>
                <TableHead className="text-right text-muted-foreground">Threshold</TableHead>
                <TableHead className="text-center text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-border">
                <TableCell className="font-medium">Debt Ratio</TableCell>
                <TableCell className="text-right font-mono">
                  {formatPercent(debtRatio)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">≤ {THRESHOLDS.debt}%</TableCell>
                <TableCell className="text-center">
                  {debtWithin === null ? (
                    <Badge variant="secondary" className="bg-muted/30">N/A</Badge>
                  ) : debtWithin ? (
                    <Badge className="bg-compliant/15 text-compliant border-compliant/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Pass
                    </Badge>
                  ) : (
                    <Badge className="bg-non-compliant/15 text-non-compliant border-non-compliant/30">
                      <XCircle className="w-3 h-3 mr-1" /> Fail
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
              <TableRow className="border-border">
                <TableCell className="font-medium">Cash & Investments Ratio</TableCell>
                <TableCell className="text-right font-mono">
                  {formatPercent(cashInvRatio)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">≤ {THRESHOLDS.cashInv}%</TableCell>
                <TableCell className="text-center">
                  {cashInvWithin === null ? (
                    <Badge variant="secondary" className="bg-muted/30">N/A</Badge>
                  ) : cashInvWithin ? (
                    <Badge className="bg-compliant/15 text-compliant border-compliant/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Pass
                    </Badge>
                  ) : (
                    <Badge className="bg-non-compliant/15 text-non-compliant border-non-compliant/30">
                      <XCircle className="w-3 h-3 mr-1" /> Fail
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
              <TableRow className="border-border">
                <TableCell className="font-medium">Non-Permissible Income (NPIN)</TableCell>
                <TableCell className="text-right font-mono">
                  {formatPercent(npinRatio)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">≤ {THRESHOLDS.npin}%</TableCell>
                <TableCell className="text-center">
                  {npinWithin === null ? (
                    <Badge variant="secondary" className="bg-muted/30">N/A</Badge>
                  ) : npinWithin ? (
                    <Badge className="bg-compliant/15 text-compliant border-compliant/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Pass
                    </Badge>
                  ) : (
                    <Badge className="bg-non-compliant/15 text-non-compliant border-non-compliant/30">
                      <XCircle className="w-3 h-3 mr-1" /> Fail
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* How it's calculated Accordion */}
        {hasFormulas && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="formulas" className="border-border">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  How it's calculated
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {debtFormula && (
                    <div>
                      <h5 className="text-sm font-medium mb-1">Debt Ratio Formula</h5>
                      <p className="text-sm text-muted-foreground font-mono bg-muted/20 p-2 rounded">
                        {debtFormula}
                      </p>
                    </div>
                  )}
                  {cashInvFormula && (
                    <div>
                      <h5 className="text-sm font-medium mb-1">Cash & Investments Ratio Formula</h5>
                      <p className="text-sm text-muted-foreground font-mono bg-muted/20 p-2 rounded">
                        {cashInvFormula}
                      </p>
                    </div>
                  )}
                  {npinFormula && (
                    <div>
                      <h5 className="text-sm font-medium mb-1">NPIN Ratio Formula</h5>
                      <p className="text-sm text-muted-foreground font-mono bg-muted/20 p-2 rounded">
                        {npinFormula}
                      </p>
                    </div>
                  )}
                  {npinNumeratorFormula && (
                    <div>
                      <h5 className="text-sm font-medium mb-1">NPIN Numerator Formula</h5>
                      <p className="text-sm text-muted-foreground font-mono bg-muted/20 p-2 rounded">
                        {npinNumeratorFormula}
                      </p>
                    </div>
                  )}
                  {npinAdjustments && (
                    <div>
                      <h5 className="text-sm font-medium mb-1">NPIN Adjustments Notes</h5>
                      <p className="text-sm text-muted-foreground bg-muted/20 p-2 rounded">
                        {npinAdjustments}
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* Threshold reminder */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Standard Thresholds
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Debt ≤ 33% of market cap or total assets</li>
            <li>• Cash & Investments ≤ 33% of market cap or total assets</li>
            <li>• Non-Permissible Income ≤ 5% of total revenue</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2 italic">
            Note: Thresholds may vary by methodology version.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
