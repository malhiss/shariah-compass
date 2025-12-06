import type {
  TickerScreeningResponse,
  PortfolioScreeningResponse,
  PortfolioHolding,
  ScreeningRequestInput,
  ScreeningRequestResponse,
  ChatMessage,
  AiChatResponse,
} from '@/types/screening';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function callEdgeFunction<T>(
  functionName: string,
  body: Record<string, unknown>
): Promise<T> {
  if (!SUPABASE_URL) {
    throw new Error('Supabase URL not configured');
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(SUPABASE_ANON_KEY && { Authorization: `Bearer ${SUPABASE_ANON_KEY}` }),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function screenTicker(ticker: string): Promise<TickerScreeningResponse> {
  return callEdgeFunction<TickerScreeningResponse>('ticker-screening', { ticker });
}

export async function screenPortfolio(
  holdings: PortfolioHolding[]
): Promise<PortfolioScreeningResponse> {
  return callEdgeFunction<PortfolioScreeningResponse>('portfolio-screening', { holdings });
}

export async function submitScreeningRequest(
  input: ScreeningRequestInput
): Promise<ScreeningRequestResponse> {
  return callEdgeFunction<ScreeningRequestResponse>('submit-screening-request', input as unknown as Record<string, unknown>);
}

export async function sendAiChatMessage(
  ticker: string,
  messages: ChatMessage[]
): Promise<AiChatResponse> {
  return callEdgeFunction<AiChatResponse>('ai-chat', { ticker, messages });
}

// Parse CSV file content to holdings array
export function parseCSVToHoldings(csvContent: string): PortfolioHolding[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have a header row and at least one data row');
  }

  const header = lines[0].toLowerCase().split(',').map(h => h.trim());
  const tickerIdx = header.findIndex(h => h.includes('ticker') || h.includes('symbol'));
  const quantityIdx = header.findIndex(h => h.includes('quantity') || h.includes('qty') || h.includes('shares'));
  const priceIdx = header.findIndex(h => h.includes('price') || h.includes('cost'));

  if (tickerIdx === -1) {
    throw new Error('CSV must have a ticker/symbol column');
  }
  if (quantityIdx === -1) {
    throw new Error('CSV must have a quantity/qty/shares column');
  }
  if (priceIdx === -1) {
    throw new Error('CSV must have a price/cost column');
  }

  const holdings: PortfolioHolding[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < Math.max(tickerIdx, quantityIdx, priceIdx) + 1) {
      continue; // Skip incomplete rows
    }

    const ticker = values[tickerIdx].toUpperCase();
    const quantity = parseFloat(values[quantityIdx]);
    const price = parseFloat(values[priceIdx]);

    if (ticker && !isNaN(quantity) && !isNaN(price) && quantity > 0 && price > 0) {
      holdings.push({ ticker, quantity, price });
    }
  }

  if (holdings.length === 0) {
    throw new Error('No valid holdings found in CSV');
  }

  return holdings;
}
