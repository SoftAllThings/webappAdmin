/**
 * Dashboard-side mirror of functions/src/agent/types.ts in the poopcheck repo.
 *
 * Wire format: webappAdminBe serializes Firestore Timestamps to ISO strings
 * before sending to the client, so timestamp fields are typed as `string`
 * here (whereas the backend types use `Timestamp`). All other shapes match.
 *
 * Keep in sync with the backend file. When we extract a shared package later,
 * delete this duplicate.
 */

// ─── Period & section ids ─────────────────────────────────────────────────

export type Period = "daily" | "weekly" | "monthly";

export type SectionId =
  | "tldr"
  | "revenue"
  | "acquisition"
  | "engagement"
  | "retention"
  | "feature_usage"
  | "anomalies"
  | "discussion"
  | "open_threads";

// ─── Metric snapshot ──────────────────────────────────────────────────────

export interface StoreSplit {
  ios: number;
  android: number;
  stripe: number;
}

export interface StreakBucket {
  minDays: number;
  maxDays: number;
  users: number;
}

export interface CohortRetention {
  cohortStart: string;
  cohortSize: number;
  d1: number;
  d7: number;
  d30: number;
}

export interface FeatureUsageMeasurement {
  events: number;
  uniqueUsers: number;
}

export interface MetricSnapshot {
  date: string;
  computedAt: string;

  user: {
    dau: number;
    wau: number;
    mau: number;
    newSignups: number;
    totalUsers: number;
  };

  engagement: {
    poopsLogged: number;
    activeLoggers: number;
    retentionD1: number;
    retentionD7: number;
    retentionD30: number;
    streakDistribution: StreakBucket[];
  };

  revenue: {
    activeSubs: number;
    mrr: number;
    arr: number;
    arpu: number;
    newSubs: number;
    churnedSubs: number;
    churnRate: number;
    trialsStarted: number;
    trialsConverted: number;
    trialConversionRate: number;
    byStore: StoreSplit;
    byTier: Record<string, number>;
  };

  cohort: {
    signupCohort: Record<string, CohortRetention>;
  };

  featureUsage: Record<string, FeatureUsageMeasurement>;
}

// ─── Evidence ─────────────────────────────────────────────────────────────

export interface Evidence {
  tool: string;
  args: Record<string, unknown>;
  resultSummary: string;
  resultData: unknown;
}

// ─── Charts and callouts ──────────────────────────────────────────────────

export type ChartType = "line" | "bar" | "area" | "heatmap";

export interface Chart {
  type: ChartType;
  title: string;
  data: unknown;
}

export type CalloutSeverity = "info" | "watch" | "concern";

export interface Callout {
  severity: CalloutSeverity;
  text: string;
  evidence?: Evidence;
}

// ─── Report sections ──────────────────────────────────────────────────────

export type SectionStatus = "filled" | "no_change" | "insufficient_data";

export interface DrillInLink {
  label: string;
  path: string;
}

export interface ReportSection {
  id: SectionId;
  title: string;
  headline: string;
  narrative: string;
  charts: Chart[];
  callouts: Callout[];
  evidence: Evidence[];
  status: SectionStatus;
  drillInLinks: DrillInLink[];
}

// ─── Discussion ───────────────────────────────────────────────────────────

export interface DiscussionItem {
  question: string;
  agentRead: string;
  recommendation: string;
  whatWouldChangeMyMind: string;
  evidence: Evidence[];
}

// ─── Open threads ─────────────────────────────────────────────────────────

export type ThreadStatus = "watching" | "resolved" | "escalated";

export interface OpenThread {
  id: string;
  topic: string;
  firstSeen: string;
  lastUpdate: string;
  status: ThreadStatus;
  notes: string[];
}

// ─── Brief ────────────────────────────────────────────────────────────────

export interface Brief {
  period: Period;
  date: string;
  generatedAt: string;
  modelRunId: string;
  sections: ReportSection[];
  discussion?: DiscussionItem[];
  openThreads: OpenThread[];
}

// ─── Daily note ───────────────────────────────────────────────────────────

export interface DailyNote {
  date: string;
  generatedAt: string;
  modelRunId: string;
  observations: string[];
  anomalies: Callout[];
  threadsTouched: string[];
}

// ─── Section feedback ─────────────────────────────────────────────────────

export type FeedbackVerdict = "useful" | "noise" | "wrong";

export interface SectionFeedback {
  briefDate: string;
  briefPeriod: Period;
  sectionId: SectionId;
  verdict: FeedbackVerdict;
  note?: string;
  submittedAt: string;
}
