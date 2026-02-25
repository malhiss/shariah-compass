import { Memo } from "@/types/memo";

export const sampleMemos: Memo[] = [
  {
    id: "memo-001",
    ticker: "AAPL",
    title: "Shariah Compliance Review: AAPL",
    date: "2025-01-15",
    author: "Dr. Ahmed Al-Rashid",
    memoMarkdown: `Ticker: AAPL
Verdict: Compliant
Screening Date: 2025-01-15
Analyst: Dr. Ahmed Al-Rashid

---

## Executive Summary

Apple Inc. (AAPL) has been reviewed for Shariah compliance based on our established screening methodology. The company meets all qualitative and quantitative thresholds required for Shariah-compliant investment.

## Business Activity Review

Apple Inc. primarily engages in the design, manufacture, and marketing of:

- Consumer electronics (iPhone, iPad, Mac, Apple Watch)
- Software and services (iOS, macOS, App Store, iCloud)
- Digital content and streaming services

### Permissible Activities

The company's core business activities are **permissible** under Islamic principles. There are no significant revenues derived from:

1. Alcohol or tobacco production
2. Gambling or gaming
3. Conventional financial services
4. Adult entertainment
5. Weapons manufacturing

## Financial Screening Results

| Ratio | Threshold | Actual | Status |
|-------|-----------|--------|--------|
| Debt/Market Cap | < 33% | 12.4% | ✓ Pass |
| Cash/Market Cap | < 33% | 8.7% | ✓ Pass |
| Receivables/Market Cap | < 33% | 5.2% | ✓ Pass |
| Non-Compliant Revenue | < 5% | 1.8% | ✓ Pass |

## Purification Calculation

Based on the non-compliant income ratio of **1.8%**, investors should purify their dividends by donating 1.8% to charity.

> **Note:** Purification applies only to dividend income, not capital gains.

## Conclusion

Based on our comprehensive review, **Apple Inc. (AAPL) is deemed Shariah-compliant** and suitable for inclusion in Islamic investment portfolios.

### Recommendations

- Annual re-screening is recommended
- Monitor debt levels quarterly
- Track any changes in business activities

---

*This memo is for informational purposes only and does not constitute financial advice.*`
  },
  {
    id: "memo-002",
    title: "Quarterly Screening Update Q4 2024",
    date: "2024-12-20",
    author: "Shariah Advisory Board",
    memoMarkdown: `## Quarterly Screening Update

**Period:** Q4 2024
**Reviewed By:** Shariah Advisory Board
**Total Securities Screened:** 2,847

---

## Summary Statistics

This quarter's screening cycle has been completed with the following results:

- **Compliant:** 1,423 securities (50%)
- **Non-Compliant:** 1,089 securities (38%)
- **Under Review:** 335 securities (12%)

## Notable Changes

### Newly Compliant

The following securities have moved to compliant status:

1. **Microsoft Corp (MSFT)** - Debt ratio improved below threshold
2. **Nvidia Corp (NVDA)** - Business activity clarification received
3. **Johnson & Johnson (JNJ)** - Restructuring completed

### Newly Non-Compliant

The following securities are no longer compliant:

1. **Tesla Inc (TSLA)** - Insurance revenue exceeded 5% threshold
2. **PayPal Holdings (PYPL)** - Interest-bearing activities increased

## Methodology Notes

Our screening process follows AAOIFI standards with the following key thresholds:

| Criterion | Threshold |
|-----------|-----------|
| Interest-bearing debt | < 33% of market cap |
| Interest-bearing securities | < 33% of market cap |
| Accounts receivable | < 33% of market cap |
| Non-permissible income | < 5% of revenue |

## Next Steps

- Q1 2025 screening begins January 15th
- Annual methodology review scheduled for February
- New ESG integration guidelines under development

> **Important:** All screening decisions are subject to final approval by the Shariah Supervisory Board.

---

For questions, contact the Shariah Advisory team.`
  }
];

export function getMemoById(id: string): Memo | undefined {
  return sampleMemos.find(memo => memo.id === id);
}

export function getMemosByTicker(ticker: string): Memo[] {
  return sampleMemos.filter(memo => memo.ticker?.toUpperCase() === ticker.toUpperCase());
}

export function getAllMemos(): Memo[] {
  return sampleMemos;
}
