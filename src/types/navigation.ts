export type TabId = "ai-review" | "analytics" | "v2-analytics" | "product-analytics" | "blog";

export interface NavigationItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}
