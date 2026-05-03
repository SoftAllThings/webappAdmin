/**
 * Client wrapper for the insights endpoints exposed by webappAdminBe.
 * The agent writes briefs/daily-notes to Firestore; the backend reads them
 * and serves them here. Section-feedback writes flow back the same way.
 */

import {apiClient} from "./api.client";
import type {
  Brief,
  DailyNote,
  FeedbackVerdict,
  Period,
  SectionId,
} from "../types/insights";

type Envelope<T> = {success: boolean; data: T; error?: {message: string}};

export type BriefSummary = {
  date: string;
  period: Period;
  generatedAt: string | null;
  modelRunId: string | null;
  tldrHeadline: string | null;
  sectionStatuses: Array<{id: SectionId; status: string}>;
  openThreadCount: number;
};

function qs(params: Record<string, string>): string {
  return new URLSearchParams(params).toString();
}

export const insightsApi = {
  async listBriefs(period: Period, limit = 12): Promise<BriefSummary[]> {
    const res = await apiClient.fetch<Envelope<BriefSummary[]>>(
      `/insights/briefs/${period}?${qs({limit: String(limit)})}`,
    );
    return res.data;
  },

  async getBrief(period: Period, date: string): Promise<Brief> {
    const res = await apiClient.fetch<Envelope<Brief>>(
      `/insights/briefs/${period}/${date}`,
    );
    return res.data;
  },

  async listDailyNotes(limit = 14): Promise<DailyNote[]> {
    const res = await apiClient.fetch<Envelope<DailyNote[]>>(
      `/insights/daily-notes?${qs({limit: String(limit)})}`,
    );
    return res.data;
  },

  async submitFeedback(input: {
    briefDate: string;
    briefPeriod: Period;
    sectionId: SectionId;
    verdict: FeedbackVerdict;
    note?: string;
  }): Promise<{id: string}> {
    const res = await apiClient.fetch<Envelope<{id: string}>>(
      `/insights/feedback`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
    return res.data;
  },
};
