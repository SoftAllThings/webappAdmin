export type EventCategory =
  | "Onboarding"
  | "Auth"
  | "Scan"
  | "Paywall"
  | "Chat"
  | "Community"
  | "Navigation"
  | "Notifications"
  | "Errors"
  | "System"
  | "Account"
  | "Revenue"
  | "Sharing"
  | "Dashboard";

export type EventMeta = {
  label: string;
  category: EventCategory;
  description: string;
};

export const EVENT_META: Record<string, EventMeta> = {
  // ── Onboarding ──────────────────────────────────────────────────────────────
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

  // ── Auth ────────────────────────────────────────────────────────────────────
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
  pc_auth_login_started: {
    label: "Login started",
    category: "Auth",
    description: "Returning user tapped a login option.",
  },
  pc_auth_login_completed: {
    label: "Login completed",
    category: "Auth",
    description: "Returning user successfully signed in.",
  },
  pc_auth_login_failed: {
    label: "Login failed",
    category: "Auth",
    description: "Login attempt errored (wrong password, network, etc.).",
  },
  pc_auth_logout: {
    label: "Logout",
    category: "Auth",
    description: "User signed out of the app.",
  },

  // ── Scan ────────────────────────────────────────────────────────────────────
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
  pc_scan_gallery_opened: {
    label: "Gallery opened",
    category: "Scan",
    description: "User opened the system photo picker as an alternative to the camera.",
  },
  pc_scan_gallery_picked: {
    label: "Gallery photo picked",
    category: "Scan",
    description: "User selected a photo from the gallery (carries `uri_scheme`).",
  },
  pc_scan_gallery_cancelled: {
    label: "Gallery cancelled",
    category: "Scan",
    description: "User dismissed the gallery picker without selecting an image.",
  },
  pc_scan_preview_resize_started: {
    label: "Preview resize started",
    category: "Scan",
    description: "Diagnostic — preview thumbnail resize began.",
  },
  pc_scan_preview_resize_failed: {
    label: "Preview resize failed",
    category: "Scan",
    description: "Diagnostic — preview thumbnail resize threw.",
  },
  pc_scan_preview_load_failed: {
    label: "Preview load failed",
    category: "Scan",
    description: "Diagnostic — preview image failed to load on the result screen.",
  },
  pc_scan_crop_opened: {
    label: "Crop UI opened",
    category: "Scan",
    description: "User opened the crop screen before submitting.",
  },
  pc_scan_crop_failed: {
    label: "Crop failed",
    category: "Scan",
    description: "Crop step errored (carries `error_name`).",
  },
  pc_scan_image_prep_started: {
    label: "Image prep started",
    category: "Scan",
    description:
      "Diagnostic — local image normalisation pipeline began (resize/compress before upload).",
  },
  pc_scan_image_prep_crop_failed: {
    label: "Image prep crop failed",
    category: "Scan",
    description: "Diagnostic — image-prep crop step failed.",
  },
  pc_scan_image_prep_compress_failed: {
    label: "Image prep compress failed",
    category: "Scan",
    description: "Diagnostic — JPEG compression failed (carries `attempt`).",
  },
  pc_scan_image_prep_fallback_raw: {
    label: "Image prep fell back to raw",
    category: "Scan",
    description:
      "Diagnostic — could not normalise image, sending raw bytes (Android API level recorded).",
  },
  pc_scan_image_prep_succeeded: {
    label: "Image prep succeeded",
    category: "Scan",
    description: "Diagnostic — image normalisation finished (carries `duration_ms`).",
  },
  pc_scan_analyze_request_started: {
    label: "Analyze request started",
    category: "Scan",
    description: "HTTP/SSE request to the AI backend was sent.",
  },
  pc_scan_analyze_first_sse: {
    label: "Analyze first SSE byte",
    category: "Scan",
    description:
      "First SSE chunk received from the AI backend (carries `ttfb_ms` — time to first byte).",
  },
  pc_scan_edit_action: {
    label: "Result edit action",
    category: "Scan",
    description: "User performed crop/rotate/download on a result image.",
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
  pc_scan_questions_abandoned: {
    label: "Lifestyle wizard abandoned",
    category: "Scan",
    description: "User exited the lifestyle wizard before finishing (carries `last_step`).",
  },
  pc_scan_analysis_started: {
    label: "Analysis started",
    category: "Scan",
    description: "Request to the AI backend began (SSE stream opened).",
  },
  pc_scan_analysis_completed: {
    label: "Analysis completed",
    category: "Scan",
    description:
      "AI analysis finished successfully. Core value-delivery event.",
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

  // ── Paywall ─────────────────────────────────────────────────────────────────
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
  pc_pw_dismissed: {
    label: "Paywall dismissed",
    category: "Paywall",
    description: "User closed the paywall without purchasing (carries `source`).",
  },

  // ── Chat ────────────────────────────────────────────────────────────────────
  pc_chat_opened: {
    label: "Chat opened",
    category: "Chat",
    description: "Chat modal opened (carries `source`).",
  },
  pc_chat_message_sent: {
    label: "Chat message sent",
    category: "Chat",
    description: "User sent a message to the AI assistant.",
  },
  pc_chat_history_viewed: {
    label: "Chat history viewed",
    category: "Chat",
    description: "User opened the chat history list.",
  },
  pc_chat_closed: {
    label: "Chat closed",
    category: "Chat",
    description: "User dismissed the chat modal.",
  },

  // ── Community ───────────────────────────────────────────────────────────────
  pc_comm_feed_viewed: {
    label: "Community feed viewed",
    category: "Community",
    description: "User opened the public community feed.",
  },
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
  pc_comm_post_unliked: {
    label: "Post unliked",
    category: "Community",
    description: "User removed a like from a post.",
  },
  pc_comm_comment_added: {
    label: "Comment added",
    category: "Community",
    description: "User posted a top-level comment on a post.",
  },
  pc_comm_reply_added: {
    label: "Reply added",
    category: "Community",
    description: "User replied to an existing comment.",
  },
  pc_comm_profile_viewed: {
    label: "Community profile viewed",
    category: "Community",
    description: "User opened another community member's profile.",
  },
  pc_comm_leaderboard_viewed: {
    label: "Leaderboard viewed",
    category: "Community",
    description: "User opened the community leaderboard.",
  },

  // ── Navigation ──────────────────────────────────────────────────────────────
  pc_nav_screen_view: {
    label: "Screen view",
    category: "Navigation",
    description:
      "Screen-level navigation event (carries `screen_name` and `screen_class`). Fires on every screen change.",
  },

  // ── Notifications ───────────────────────────────────────────────────────────
  pc_notif_permission_granted: {
    label: "Push permission granted",
    category: "Notifications",
    description: "User allowed push notifications.",
  },
  pc_notif_permission_denied: {
    label: "Push permission denied",
    category: "Notifications",
    description: "User declined the push notification prompt.",
  },
  pc_notif_opened: {
    label: "Notification opened",
    category: "Notifications",
    description:
      "User tapped a push notification (cold start or background).",
  },

  // ── Errors ──────────────────────────────────────────────────────────────────
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

  // ── System / Stability ──────────────────────────────────────────────────────
  pc_sys_app_launch: {
    label: "App launch",
    category: "System",
    description:
      "App launched (carries `cold_start` and `heap_max_mb`). Useful for stability/perf cohorting.",
  },
  pc_sys_memory_warning: {
    label: "Memory warning",
    category: "System",
    description:
      "OS issued a memory warning (carries `level: moderate|critical` and originating `screen`).",
  },
  pc_sys_oom_near: {
    label: "OOM near",
    category: "System",
    description:
      "Heap usage approached the OOM ceiling (carries `used_mb`, `max_mb`, `screen`).",
  },

  // ── Account / Settings ──────────────────────────────────────────────────────
  pc_acct_settings_opened: {
    label: "Settings opened",
    category: "Account",
    description: "User opened the in-app settings screen.",
  },
  pc_acct_lifestyle_updated: {
    label: "Lifestyle field updated",
    category: "Account",
    description:
      "User updated a lifestyle profile field (carries `field`). Drives personalised analysis.",
  },
  pc_acct_account_updated: {
    label: "Account field updated",
    category: "Account",
    description: "User updated an account profile field (carries `field`).",
  },
  pc_acct_widget_added: {
    label: "Home-screen widget added",
    category: "Account",
    description: "User installed the home-screen widget.",
  },
  pc_acct_delete_initiated: {
    label: "Account deletion initiated",
    category: "Account",
    description: "User opened the delete-account flow.",
  },
  pc_acct_delete_confirmed: {
    label: "Account deletion confirmed",
    category: "Account",
    description: "User confirmed account deletion.",
  },

  // ── Revenue / Subscription ──────────────────────────────────────────────────
  pc_rev_subscription_renewed: {
    label: "Subscription renewed",
    category: "Revenue",
    description:
      "RevenueCat reported a successful subscription renewal. Should be fired from the RC webhook.",
  },
  pc_rev_subscription_cancelled: {
    label: "Subscription cancelled",
    category: "Revenue",
    description:
      "RevenueCat reported a cancellation. Should be fired from the RC webhook.",
  },
  pc_rev_trial_started: {
    label: "Trial started",
    category: "Revenue",
    description:
      "User entered a free trial. Should be fired from the RC webhook.",
  },
  pc_rev_trial_converted: {
    label: "Trial converted",
    category: "Revenue",
    description:
      "Trial converted to a paid subscription. Should be fired from the RC webhook.",
  },
  pc_sub_cancel_reminder_shown: {
    label: "Cancel-reminder shown",
    category: "Revenue",
    description:
      "User saw the in-app reminder modal that nudges them not to cancel.",
  },
  pc_sub_cancel_reminder_cta_tapped: {
    label: "Cancel-reminder CTA tapped",
    category: "Revenue",
    description: "User tapped the keep-subscription CTA inside the reminder modal.",
  },
  pc_sub_cancel_reminder_dismissed: {
    label: "Cancel-reminder dismissed",
    category: "Revenue",
    description: "User dismissed the cancel-reminder modal without acting.",
  },

  // ── Sharing ─────────────────────────────────────────────────────────────────
  pc_share_result_shared: {
    label: "Result shared",
    category: "Sharing",
    description:
      "User shared a scan result through the system share sheet (carries `method`).",
  },
  pc_share_referral_sent: {
    label: "Referral sent",
    category: "Sharing",
    description: "User sent a referral invite.",
  },

  // ── Dashboard (Profile carousel cards) ──────────────────────────────────────
  pc_dash_card_viewed: {
    label: "Dashboard card viewed",
    category: "Dashboard",
    description:
      "User saw a card in the profile premium carousel (carries `card_type`: gut_score, action_to_consider, habit_improvement, digestive_report, gut_intelligence, lifetime_deal). Deduplicated per swipe.",
  },
  pc_dash_card_tapped: {
    label: "Dashboard card tapped",
    category: "Dashboard",
    description:
      "User tapped into a card in the profile premium carousel (carries `card_type`).",
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
  "Dashboard",
  "Navigation",
  "Notifications",
  "Account",
  "Revenue",
  "Sharing",
  "System",
  "Errors",
];
