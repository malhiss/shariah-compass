
# Comprehensive Action Plan: Dalil Platform - Production Readiness

## Current State Summary
The platform has been transitioned from demo mode to full production routing, but several inconsistencies, dead code, and incomplete features remain. Below is a detailed breakdown organized by priority.

---

## PHASE 1: Cleanup - Remove Demo Artifacts (High Priority)

### 1.1 Delete Unused Demo Files
The following files are no longer routed but still exist in the codebase:
- `src/pages/Demo.tsx`
- `src/pages/DemoLogin.tsx`
- `src/pages/DemoDashboard.tsx`
- `src/pages/DemoRecordDetail.tsx`
- `src/components/DemoHeader.tsx`
- `src/components/InvitationDialog.tsx` (only used by Demo.tsx)
- `src/components/FeedbackDialog.tsx` (only used by DemoHeader.tsx)

### 1.2 Fix Stale Route References
Multiple components still reference `/shariah-dashboard` instead of `/dashboard`:
- **AppSidebar.tsx** (line 19): Dashboard path is `/shariah-dashboard` -- should be `/dashboard`
- **Header.tsx** (lines 45, 62): `sidebarNavItems` and `pageTitles` use `/shariah-dashboard`
- **ProtectedRoute.tsx** (lines 11, 56, 65, 79): Demo user redirects point to `/shariah-dashboard`

### 1.3 Remove Demo Access Tier Logic
Since demo restrictions are being removed:
- **ProtectedRoute.tsx**: Remove all `isDemoUser` checks and `DEMO_ALLOWED_ROUTES`
- **AppSidebar.tsx**: Remove `demoVisible` filtering and `isDemoUser` import
- **useAuth.tsx**: Keep the `accessTier` field (staff may still use it) but the ProtectedRoute shouldn't block based on it
- **StaffPortal.tsx**: Remove access tier toggle UI (or keep for future use -- needs decision)

### 1.4 Rename "Invesense" to "Dalil" Throughout
The old brand name "Invesense" still appears in:
- CSS class `btn-invesense` used across ~10 files (ScreeningRequest, StaffPortal, AiChat, RecordDetail, etc.)
- ScreeningRequest.tsx: methodology value `'invesense'` and display text "Invesense"
- TickerScreening.tsx: references to `result.invesense.*` (this is an API response field -- rename at API level or alias)
- PortfolioScreening.tsx: `summary.invesense` references
- Various type definitions referencing "invesense" in `src/types/screening.ts`

**Decision needed**: Rename the `btn-invesense` CSS class to `btn-dalil` globally, and update display text. API response field names (`invesense`) can be kept as internal identifiers but display names should say "Dalil".

---

## PHASE 2: Navigation and UX Fixes (High Priority)

### 2.1 Fix Sidebar Navigation
The sidebar (`AppSidebar.tsx`) is missing the "Screen a Ticker" link (`/screen`). The Header hamburger menu has it under "Quick Actions" but the main sidebar does not. Add it to `allSidebarItems`.

### 2.2 Add `/dashboard` to Page Titles
`Header.tsx` `pageTitles` map doesn't include `/dashboard` -- only `/shariah-dashboard`. This means the breadcrumb won't show on the dashboard page.

### 2.3 Fix Header Search Button
The Search icon button in the header (line 194-196 of Header.tsx) has no `onClick` handler -- it does nothing. Either:
- Wire it to navigate to `/screen` (Ticker Screening)
- Or add a command palette / global search modal

### 2.4 Fix Header Notification Bell
The Bell icon (line 198-201 of Header.tsx) shows a fake notification dot but has no functionality. Either:
- Remove it until notifications are implemented
- Or implement a basic notification dropdown

### 2.5 Fix Disabled Settings Menu Item
The "Settings" dropdown item (line 244-247) is permanently disabled. Either remove it or build a settings page.

### 2.6 Disclaimer Gate Integration
The `DisclaimerGate` component exists and the `disclaimer_accepted_at` field works, but it is NOT used in the main Layout/ProtectedRoute flow. It was only used in `DemoDashboard.tsx` (which is being deleted). 

**Action**: Integrate the DisclaimerGate into `ProtectedRoute.tsx` or `Layout.tsx` so authenticated users who haven't accepted the disclaimer are shown the gate before accessing any protected page.

---

## PHASE 3: Backend Edge Functions Audit (Medium Priority)

### 3.1 `ticker-screening` Edge Function
- **Status**: Working. Uses `_shared/sample-data.ts` to look up CSV data on the server side.
- **Issue**: Logs activity but the `invesense` property name in the response should display as "Dalil" on the frontend.

### 3.2 `portfolio-screening` Edge Function
- **Status**: The edge function exists in `supabase/functions/portfolio-screening/` but the frontend (`src/lib/api.ts` `screenPortfolio`) performs screening locally using CSV data -- it does NOT call the edge function.
- **Action**: Either remove the edge function (since screening is local) or switch to using it for server-side screening. Currently no activity logging happens for portfolio screenings since it's client-side.

### 3.3 `ai-chat` Edge Function
- **Status**: Working. Uses Lovable AI Gateway with `google/gemini-2.5-flash`.
- **Issue**: No activity logging for AI chat sessions (unlike ticker-screening which logs). Should add activity logging.

### 3.4 `submit-screening-request` Edge Function
- **Status**: Working. Connects to MongoDB to store screening requests.
- **Issue**: The `methodology` field still defaults to `'invesense'` -- should be `'dalil'`.

### 3.5 `shariah-dashboard` Edge Function
- **Status**: Exists but the frontend (`src/lib/shariah-api.ts`) loads data directly from CSV files, NOT from this edge function.
- **Action**: Either remove this edge function or migrate the dashboard to use it (for server-side data).

### 3.6 `manage-users` Edge Function
- **Status**: Working for Staff Portal operations and client activity log fetching.

### 3.7 `notify-access-request` and `notify-feedback` Edge Functions
- **Status**: These use Resend API for email notifications. Should verify they're still being called correctly.

### 3.8 `auto-login` Edge Function
- **Status**: Used for token-based auto-login. Verify it's still needed or can be removed.

---

## PHASE 4: Feature Completeness (Medium Priority)

### 4.1 Memos Page - Missing Sidebar Integration
The Memos page (`/memos`) exists and is routed but:
- Not in the sidebar navigation
- Not in the Header hamburger menu
- Uses plain layout (no AppSidebar wrapper)
**Action**: Add to sidebar and wrap with AppSidebar.

### 4.2 Password Reset Flow
`ClientLogin.tsx` has no "Forgot Password" link. There is no `/reset-password` page. Users have no way to reset their password.
**Action**: Add forgot password flow with email reset and a `/reset-password` page.

### 4.3 Signup Flow
`ClientLogin.tsx` doesn't appear to have a sign-up option. New users can only be created by staff or via access requests.
**Decision needed**: Is this intentional (invite-only platform)?

### 4.4 Activity Logging Gaps
Activity logging only happens for `ticker_screening` (via edge function). The following are NOT logged:
- Portfolio screening (runs client-side)
- AI chat sessions
- Screening requests (submitted to MongoDB but not logged in Supabase `activity_logs`)

---

## PHASE 5: Polish and Production Readiness (Lower Priority)

### 5.1 About Page - Leadership Section
The About page references a "Leadership" page concept in the memory but the About page itself contains firm values and approaches. Verify the team member images in `src/assets/team/` are being used somewhere or if a Leadership section needs to be added.

### 5.2 SEO and Meta Tags
`SEOHead` component exists. Verify all pages have appropriate titles and descriptions.

### 5.3 Mobile Performance
Recent optimizations were made to Home.tsx and Demo.tsx. Since Demo.tsx is being removed, ensure the optimizations in Home.tsx are preserved. Check that dashboard and record detail pages are performant on mobile.

### 5.4 Error Handling
- Ensure all edge function calls handle 401 errors gracefully (session expiration)
- The `Header.tsx` has no error boundary

### 5.5 Disclaimer Content Update
Remove the "Demonstration Environment" section from the DisclaimerGate since the platform is no longer in demo mode.

---

## Technical Summary - Files to Modify

| Action | Files |
|--------|-------|
| Delete | `Demo.tsx`, `DemoLogin.tsx`, `DemoDashboard.tsx`, `DemoRecordDetail.tsx`, `DemoHeader.tsx`, `InvitationDialog.tsx`, `FeedbackDialog.tsx` |
| Fix routes | `AppSidebar.tsx`, `Header.tsx`, `ProtectedRoute.tsx` |
| Add DisclaimerGate | `ProtectedRoute.tsx` or `Layout.tsx` |
| Rename branding | `ScreeningRequest.tsx`, CSS classes across ~10 files |
| Add features | Password reset page, Memos sidebar link |
| Backend | Audit/remove unused edge functions (`portfolio-screening`, `shariah-dashboard`) |
| Add logging | `ai-chat/index.ts`, `src/lib/api.ts` (portfolio) |

---

## Recommended Execution Order
1. Phase 1 (Cleanup) -- eliminates confusion and dead code
2. Phase 2 (Navigation/UX) -- fixes broken UI elements
3. Phase 4.1 + 4.2 (Memos + Password Reset) -- critical missing features
4. Phase 3 (Backend audit) -- remove/align unused edge functions
5. Phase 5 (Polish) -- final production touches
