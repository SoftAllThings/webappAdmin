export type TabId = "ai-review" | "analytics" | "v2-analytics" | "product-analytics" | "insights" | "analyst" | "blog" | "model-comparison" | "ml-runs" | "export";

export interface NavigationItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}
