# PoopCheck — Firebase Analytics Audit & Custom Dashboard Guide

## Context

This document captures a research session auditing every Firebase Analytics event in the PoopCheck codebase, plus guidance on piping the raw data into a custom dashboard at zero cost. It is a reference doc — no code changes proposed.

---

## Part 1 — Analytics Architecture

- **Central service**: [src/services/analytics.ts](src/services/analytics.ts) — `AnalyticsService` singleton wrapping `@react-native-firebase/analytics`
- **Type definitions**: [src/types/analytics.types.ts](src/types/analytics.types.ts) — 57 events + 4 user properties, strictly typed
- **Event prefix**: all events prefixed `pc_` to separate V2 telemetry from V1 data
- **Fire-and-forget**: every `.logEvent()` call swallows errors via `.catch(() => {})` so analytics never block app flow
- **Screen tracking**: manual via `analyticsService.trackScreen()` — `useScreenTracking` hook exists at [src/hooks/useScreenTracking.ts](src/hooks/useScreenTracking.ts) but is **never used**
- **User ID**: `identify(uid)` on auth at [auth.ts:328](src/services/auth.ts#L328); cleared on logout at [auth.ts:350](src/services/auth.ts#L350)

---

## Part 2 — Full Event Inventory

Totals: **57 defined · 36 live · 21 defined-but-not-logged**.

| # | Event | Status | Params | Purpose / When captured | Where |
|---|---|---|---|---|---|
| **Onboarding** |
| 1 | `pc_ob_step_viewed` | Live | `step: 1\|2\|3` | User swipes through intro carousel | [WelcomeScreen.tsx:53](src/screens/onboarding/WelcomeScreen.tsx#L53) |
| 2 | `pc_ob_completed` | Live | — | User reaches final onboarding step | [WelcomeScreen.tsx:58](src/screens/onboarding/WelcomeScreen.tsx#L58) |
| 3 | `pc_ob_skipped` | Live | `last_step` | User skips onboarding to login/signup | [WelcomeScreen.tsx:66](src/screens/onboarding/WelcomeScreen.tsx#L66) |
| **Auth** |
| 4 | `pc_auth_signup_started` | Live | `method: email\|google\|apple` | User taps signup option | [SignUpScreen.tsx:74](src/screens/onboarding/SignUpScreen.tsx#L74) |
| 5 | `pc_auth_signup_completed` | Live | `method` | Firebase account created successfully | [SignUpScreen.tsx:78](src/screens/onboarding/SignUpScreen.tsx#L78) |
| 6 | `pc_auth_signup_failed` | Live | `method`, `error_code` | Signup throws (validation / Firebase error) | [SignUpScreen.tsx:83](src/screens/onboarding/SignUpScreen.tsx#L83) |
| 7 | `pc_auth_login_started` | Live | `method` | User taps login option | [LoginScreen.tsx:64](src/screens/onboarding/LoginScreen.tsx#L64) |
| 8 | `pc_auth_login_completed` | Live | `method` | Login succeeds | [LoginScreen.tsx:68](src/screens/onboarding/LoginScreen.tsx#L68) |
| 9 | `pc_auth_login_failed` | Live | `method`, `error_code` | Login throws | [LoginScreen.tsx:73](src/screens/onboarding/LoginScreen.tsx#L73) |
| 10 | `pc_auth_logout` | Live | — | User signs out | [auth.ts:349](src/services/auth.ts#L349) |
| **Scan / Analysis** |
| 11 | `pc_scan_camera_opened` | Live | — | Camera permission granted & screen focused | [LogPhotoScreen.tsx:148](src/screens/logPhoto/LogPhotoScreen.tsx#L148) |
| 12 | `pc_scan_photo_captured` | Live | — | User takes/picks a photo | [LogPhotoScreen.tsx:94](src/screens/logPhoto/LogPhotoScreen.tsx#L94) |
| 13 | `pc_scan_edit_action` | Live | `action: crop\|rotate\|download` | User edits photo before analysis | [EditSnapScreen.tsx:88](src/screens/logPhoto/EditSnapScreen.tsx#L88) |
| 14 | `pc_scan_questions_started` | Live | — | Lifestyle wizard modal opens | [useQuestionsWizard.ts:69](src/hooks/useQuestionsWizard.ts#L69) |
| 15 | `pc_scan_questions_completed` | Live | — | Wizard finished | [useQuestionsWizard.ts:182](src/hooks/useQuestionsWizard.ts#L182) |
| 16 | `pc_scan_questions_abandoned` | Live | `last_step` | Wizard unmounted before completion | [useQuestionsWizard.ts:164](src/hooks/useQuestionsWizard.ts#L164) |
| 17 | `pc_scan_analysis_started` | Live | — | SSE request to softai begins | [useAnalysisProgress.ts:84](src/hooks/useAnalysisProgress.ts#L84) |
| 18 | `pc_scan_analysis_completed` | Live | `duration_ms` | Analysis finished OK | [useAnalysisProgress.ts:129](src/hooks/useAnalysisProgress.ts#L129) |
| 19 | `pc_scan_first_completed` | Live | `time_since_signup_ms` | User's first-ever analysis completes (aha metric) | [RootNavigator.tsx:579](src/navigation/RootNavigator.tsx#L579) |
| 20 | `pc_scan_result_viewed` | Live | — | Result screen opened | [RootNavigator.tsx:686](src/navigation/RootNavigator.tsx#L686) |
| **Paywall** |
| 21 | `pc_pw_viewed` | Live | `source` | Paywall screen opens | [PremiumWallScreen.tsx:109](src/screens/PremiumWallScreen.tsx#L109) |
| 22 | `pc_pw_plan_selected` | Live | `plan: monthly\|annual` | User taps plan tile | [PremiumWallScreen.tsx:169](src/screens/PremiumWallScreen.tsx#L169) |
| 23 | `pc_pw_purchase_initiated` | Live | `plan` | User taps buy button | [PremiumWallScreen.tsx:148](src/screens/PremiumWallScreen.tsx#L148) |
| 24 | `pc_pw_purchase_completed` | Live | `plan` | RevenueCat purchase succeeds | [PurchasesContext.tsx:268](src/contexts/PurchasesContext.tsx#L268) |
| 25 | `pc_pw_purchase_failed` | Live | `error` | Purchase errors / cancels | [PurchasesContext.tsx:296](src/contexts/PurchasesContext.tsx#L296) |
| 26 | `pc_pw_dismissed` | Live | `source` | Paywall modal closed | [RootNavigator.tsx:389](src/navigation/RootNavigator.tsx#L389) |
| **Chat** |
| 27 | `pc_chat_opened` | Live | `source` | Chat modal opens | [ChatScreen.tsx:73](src/screens/profile/ChatScreen.tsx#L73) |
| 28 | `pc_chat_message_sent` | Live | — | User sends a message | [ChatScreen.tsx:235](src/screens/profile/ChatScreen.tsx#L235) |
| 29 | `pc_chat_history_viewed` | Live | — | User selects past chat from history | [ChatScreen.tsx:133](src/screens/profile/ChatScreen.tsx#L133) |
| 30 | `pc_chat_closed` | Not logged | — | Defined but never logged (future) | — |
| **Community** |
| 31 | `pc_comm_post_published` | Live | — | User publishes result to feed | [RootNavigator.tsx:792](src/navigation/RootNavigator.tsx#L792) |
| 32 | `pc_comm_post_viewed` | Live | — | Post detail opens | [usePublicPost.ts:123](src/hooks/usePublicPost.ts#L123) |
| 33 | `pc_comm_post_liked` | Live | — | User likes a post | [usePublicPost.ts:213](src/hooks/usePublicPost.ts#L213) |
| 34 | `pc_comm_post_unliked` | Live | — | User removes like | [usePublicPost.ts:214](src/hooks/usePublicPost.ts#L214) |
| 35 | `pc_comm_comment_added` | Live | — | Top-level comment posted | [usePublicPost.ts:288](src/hooks/usePublicPost.ts#L288) |
| 36 | `pc_comm_reply_added` | Live | — | Nested reply posted | [usePublicPost.ts:288](src/hooks/usePublicPost.ts#L288) |
| 37 | `pc_comm_feed_viewed` | Not logged | — | Defined but never logged (future) | — |
| 38 | `pc_comm_profile_viewed` | Not logged | — | Defined but never logged (future) | — |
| 39 | `pc_comm_leaderboard_viewed` | Not logged | — | Defined but never logged (future) | — |
| **Notifications** |
| 40 | `pc_notif_permission_granted` | Live | — | User grants push permission | [notifications.ts:31](src/services/notifications.ts#L31) |
| 41 | `pc_notif_permission_denied` | Live | — | User denies push permission | [notifications.ts:43](src/services/notifications.ts#L43) |
| 42 | `pc_notif_opened` | Live | `notification_type: background_tap\|cold_start` | User taps a notification | [RootNavigator.tsx:930](src/navigation/RootNavigator.tsx#L930) |
| **Errors / Friction** |
| 43 | `pc_err_camera_denied` | Live | — | User denies camera permission | [LogPhotoScreen.tsx:150](src/screens/logPhoto/LogPhotoScreen.tsx#L150) |
| 44 | `pc_err_analysis_failed` | Live | `error_code: cancelled\|network\|backend\|sse_incomplete\|image_prep_failed\|unknown` | Analysis throws / times out | [useAnalysisProgress.ts:146](src/hooks/useAnalysisProgress.ts#L146) |
| **Account / Settings** |
| 45 | `pc_acct_settings_opened` | Live | — | Settings modal opens | [SettingsScreen.tsx:39](src/screens/profile/SettingsScreen.tsx#L39) |
| 46 | `pc_acct_delete_initiated` | Live | — | Deletion modal opens | [SettingsScreen.tsx:83](src/screens/profile/SettingsScreen.tsx#L83) |
| 47 | `pc_acct_delete_confirmed` | Live | — | User confirms account deletion | [SettingsScreen.tsx:92](src/screens/profile/SettingsScreen.tsx#L92) |
| 48 | `pc_acct_lifestyle_updated` | Not logged | `field` | Defined but never logged (future) | — |
| 49 | `pc_acct_account_updated` | Not logged | `field` | Defined but never logged (future) | — |
| 50 | `pc_acct_widget_added` | Not logged | — | Defined but never logged (future) | — |
| **Navigation** |
| 51 | `pc_nav_screen_view` | Wrapper — never called | `screen_name`, `screen_class` | `trackScreen()` exists but `useScreenTracking` hook is never wired into screens | [analytics.ts:33](src/services/analytics.ts#L33) |
| **Revenue** (all future; likely RevenueCat webhook candidates) |
| 52 | `pc_rev_subscription_renewed` | Not logged | — | — | — |
| 53 | `pc_rev_subscription_cancelled` | Not logged | — | — | — |
| 54 | `pc_rev_trial_started` | Not logged | — | — | — |
| 55 | `pc_rev_trial_converted` | Not logged | — | — | — |
| **Sharing** |
| 56 | `pc_share_result_shared` | Not logged | `method` | — | — |
| 57 | `pc_share_referral_sent` | Not logged | — | — | — |

### User Properties (segmentation)

| Property | Values | Where set |
|---|---|---|
| `is_premium` | `'true' \| 'false'` | [auth.ts:331](src/services/auth.ts#L331), [PurchasesContext.tsx:271](src/contexts/PurchasesContext.tsx#L271) |
| `has_lifestyle_info` | `'true' \| 'false'` | [auth.ts:332](src/services/auth.ts#L332) |
| `signup_method` | `'email' \| 'google' \| 'apple'` (new signup only) | [auth.ts:339](src/services/auth.ts#L339) |
| `notification_permission` | `'granted' \| 'denied' \| 'not_asked'` | [notifications.ts:32](src/services/notifications.ts#L32) |

### Crashlytics

Minimal use — one breadcrumb at [EditSnapScreen.tsx:59-62](src/screens/logPhoto/EditSnapScreen.tsx#L59-L62). No general error reporting wired up.

### Gaps

- **21 events defined but never logged** — see "Not logged" rows above
- **Screen views aren't tracked** — `useScreenTracking` is defined but unused
- **Revenue events** — no client-side implementation; consider RevenueCat webhooks server-side

A CSV export of this table also exists at [firebase-analytics-events.csv](/Users/fab/Desktop/PoopCheck/firebase-analytics-events.csv).

---

## Part 3 — Getting Raw Data into Your Own Dashboard (Zero Cost)

### Comparison of options

| Option | Granularity | Cost | Best for |
|---|---|---|---|
| **BigQuery export** | Raw events (row-level) | Free tier covers small/mid apps | Custom dashboards, SQL flexibility |
| GA4 Data API | Aggregated reports only | Free | Embedding a few pre-defined charts |
| Measurement Protocol | N/A (write-only) | Free | Sending server events IN, not reading |
| Looker Studio | Aggregated | Free | Zero-code dashboards |

**Recommendation**: BigQuery export — it's the only way to get row-level raw data, and the free tier is generous enough to cover PoopCheck indefinitely.

### Free tier math

- **10 GB storage** / month free (never expires)
- **1 TB queries** / month free
- **Daily batch export** from Firebase → BigQuery: fully free (streaming export is paid past 1 GB/day)

For a consumer app firing ~20 events/user/day with 10k MAU (~6M events/month), you're well under a GB and effectively free forever.

### Setup

1. Firebase Console → ⚙️ Project Settings → **Integrations** → BigQuery → **Link**
2. Pick or create a GCP project (free)
3. Choose **Daily** export (free) rather than Streaming
4. Data starts flowing the next day into `analytics_<PROPERTY_ID>.events_YYYYMMDD` tables

### Safety net

GCP Console → **Billing → Budgets & alerts** → set a `$0` budget with email alert at `$0.01`. You get notified immediately if anything would cost money.

### Pipeline into your dashboard

```
Firebase Analytics → (daily export) → BigQuery → your backend → dashboard frontend
```

**Never** query BigQuery from browser JS — it'd expose your service account key. Always proxy through a backend (softai-backend is a natural fit).

### Minimal Node example

```js
import { BigQuery } from '@google-cloud/bigquery';
const bq = new BigQuery({ keyFilename: 'sa.json' });

app.get('/api/metrics/signups', async (req, res) => {
  const [rows] = await bq.query(`
    SELECT DATE(TIMESTAMP_MICROS(event_timestamp)) AS day,
           COUNT(*) AS count
    FROM \`your-project.analytics_XXX.events_*\`
    WHERE event_name = 'pc_auth_signup_completed'
      AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    GROUP BY day ORDER BY day
  `);
  res.json(rows);
});
```

### Schema reference

Each event row has:

```sql
SELECT
  event_name,
  event_timestamp,
  user_pseudo_id,
  user_properties,     -- repeated record: is_premium, has_lifestyle_info, signup_method, notification_permission
  event_params,        -- repeated record: method, plan, source, step, duration_ms, error_code, etc.
  geo.country,
  device.operating_system
FROM `your-project.analytics_XXX.events_*`
WHERE event_name LIKE 'pc_%'
  AND _TABLE_SUFFIX BETWEEN '20260301' AND '20260417'
```

`event_params` is an ARRAY of STRUCT — use `UNNEST` to pull the typed fields.

### Cost-saving tips

- Use **scheduled queries** (free) to pre-aggregate raw events into small summary tables nightly. Dashboard queries hit summaries → tiny, fast, ~free.
- Cache dashboard results in Redis / memory (5–15 min TTL) so page refreshes don't re-query BQ.
- Always use `_TABLE_SUFFIX BETWEEN ...` to partition-prune; scanning `events_*` without a date filter reads everything.

### What you'll need to build

1. Enable BQ export (Firebase Console, 2 min)
2. Create GCP service account with `BigQuery Data Viewer` + `BigQuery Job User`, download JSON key
3. Add BQ query endpoints to `softai-backend` (or a new service)
4. Build the frontend dashboard against those endpoints (Chart.js / Recharts / ECharts)
