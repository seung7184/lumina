"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Bot,
  ClipboardCopy,
  FileText,
  Globe,
  Languages,
  Loader2,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Send,
  Shield,
  Sparkles,
  Trash2,
  Video,
} from "lucide-react";
import type { LanguageCode } from "@/lib/types/workspace";
import type {
  ChatMessage,
  GeneratedBrief,
  IngestedSource,
  TemplateId,
  WorkspaceState,
} from "@/lib/store/workspace-store";
import {
  decisionLensOptions,
  loadWorkspaceState,
  saveWorkspaceState,
  templateLabels,
} from "@/lib/store/workspace-store";

let _idCounter = 0;
function makeId(prefix: string): string {
  _idCounter += 1;
  return `${prefix}-${_idCounter}`;
}

function timestamp(): string {
  return new Date().toISOString();
}

export function FunctionalWorkspace() {
  return <LoadedWorkspace initial={loadWorkspaceState()} />;
}

function LoadedWorkspace({ initial }: { initial: WorkspaceState }) {
  const [state, setState] = useState<WorkspaceState>(initial);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contextTab, setContextTab] = useState<"source" | "chat">("source");
  const [ingesting, setIngesting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [sourceInputUrl, setSourceInputUrl] = useState("");
  const [sourceInputText, setSourceInputText] = useState("");
  const [sourceInputKind, setSourceInputKind] = useState<"youtube" | "webpage" | "text">("youtube");
  const [chatDraft, setChatDraft] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const persist = useCallback((next: WorkspaceState) => {
    setState(next);
    saveWorkspaceState(next);
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const t = window.setTimeout(() => setFeedback(""), 4000);
    return () => window.clearTimeout(t);
  }, [feedback]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.chatMessages.length]);

  const activeSource = state.sources.find((s) => s.sourceId === state.activeSourceId) ?? null;
  const activeBrief = state.briefs.find((b) => b.id === state.activeBriefId) ?? null;
  const sourceBriefs = state.briefs.filter((b) => b.sourceId === state.activeSourceId);

  async function handleIngest() {
    if (ingesting) return;

    const payload: Record<string, string> = { kind: sourceInputKind };
    if (sourceInputKind === "text") {
      if (!sourceInputText.trim()) { setFeedback("Paste some text content first."); return; }
      payload.text = sourceInputText;
    } else {
      if (!sourceInputUrl.trim()) { setFeedback("Enter a URL first."); return; }
      payload.url = sourceInputUrl;
    }

    setIngesting(true);
    setFeedback("Extracting source content...");

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback(data.error || "Ingestion failed.");
        return;
      }

      const newSource: IngestedSource = {
        ...data,
        ingestedAt: timestamp(),
      };

      const exists = state.sources.some((s) => s.sourceId === newSource.sourceId);
      const nextSources = exists
        ? state.sources.map((s) => (s.sourceId === newSource.sourceId ? newSource : s))
        : [...state.sources, newSource];

      persist({
        ...state,
        sources: nextSources,
        activeSourceId: newSource.sourceId,
        activeBriefId: null,
        chatMessages: [],
      });

      setSourceInputUrl("");
      setSourceInputText("");
      setFeedback(`Source loaded: ${newSource.segments.length} segments extracted.`);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Network error during ingestion.");
    } finally {
      setIngesting(false);
    }
  }

  async function handleGenerate(template?: TemplateId) {
    if (!activeSource || generating) return;

    const tpl = template ?? state.activeTemplate;
    setGenerating(true);
    setFeedback(`Generating ${templateLabels[tpl][state.language]}...`);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segments: activeSource.segments.map((s) => ({
            index: s.index,
            text: s.text,
            startSeconds: s.startSeconds,
          })),
          sourceTitle: activeSource.title,
          sourceUrl: activeSource.url,
          sourceKind: activeSource.kind,
          template: tpl,
          language: state.language,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback(data.error || "Generation failed.");
        return;
      }

      const brief: GeneratedBrief = {
        id: makeId("brief"),
        sourceId: activeSource.sourceId,
        content: data.content,
        template: tpl,
        language: state.language,
        generatedAt: timestamp(),
      };

      persist({
        ...state,
        briefs: [...state.briefs, brief],
        activeBriefId: brief.id,
        activeTemplate: tpl,
      });

      setFeedback(`${templateLabels[tpl][state.language]} generated.`);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Network error during generation.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleChatSend() {
    if (!activeSource || !chatDraft.trim() || chatSending) return;

    const userMsg: ChatMessage = {
      id: makeId("msg-user"),
      role: "user",
      content: chatDraft.trim(),
      timestamp: timestamp(),
    };

    const nextMessages = [...state.chatMessages, userMsg];
    persist({ ...state, chatMessages: nextMessages });
    setChatDraft("");
    setChatSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: state.chatMessages.map((m) => ({ role: m.role, content: m.content })),
          segments: activeSource.segments.map((s) => ({
            index: s.index,
            text: s.text,
            startSeconds: s.startSeconds,
          })),
          sourceTitle: activeSource.title,
          sourceUrl: activeSource.url,
          language: state.language,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg: ChatMessage = {
          id: makeId("msg-err"),
          role: "assistant",
          content: data.error || "Sorry, I could not process that. Please try again.",
          timestamp: timestamp(),
        };
        persist({ ...state, chatMessages: [...nextMessages, errorMsg] });
        return;
      }

      const assistantMsg: ChatMessage = {
        id: makeId("msg-resp"),
        role: "assistant",
        content: data.response,
        timestamp: timestamp(),
      };

      persist({ ...state, chatMessages: [...nextMessages, assistantMsg] });
    } catch {
      const errorMsg: ChatMessage = {
        id: makeId("msg-err"),
        role: "assistant",
        content: "Network error. Please check your connection and try again.",
        timestamp: timestamp(),
      };
      persist({ ...state, chatMessages: [...nextMessages, errorMsg] });
    } finally {
      setChatSending(false);
    }
  }

  function handleDeleteSource(sourceId: string) {
    const nextSources = state.sources.filter((s) => s.sourceId !== sourceId);
    const nextBriefs = state.briefs.filter((b) => b.sourceId !== sourceId);
    persist({
      ...state,
      sources: nextSources,
      briefs: nextBriefs,
      activeSourceId: state.activeSourceId === sourceId ? (nextSources[0]?.sourceId ?? null) : state.activeSourceId,
      activeBriefId: state.activeBriefId && nextBriefs.some((b) => b.id === state.activeBriefId) ? state.activeBriefId : null,
      chatMessages: state.activeSourceId === sourceId ? [] : state.chatMessages,
    });
    setFeedback("Source deleted.");
  }

  function handleCopyBrief() {
    if (!activeBrief) return;
    navigator.clipboard.writeText(activeBrief.content).then(
      () => setFeedback("Brief copied to clipboard."),
      () => setFeedback("Could not copy to clipboard."),
    );
  }

  const sourceKindIcon = (kind: string) => {
    switch (kind) {
      case "youtube": return <Video size={14} />;
      case "webpage": return <Globe size={14} />;
      default: return <FileText size={14} />;
    }
  };

  return (
    <div className={`functional-workspace ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
      {/* ===== LEFT SIDEBAR ===== */}
      <aside className="fw-sidebar" data-collapsed={!sidebarOpen}>
        <div className="fw-sidebar__header">
          <Link href="/" className="fw-sidebar__brand">
            <span className="brand-mark">L</span>
            {sidebarOpen && <strong>Lumina</strong>}
          </Link>
          <button type="button" onClick={() => setSidebarOpen((o) => !o)} aria-label="Toggle sidebar">
            {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
        </div>

        {sidebarOpen && (
          <>
            {/* Source Input */}
            <div className="fw-sidebar__input-section">
              <div className="fw-source-kind-tabs">
                {(["youtube", "webpage", "text"] as const).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    className={sourceInputKind === kind ? "is-active" : ""}
                    onClick={() => setSourceInputKind(kind)}
                  >
                    {kind === "youtube" && <Video size={12} />}
                    {kind === "webpage" && <Globe size={12} />}
                    {kind === "text" && <FileText size={12} />}
                    {kind === "youtube" ? "YouTube" : kind === "webpage" ? "Web" : "Text"}
                  </button>
                ))}
              </div>
              {sourceInputKind !== "text" ? (
                <div className="fw-source-url-input">
                  <input
                    type="url"
                    placeholder={sourceInputKind === "youtube" ? "Paste YouTube URL..." : "Paste webpage URL..."}
                    value={sourceInputUrl}
                    onChange={(e) => setSourceInputUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleIngest(); }}
                  />
                  <button type="button" onClick={handleIngest} disabled={ingesting}>
                    {ingesting ? <Loader2 size={14} className="spin" /> : <Plus size={14} />}
                  </button>
                </div>
              ) : (
                <div className="fw-source-text-input">
                  <textarea
                    placeholder="Paste text content..."
                    value={sourceInputText}
                    onChange={(e) => setSourceInputText(e.target.value)}
                    rows={4}
                  />
                  <button type="button" onClick={handleIngest} disabled={ingesting}>
                    {ingesting ? <Loader2 size={14} className="spin" /> : "Add source"}
                  </button>
                </div>
              )}
            </div>

            {/* Source List */}
            <div className="fw-sidebar__sources">
              <span className="fw-sidebar__section-label">Sources ({state.sources.length})</span>
              {state.sources.length === 0 && (
                <p className="fw-sidebar__empty">Add a YouTube URL, webpage, or paste text to get started.</p>
              )}
              {state.sources.map((source) => (
                <div
                  key={source.sourceId}
                  className={`fw-source-item ${state.activeSourceId === source.sourceId ? "is-active" : ""}`}
                  onClick={() => persist({ ...state, activeSourceId: source.sourceId, activeBriefId: null, chatMessages: [] })}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") persist({ ...state, activeSourceId: source.sourceId, activeBriefId: null, chatMessages: [] }); }}
                >
                  <span className="fw-source-item__icon">{sourceKindIcon(source.kind)}</span>
                  <div className="fw-source-item__info">
                    <span className="fw-source-item__title">{source.title}</span>
                    <small>{source.segments.length} segments</small>
                  </div>
                  <button
                    type="button"
                    className="fw-source-item__delete"
                    onClick={(e) => { e.stopPropagation(); handleDeleteSource(source.sourceId); }}
                    aria-label="Delete source"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Language Toggle */}
            <div className="fw-sidebar__footer">
              <button
                type="button"
                className="fw-lang-toggle"
                onClick={() => {
                  const next: LanguageCode = state.language === "en" ? "ko" : "en";
                  persist({ ...state, language: next });
                }}
              >
                <Languages size={14} />
                {state.language === "en" ? "English" : "한국어"}
              </button>
            </div>
          </>
        )}
      </aside>

      {/* ===== CENTER PANE ===== */}
      <main className="fw-main">
        {!activeSource ? (
          <EmptyState />
        ) : (
          <>
            {/* Toolbar */}
            <div className="fw-toolbar">
              <div className="fw-toolbar__source-info">
                {sourceKindIcon(activeSource.kind)}
                <span>{activeSource.title}</span>
              </div>
              <div className="fw-toolbar__actions">
                {activeBrief && (
                  <button type="button" className="fw-toolbar__copy" onClick={handleCopyBrief}>
                    <ClipboardCopy size={14} />
                    Copy
                  </button>
                )}
              </div>
            </div>

            {/* Decision Lens */}
            <div className="fw-decision-lens">
              <span className="fw-decision-lens__label">
                <Sparkles size={14} />
                Decision Lens — what do you want to do with this source?
              </span>
              <div className="fw-decision-lens__options">
                {decisionLensOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`fw-lens-chip ${state.activeTemplate === opt.template ? "is-active" : ""}`}
                    onClick={() => {
                      persist({ ...state, activeTemplate: opt.template });
                      handleGenerate(opt.template);
                    }}
                    disabled={generating}
                  >
                    {opt.label[state.language]}
                  </button>
                ))}
              </div>
            </div>

            {/* Brief Content */}
            <div className="fw-brief-area">
              {generating ? (
                <div className="fw-brief-area__loading">
                  <Loader2 size={20} className="spin" />
                  <span>Generating {templateLabels[state.activeTemplate][state.language]}...</span>
                </div>
              ) : activeBrief ? (
                <div className="fw-brief-content">
                  <div className="fw-brief-content__header">
                    <h2>{templateLabels[activeBrief.template][state.language]}</h2>
                    <small>
                      {activeBrief.language === "en" ? "English" : activeBrief.language === "ko" ? "한국어" : "Bilingual"}
                      {" · "}
                      {new Date(activeBrief.generatedAt).toLocaleString()}
                    </small>
                  </div>
                  <div className="fw-brief-content__body">
                    <BriefRenderer content={activeBrief.content} />
                  </div>
                  {sourceBriefs.length > 1 && (
                    <div className="fw-brief-history">
                      <span className="fw-brief-history__label">Previous briefs</span>
                      {sourceBriefs.filter((b) => b.id !== activeBrief.id).map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          className="fw-brief-history__item"
                          onClick={() => persist({ ...state, activeBriefId: b.id, activeTemplate: b.template })}
                        >
                          {templateLabels[b.template][state.language]} · {new Date(b.generatedAt).toLocaleTimeString()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="fw-brief-area__empty">
                  <BookOpen size={32} />
                  <h3>Source loaded — choose your lens</h3>
                  <p>Select a Decision Lens above to generate a source-grounded brief.</p>
                  <p className="fw-brief-area__segment-count">{activeSource.segments.length} segments ready for analysis</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ===== RIGHT CONTEXT PANEL ===== */}
      {activeSource && (
        <aside className="fw-context">
          <div className="fw-context__tabs">
            <button
              type="button"
              className={contextTab === "source" ? "is-active" : ""}
              onClick={() => setContextTab("source")}
            >
              <FileText size={13} />
              Source
            </button>
            <button
              type="button"
              className={contextTab === "chat" ? "is-active" : ""}
              onClick={() => setContextTab("chat")}
            >
              <MessageSquare size={13} />
              Ask
            </button>
          </div>

          {contextTab === "source" ? (
            <div className="fw-context__source">
              <div className="fw-source-meta">
                <dl>
                  <div><dt>Type</dt><dd>{activeSource.kind}</dd></div>
                  <div><dt>Segments</dt><dd>{activeSource.segments.length}</dd></div>
                  {activeSource.url && <div><dt>URL</dt><dd className="fw-source-meta__url"><a href={activeSource.url} target="_blank" rel="noopener noreferrer">{activeSource.url.slice(0, 50)}...</a></dd></div>}
                  {activeSource.totalDurationSeconds && <div><dt>Duration</dt><dd>{formatDuration(activeSource.totalDurationSeconds)}</dd></div>}
                </dl>
              </div>
              <div className="fw-source-segments">
                <strong>Source Segments</strong>
                <div className="fw-segment-list">
                  {activeSource.segments.slice(0, 50).map((seg) => (
                    <div key={seg.index} className="fw-segment-item">
                      <span className="fw-segment-item__index">[{seg.index}]</span>
                      {seg.startSeconds > 0 && (
                        <span className="fw-segment-item__time">{formatTime(seg.startSeconds)}</span>
                      )}
                      <p className="fw-segment-item__text">{seg.text}</p>
                    </div>
                  ))}
                  {activeSource.segments.length > 50 && (
                    <p className="fw-segment-list__more">+ {activeSource.segments.length - 50} more segments</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="fw-context__chat">
              <div className="fw-chat-messages">
                {state.chatMessages.length === 0 && (
                  <div className="fw-chat-empty">
                    <Bot size={24} />
                    <p>Ask anything about this source. Every answer is grounded in the source content.</p>
                    <div className="fw-chat-suggestions">
                      {["What are the key claims?", "Summarize the main argument", "What evidence supports this?", "What is not covered?"].map((q) => (
                        <button key={q} type="button" onClick={() => { setChatDraft(q); }}>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {state.chatMessages.map((msg) => (
                  <div key={msg.id} className={`fw-chat-msg fw-chat-msg--${msg.role}`}>
                    <div className="fw-chat-msg__avatar">
                      {msg.role === "assistant" ? <Bot size={14} /> : <span>You</span>}
                    </div>
                    <div className="fw-chat-msg__content">
                      <BriefRenderer content={msg.content} />
                    </div>
                  </div>
                ))}
                {chatSending && (
                  <div className="fw-chat-msg fw-chat-msg--assistant">
                    <div className="fw-chat-msg__avatar"><Bot size={14} /></div>
                    <div className="fw-chat-msg__content"><Loader2 size={14} className="spin" /> Thinking...</div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="fw-chat-composer">
                <input
                  type="text"
                  placeholder="Ask about this source..."
                  value={chatDraft}
                  onChange={(e) => setChatDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }}
                  disabled={chatSending}
                />
                <button type="button" onClick={handleChatSend} disabled={chatSending || !chatDraft.trim()}>
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="fw-context__footer">
            <Shield size={12} />
            <small>Source-grounded answers only. Your data is private.</small>
          </div>
        </aside>
      )}

      {/* Feedback Toast */}
      {feedback && (
        <div className="fw-feedback" role="status" aria-live="polite">
          {feedback}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="fw-empty-state">
      <div className="fw-empty-state__content">
        <div className="fw-empty-state__icon">
          <Sparkles size={40} />
        </div>
        <h2>Welcome to Lumina</h2>
        <p>Turn sources into decisions — in English and Korean.</p>
        <div className="fw-empty-state__steps">
          <div className="fw-empty-state__step">
            <span className="fw-empty-state__step-num">1</span>
            <div>
              <strong>Add a source</strong>
              <p>Paste a YouTube URL, webpage link, or text content in the sidebar.</p>
            </div>
          </div>
          <div className="fw-empty-state__step">
            <span className="fw-empty-state__step-num">2</span>
            <div>
              <strong>Choose your lens</strong>
              <p>Select how you want to use the content: study, work, decide, act, or write.</p>
            </div>
          </div>
          <div className="fw-empty-state__step">
            <span className="fw-empty-state__step-num">3</span>
            <div>
              <strong>Get source-grounded output</strong>
              <p>Every claim traced to the source. Ask follow-up questions in the chat.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BriefRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    key++;
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<br key={key} />);
      continue;
    }
    if (trimmed.startsWith("# ")) {
      elements.push(<h2 key={key} className="fw-md-h2">{trimmed.slice(2)}</h2>);
    } else if (trimmed.startsWith("## ")) {
      elements.push(<h3 key={key} className="fw-md-h3">{trimmed.slice(3)}</h3>);
    } else if (trimmed.startsWith("### ")) {
      elements.push(<h4 key={key} className="fw-md-h4">{trimmed.slice(4)}</h4>);
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      elements.push(<li key={key} className="fw-md-li">{renderInline(trimmed.slice(2))}</li>);
    } else if (/^\d+\.\s/.test(trimmed)) {
      elements.push(<li key={key} className="fw-md-li fw-md-li--ordered">{renderInline(trimmed.replace(/^\d+\.\s/, ""))}</li>);
    } else if (trimmed.startsWith("---")) {
      elements.push(<hr key={key} className="fw-md-hr" />);
    } else if (trimmed.startsWith("> ")) {
      elements.push(<blockquote key={key} className="fw-md-blockquote">{renderInline(trimmed.slice(2))}</blockquote>);
    } else {
      elements.push(<p key={key} className="fw-md-p">{renderInline(trimmed)}</p>);
    }
  }

  return <div className="fw-markdown">{elements}</div>;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[0-9,\s]+\])/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (/^\[\d/.test(part)) {
      return <span key={i} className="fw-citation-ref">{part}</span>;
    }
    return part;
  });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
