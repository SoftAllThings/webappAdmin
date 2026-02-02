export type TabId = "ai-review" | "analytics";

export interface NavigationItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}
