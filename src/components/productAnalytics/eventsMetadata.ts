export type EventCategory =
  | "Onboarding"
  | "Auth"
  | "Scan"
  | "Paywall"
  | "Chat"
  | "Community"
  | "Notifications"
  | "Errors"
  | "Account";

export type EventMeta = {
  label: string;
  category: EventCategory;
  description: string;
};

export const EVENT_META: Record<string, EventMeta> = {
  // Onboarding
  pc_ob_step_viewed: {
    label: "Onboarding step viewed",
    category: "Onboarding",
    description: "User swiped through a step of the intro carousel.",
  },
  pc_ob_completed: {
    label: "Onboarding completed",
    category: "Onboarding",
    description: "User reached the final onboarding step.",
  },
  pc_ob_skipped: {
    label: "Onboarding skipped",
    category: "Onboarding",
    description: "User skipped onboarding before reaching the end.",
  },

  // Auth
  pc_auth_signup_started: {
    label: "Signup started",
    category: "Auth",
    description: "User tapped a signup option (email / Google / Apple).",
  },
  pc_auth_signup_completed: {
    label: "Signup completed",
    category: "Auth",
    description: "Firebase account created successfully. New user acquired.",
  },
  pc_auth_signup_failed: {
    label: "Signup failed",
    category: "Auth",
    description: "Signup attempt threw an error (validation / Firebase error).",
  },
  pc_auth_login_completed: {
    label: "Login completed",
    category: "Auth",
    description: "Returning user successfully signed in.",
  },

  // Scan
  pc_scan_camera_opened: {
    label: "Camera opened",
    category: "Scan",
    description:
      "User arrived at the camera screen with permission granted. Top of the scan funnel.",
  },
  pc_scan_photo_captured: {
    label: "Photo captured",
    category: "Scan",
    description: "User took a photo or picked one from their library.",
  },
  pc_scan_questions_started: {
    label: "Lifestyle wizard started",
    category: "Scan",
    description:
      "User opened the lifestyle questions modal that precedes analysis.",
  },
  pc_scan_questions_completed: {
    label: "Lifestyle wizard completed",
    category: "Scan",
    description: "User answered all lifestyle questions and moved on to analysis.",
  },
  pc_scan_analysis_started: {
    label: "Analysis started",
    category: "Scan",
    description:
      "Request to the AI backend began (SSE stream opened).",
  },
  pc_scan_analysis_completed: {
    label: "Analysis completed",
    category: "Scan",
    description:
      "AI analysis finished successfully. Core value delivery event.",
  },
  pc_scan_first_completed: {
    label: "First scan completed (aha)",
    category: "Scan",
    description:
      "A user's VERY FIRST analysis ever finished successfully. The activation / aha metric — most correlated with retention.",
  },
  pc_scan_result_viewed: {
    label: "Result viewed",
    category: "Scan",
    description: "User opened the analysis result screen.",
  },

  // Paywall
  pc_pw_viewed: {
    label: "Paywall viewed",
    category: "Paywall",
    description:
      "Paywall screen opened. Includes a `source` param telling where the user came from.",
  },
  pc_pw_plan_selected: {
    label: "Plan selected",
    category: "Paywall",
    description: "User tapped the monthly or annual plan tile.",
  },
  pc_pw_purchase_initiated: {
    label: "Purchase initiated",
    category: "Paywall",
    description: "User tapped the buy button — Apple/Google sheet is about to open.",
  },
  pc_pw_purchase_completed: {
    label: "Purchase completed",
    category: "Paywall",
    description:
      "RevenueCat confirmed a successful purchase. Revenue-bearing event.",
  },
  pc_pw_purchase_failed: {
    label: "Purchase failed",
    category: "Paywall",
    description: "Purchase errored or was cancelled by the user.",
  },

  // Chat
  pc_chat_opened: {
    label: "Chat opened",
    category: "Chat",
    description: "Chat modal opened.",
  },
  pc_chat_message_sent: {
    label: "Chat message sent",
    category: "Chat",
    description: "User sent a message to the AI assistant.",
  },

  // Community
  pc_comm_post_published: {
    label: "Post published",
    category: "Community",
    description: "User shared a scan result to the public feed.",
  },
  pc_comm_post_viewed: {
    label: "Post viewed",
    category: "Community",
    description: "User opened a post detail screen.",
  },
  pc_comm_post_liked: {
    label: "Post liked",
    category: "Community",
    description: "User liked a post.",
  },

  // Notifications
  pc_notif_permission_granted: {
    label: "Push permission granted",
    category: "Notifications",
    description: "User allowed push notifications.",
  },
  pc_notif_opened: {
    label: "Notification opened",
    category: "Notifications",
    description:
      "User tapped a push notification (cold start or background).",
  },

  // Errors
  pc_err_camera_denied: {
    label: "Camera permission denied",
    category: "Errors",
    description:
      "User denied camera permission — they cannot take scans without reopening settings.",
  },
  pc_err_analysis_failed: {
    label: "Analysis failed",
    category: "Errors",
    description:
      "AI analysis threw or timed out. Carries an `error_code` param (network, backend, cancelled, etc.).",
  },
};

export function getEventLabel(eventName: string): string {
  return EVENT_META[eventName]?.label ?? eventName;
}

export function getEventDescription(eventName: string): string {
  return EVENT_META[eventName]?.description ?? "";
}

export function getEventCategory(eventName: string): EventCategory | "Other" {
  return EVENT_META[eventName]?.category ?? "Other";
}

export const CATEGORY_ORDER: EventCategory[] = [
  "Onboarding",
  "Auth",
  "Scan",
  "Paywall",
  "Chat",
  "Community",
  "Notifications",
  "Errors",
  "Account",
];
