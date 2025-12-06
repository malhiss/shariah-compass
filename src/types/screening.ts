// TypeScript interfaces matching the actual backend response shapes

export type InvesenseClassification = 
  | 'COMPLIANT' 
  | 'COMPLIANT_WITH_PURIFICATION' 
  | 'NON_COMPLIANT' 
  | 'DOUBTFUL';

export type NumericStatus = 'PASS' | 'FAIL';
export type AutoBannedStatus = 'PASS' | 'FAIL';

export interface SecurityInfo {
  ticker: string;
  company: string;
  sector?: string;
  industry?: string;
  typeOfSecurity?: string;
  reportDate?: string;
}

export interface InvesenseResult {
  classification: InvesenseClassification | null;
  debtRatio: number | null;
  cashInvRatio: number | null;
  npinRatio: number | null;
  purificationRequired: boolean;
  purificationPctRecommended: number | null;
  keyDrivers: string[];
  shariahSummary: string | null;
  notesForPortfolioManager: string | null;
  needsBoardReview: boolean;
  haramRevenuePercent: number | null;
  qaStatus: string | null;
  qaIssues: string[];
  available: boolean;
}

export interface AutoBannedResult {
  status: AutoBannedStatus | null;
  autoBanned: boolean;
  autoBannedReason: string | null;
  industry: string | null;
  securityType: string | null;
  available: boolean;
}

export interface NumericResult {
  status: NumericStatus | null;
  debtRatio: number | null;
  cashInvRatio: number | null;
  npinRatio: number | null;
  failReason: string | null;
  available: boolean;
}

export interface TickerScreeningResponse {
  security: SecurityInfo;
  invesense: InvesenseResult;
  autoBanned: AutoBannedResult;
  numeric: NumericResult;
}

export interface PortfolioHolding {
  ticker: string;
  quantity: number;
  price: number;
}

export interface PortfolioHoldingResult extends PortfolioHolding {
  company: string | null;
  value: number;
  invesense: InvesenseResult;
  autoBanned: AutoBannedResult;
  numeric: NumericResult;
}

export interface MethodologySummary {
  compliantWeight: number;
  compliantWithPurificationWeight: number;
  nonCompliantWeight: number;
  noDataWeight: number;
  totalValue: number;
}

export interface PortfolioScreeningResponse {
  summary: {
    invesense: MethodologySummary;
    autoBanned: MethodologySummary;
    numeric: MethodologySummary;
  };
  holdings: PortfolioHoldingResult[];
  totalValue: number;
}

export interface ScreeningRequestInput {
  ticker: string;
  exchange?: string;
  isin?: string;
  email?: string;
  methodology: 'invesense' | 'numeric' | 'auto_banned';
  useCase?: string;
}

export interface ScreeningRequestResponse {
  success: boolean;
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatRequest {
  ticker: string;
  messages: ChatMessage[];
}

export interface AiChatResponse {
  reply: ChatMessage;
}

// Helper type for status color mapping
export type StatusColor = 'compliant' | 'purification' | 'fail' | 'noData';

export function getStatusColor(
  classification: InvesenseClassification | null | undefined,
  status: NumericStatus | AutoBannedStatus | null | undefined,
  available: boolean
): StatusColor {
  if (!available) return 'noData';
  
  if (classification) {
    switch (classification) {
      case 'COMPLIANT':
        return 'compliant';
      case 'COMPLIANT_WITH_PURIFICATION':
        return 'purification';
      case 'NON_COMPLIANT':
        return 'fail';
      case 'DOUBTFUL':
        return 'noData';
      default:
        return 'noData';
    }
  }
  
  if (status) {
    return status === 'PASS' ? 'compliant' : 'fail';
  }
  
  return 'noData';
}

export function getStatusLabel(
  classification: InvesenseClassification | null | undefined,
  status: NumericStatus | AutoBannedStatus | null | undefined,
  available: boolean
): string {
  if (!available) return 'No Data';
  
  if (classification) {
    switch (classification) {
      case 'COMPLIANT':
        return 'Compliant';
      case 'COMPLIANT_WITH_PURIFICATION':
        return 'Compliant with Purification';
      case 'NON_COMPLIANT':
        return 'Non-Compliant';
      case 'DOUBTFUL':
        return 'Doubtful';
      default:
        return 'Unknown';
    }
  }
  
  if (status) {
    return status === 'PASS' ? 'Pass' : 'Fail';
  }
  
  return 'No Data';
}
