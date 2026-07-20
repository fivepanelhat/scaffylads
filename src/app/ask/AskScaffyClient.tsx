"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { exampleAsks } from "@/lib/product-story";

type SpeechRec = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((ev: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognition(): (new () => SpeechRec) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function AskScaffyClient() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [mode, setMode] = useState<"live" | "offline" | null>(null);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRec | null>(null);

  useEffect(() => {
    return () => {
      try {
        recRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const ask = useCallback(async (q: string) => {
    const text = q.trim();
    if (!text) return;
    setBusy(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ask failed");
      setAnswer(data.text);
      setMode(data.mode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ask failed");
    } finally {
      setBusy(false);
    }
  }, []);

  function toggleVoice() {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      setError("Voice input needs Chrome/Edge speech recognition in this browser.");
      return;
    }
    if (listening && recRef.current) {
      recRef.current.stop();
      setListening(false);
      return;
    }
    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-NZ";
    rec.onresult = (ev) => {
      const t = ev.results[0]?.[0]?.transcript || "";
      setQuestion((prev) => (prev ? `${prev} ${t}` : t).trim());
    };
    rec.onerror = () => {
      setListening(false);
      setError("Voice recognition error — try again or type.");
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setError(null);
    setListening(true);
    rec.start();
  }

  return (
    <div className="space-y-4">
      <form
        className="card card-pad space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(question);
        }}
      >
        <div className="field">
          <label htmlFor="ask-q">Ask in plain English</label>
          <textarea
            id="ask-q"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder='e.g. “Any open inspections?” or “Who is on the Harbour View crew?”'
            rows={3}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary" type="submit" disabled={busy || !question.trim()}>
            {busy ? "Thinking…" : "Ask Scaffy"}
          </button>
          <button
            type="button"
            className={`btn ${listening ? "btn-ai" : ""}`}
            onClick={toggleVoice}
          >
            {listening ? "Stop voice" : "Voice input"}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setQuestion("");
              setAnswer(null);
              setMode(null);
              setError(null);
            }}
          >
            Clear
          </button>
        </div>
        <p className="text-xs text-[var(--muted)]">
          Offline by default — answers from your local journal. If{" "}
          <code>XAI_API_KEY</code> is set, the question and a journal snapshot
          are sent to <code>api.x.ai</code> (labelled live). Nothing is sent on
          save elsewhere.
        </p>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      </form>

      <div className="flex flex-wrap gap-2">
        {exampleAsks.map((ex) => (
          <button
            key={ex}
            type="button"
            className="chip-btn"
            onClick={() => {
              setQuestion(ex);
              void ask(ex);
            }}
          >
            {ex}
          </button>
        ))}
      </div>

      {answer && (
        <div className="card card-pad answer-panel">
          <div className="card-head">
            <h2 className="card-title">Answer</h2>
            <span className={`badge ${mode === "live" ? "active" : ""}`}>
              {mode === "live" ? "live · api.x.ai" : "offline · stayed local"}
            </span>
          </div>
          <pre className="answer-body">{answer}</pre>
        </div>
      )}
    </div>
  );
}
