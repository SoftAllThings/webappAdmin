export type TabId = "ai-review" | "analytics" | "blog";

export interface NavigationItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}
