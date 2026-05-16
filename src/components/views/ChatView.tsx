import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Container,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Send as SendIcon, Build as ToolIcon } from "@mui/icons-material";
import { streamChat, ChatMessage } from "../../services/api.chat";

interface ToolEvent {
  id: string;
  name: string;
  serverName: string;
}

interface ChatTurn {
  role: "user" | "assistant";
  text: string;
  toolUses: ToolEvent[];
  error?: string;
  usage?: { input: number; output: number; cached: number };
}

const SUGGESTIONS = [
  "How many people had premium and unsubscribed in the last 30 days?",
  "Of those, how many are still using the app?",
  "Trial-to-paid conversion this month vs last month?",
];

const ChatView: React.FC = () => {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns]);

  const send = async (text: string) => {
    const userTurn: ChatTurn = { role: "user", text, toolUses: [] };
    const assistantTurn: ChatTurn = { role: "assistant", text: "", toolUses: [] };

    // Snapshot history BEFORE adding new turns, then build the API payload from it.
    const history: ChatMessage[] = turns.map((t) => ({
      role: t.role,
      content: t.text,
    }));
    history.push({ role: "user", content: text });

    setTurns((prev) => [...prev, userTurn, assistantTurn]);
    setInput("");
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      for await (const event of streamChat(history, controller.signal)) {
        if (event.type === "text_delta") {
          setTurns((prev) => {
            const next = [...prev];
            const last = next[next.length - 1]!;
            next[next.length - 1] = { ...last, text: last.text + event.text };
            return next;
          });
        } else if (event.type === "tool_use_start") {
          setTurns((prev) => {
            const next = [...prev];
            const last = next[next.length - 1]!;
            next[next.length - 1] = {
              ...last,
              toolUses: [
                ...last.toolUses,
                {
                  id: `${Date.now()}-${Math.random()}`,
                  name: event.name,
                  serverName: event.serverName,
                },
              ],
            };
            return next;
          });
        } else if (event.type === "done") {
          setTurns((prev) => {
            const next = [...prev];
            const last = next[next.length - 1]!;
            next[next.length - 1] = { ...last, usage: event.usage };
            return next;
          });
        } else if (event.type === "error") {
          setTurns((prev) => {
            const next = [...prev];
            const last = next[next.length - 1]!;
            next[next.length - 1] = { ...last, error: event.message };
            return next;
          });
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const message = err instanceof Error ? err.message : "Request failed";
      setTurns((prev) => {
        const next = [...prev];
        const last = next[next.length - 1]!;
        next[next.length - 1] = { ...last, error: message };
        return next;
      });
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    void send(text);
  };

  return (
    <Container maxWidth="md" sx={{ py: 3, height: "100%" }}>
      <Stack spacing={2} sx={{ height: "100%" }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Analyst
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ask anything about PoopCheck data — RevenueCat, app events, briefs,
            feedback.
          </Typography>
        </Box>

        <Paper
          ref={scrollRef}
          variant="outlined"
          sx={{
            flexGrow: 1,
            minHeight: 400,
            maxHeight: "calc(100vh - 260px)",
            overflowY: "auto",
            p: 2,
            backgroundColor: "rgba(255,255,255,0.02)",
          }}
        >
          {turns.length === 0 && (
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">
                Try one of these:
              </Typography>
              {SUGGESTIONS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  onClick={() => void send(s)}
                  sx={{ alignSelf: "flex-start", maxWidth: "100%" }}
                />
              ))}
            </Stack>
          )}

          <Stack spacing={2}>
            {turns.map((turn, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  justifyContent:
                    turn.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <Box
                  sx={{
                    maxWidth: "85%",
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    backgroundColor:
                      turn.role === "user"
                        ? "rgba(155, 240, 255, 0.12)"
                        : "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {turn.toolUses.length > 0 && (
                    <Stack spacing={0.5} sx={{ mb: turn.text ? 1 : 0 }}>
                      {turn.toolUses.map((t) => (
                        <Stack
                          key={t.id}
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                          sx={{ fontSize: 12, color: "text.secondary" }}
                        >
                          <ToolIcon sx={{ fontSize: 14 }} />
                          <span>
                            called <code>{t.name}</code>
                          </span>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{ whiteSpace: "pre-wrap" }}
                  >
                    {turn.text || (turn.role === "assistant" && busy && i === turns.length - 1 ? "…" : "")}
                  </Typography>
                  {turn.error && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                      {turn.error}
                    </Typography>
                  )}
                  {turn.usage && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      {turn.usage.input}+{turn.usage.cached}c → {turn.usage.output} tokens
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Stack>
        </Paper>

        <Paper
          component="form"
          onSubmit={onSubmit}
          variant="outlined"
          sx={{
            p: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                onSubmit(e);
              }
            }}
            placeholder="Ask about the data…"
            variant="standard"
            InputProps={{ disableUnderline: true, sx: { px: 1 } }}
            disabled={busy}
          />
          <IconButton type="submit" color="primary" disabled={busy || !input.trim()}>
            {busy ? <CircularProgress size={20} /> : <SendIcon />}
          </IconButton>
        </Paper>
      </Stack>
    </Container>
  );
};

export default ChatView;
