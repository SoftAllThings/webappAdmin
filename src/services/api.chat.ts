import { API_BASE_URL, getAuthToken } from "./api.config";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export type AgentEvent =
  | { type: "text_delta"; text: string }
  | { type: "tool_use_start"; name: string; serverName: string }
  | { type: "tool_use_end"; name: string }
  | { type: "done"; usage: { input: number; output: number; cached: number } }
  | { type: "error"; message: string };

export async function* streamChat(
  messages: ChatMessage[],
  signal?: AbortSignal,
): AsyncGenerator<AgentEvent, void, void> {
  const token = getAuthToken();
  // signal intentionally NOT passed — temporarily ruling out abort issues.
  void signal;
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok || !response.body) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Chat request failed: ${response.status} ${body.slice(0, 200)}`,
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE messages are separated by a blank line
      let sepIdx = buffer.indexOf("\n\n");
      while (sepIdx !== -1) {
        const rawEvent = buffer.slice(0, sepIdx);
        buffer = buffer.slice(sepIdx + 2);

        for (const line of rawEvent.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trimStart();
          if (!payload) continue;
          try {
            yield JSON.parse(payload) as AgentEvent;
          } catch (err) {
            console.warn("Failed to parse SSE payload:", payload, err);
          }
        }

        sepIdx = buffer.indexOf("\n\n");
      }
    }
  } finally {
    reader.releaseLock();
  }
}
