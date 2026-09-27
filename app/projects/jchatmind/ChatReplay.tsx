"use client";

import { Fragment, useRef, useState } from "react";
import data from "./replay-data.json";
import "./chat-replay.css";

const labels = ["Recommend", "Follow up", "Use a tool", "Check limits", "Draft a reply"];
type Message = { role: string; content: string; calls?: { name: string; arguments: string }[]; tool?: { name: string; response: string } };

function Icon({ kind }: { kind: "robot" | "chat" | "tool" | "arrow" }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    {kind === "robot" ? <><path d="M5 3h14v15H5zM3 22h18M8 14h8" /><circle cx="9" cy="8" r=".8" /><circle cx="15" cy="8" r=".8" /></> : kind === "chat" ? <><path d="M21 11a9 9 0 0 1-9 9H4l-2 2V11a9.5 9.5 0 0 1 19 0Z" /><path d="M7 11h1m3 0h1m3 0h1" /></> : kind === "tool" ? <path d="m14 6 4-4a6 6 0 0 1-7 8L4 18l2 2 8-7a6 6 0 0 0 8-7l-4 4Z" /> : <path d="M12 20V4m-7 7 7-7 7 7" />}
  </svg>;
}

// Render the formatting used by this recorded transcript as React text nodes.
// No raw HTML, links, or model-generated markup is executed.
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, i) => part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part.startsWith("*") ? <em key={i}>{part.slice(1, -1)}</em> : part.startsWith("`") ? <code key={i}>{part.slice(1, -1)}</code> : <Fragment key={i}>{part}</Fragment>);
}

function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const key = i;
    if (/^---+$/.test(line.trim())) { blocks.push(<hr key={key} />); i++; continue; }
    if (/^#{1,6} /.test(line)) {
      blocks.push(<p className="replay-message-heading" key={key}>{inline(line.replace(/^#{1,6} /, ""))}</p>);
      i++; continue;
    }
    if (/^[-*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(<li key={i}>{inline(lines[i].replace(/^[-*] /, ""))}</li>); i++;
      }
      blocks.push(<ul key={key}>{items}</ul>); continue;
    }
    const paragraph = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6} |[-*] |---+$)/.test(lines[i])) {
      paragraph.push(lines[i].replace(/^> /, "")); i++;
    }
    blocks.push(<p key={key}>{inline(paragraph.join("\n"))}</p>);
  }
  return <div className="replay-markdown">{blocks}</div>;
}

function ToolResult({ tool }: { tool: NonNullable<Message["tool"]> }) {
  let formatted = tool.response;
  try { formatted = JSON.stringify(JSON.parse(tool.response), null, 2); } catch { /* Plain text is also a valid tool result. */ }
  return <details className="replay-tool-result"><summary><span className="replay-check">✓</span><span className="replay-tool-name">{tool.name}</span><span className="replay-dot">·</span><span className="replay-tool-preview">{tool.response.slice(0, 100)}{tool.response.length > 100 ? "..." : ""}</span></summary><pre>{formatted}</pre></details>;
}

function Messages({ messages }: { messages: Message[] }) {
  return <>{messages.map((message, index) => message.tool ? <ToolResult key={index} tool={message.tool} /> : <div key={index} className={`replay-message replay-${message.role}`}>
    {!!message.calls?.length && <div className="replay-calls">{message.calls.map((call, n) => {
      let args = call.arguments;
      try { args = Object.keys(JSON.parse(args)).slice(0, 2).join(", ") || "{}"; } catch { /* Display the recorded text. */ }
      return <span key={n}><Icon kind="tool" /><code>{call.name}</code><span>· {args}</span></span>;
    })}</div>}
    {message.content && (message.role === "user" ? message.content : <Markdown text={message.content} />)}
  </div>)}</>;
}

function ReplayContent({ stageIndex, selectStage, complete = false }: { stageIndex: number; selectStage?: (index: number) => void; complete?: boolean }) {
  const [tab, setTab] = useState("chat");
  const [showMessages, setShowMessages] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);
  const messages: Message[] = complete ? [...data.stages.flat(), ...data.correction] : data.stages[stageIndex];

  function reset() { setTab("chat"); setShowMenu(false); setShowMessages(false); scroll.current?.scrollTo(0, 0); }
  return <div className={`replay-app ${showMenu ? "replay-menu-open" : ""}`}>
    <button className="replay-mobile-menu" type="button" aria-expanded={showMenu} onClick={() => setShowMenu(!showMenu)}>☰ JChatMind</button>
    <aside className="replay-sidebar" aria-label="JChatMind demo sidebar">
      <div className="replay-brand"><Icon kind="robot" />JChatMind</div>
      <nav className="replay-tabs" aria-label="JChatMind views">{[["agent", "智能体助手"], ["chat", "聊天记录"], ["knowledge", "知识库"]].map(([key, label]) => <button type="button" key={key} aria-pressed={tab === key} onClick={() => { setTab(key); setShowMenu(false); }}>{label}</button>)}</nav>
      <button className="replay-new" type="button" onClick={reset} title="Replay the recorded question">＋ 新聊天</button>
      <div className="replay-session-list">{tab === "chat" ? (complete ? ["Full conversation"] : labels).map((label, index) => <button key={label} type="button" aria-current={index === stageIndex ? "step" : undefined} onClick={() => { selectStage?.(index); setShowMessages(true); setShowMenu(false); scroll.current?.scrollTo(0, 0); }}><span className="replay-chat-icon"><Icon kind="chat" /></span><span>OrbitDesk — {label}</span></button>) : <button type="button" onClick={() => { setShowMenu(false); scroll.current?.scrollTo(0, 0); }}><span className="replay-chat-icon"><Icon kind={tab === "agent" ? "robot" : "chat"} /></span><span>{tab === "agent" ? "OrbitDesk Support Copilot" : "OrbitDesk Product Handbook"}</span></button>}</div>
      <span className="replay-sidebar-note">Recorded demo · 2026-09-27</span>
    </aside>
    <div className="replay-main">
      {/* Keyboard users need to focus this independently scrolling transcript. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div ref={scroll} className="replay-scroll" tabIndex={0} role="region" aria-label={tab === "chat" ? "Recorded conversation" : tab === "agent" ? "Recorded agent configuration" : "OrbitDesk knowledge base"}>
        {tab === "chat" ? showMessages ? <><Messages messages={messages} />{stageIndex === 1 && !complete && <details className="replay-correction"><summary>Later follow-up: clarified price calculation</summary><Messages messages={data.correction} /></details>}</> : <div className="replay-empty"><Icon kind="robot" /><h3>OrbitDesk Support Copilot</h3><p>Replay this step’s recorded question and response.</p><p>No live AI request is sent.</p></div> : tab === "agent" ? <div className="replay-config"><h3>OrbitDesk Support Copilot</h3><dl><dt>模型</dt><dd>deepseek-chat</dd><dt>知识库</dt><dd>OrbitDesk Product Handbook</dd><dt>消息窗口长度</dt><dd>60</dd></dl><h4>提示词</h4><pre>{data.agentPrompt}</pre></div> : <div className="replay-config"><h3>OrbitDesk Product Handbook</h3><details open><summary>orbitdesk-handbook.md</summary><Markdown text={data.handbook} /></details></div>}
      </div>
      <form className="replay-composer" onSubmit={event => { event.preventDefault(); setShowMessages(true); scroll.current?.scrollTo(0, 0); }}>
        <div><textarea aria-label="Recorded question" readOnly value={!showMessages && tab === "chat" ? messages[0].content : ""} placeholder="输入消息..." rows={1} /><button type="submit" aria-label="Replay recorded response" disabled={showMessages || tab !== "chat"} title="Replay recorded response"><Icon kind="arrow" /></button></div>
      </form>
    </div>
  </div>;
}

export default function ChatReplay({ stageIndex = 0, selectStage, complete = false }: { stageIndex?: number; selectStage?: (index: number) => void; complete?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <div className="chat-replay">
    <div className="replay-toolbar"><span><i />Interactive replay · recorded conversation</span><button type="button" onClick={() => dialog.current?.showModal()}>Expand ↗</button></div>
    <ReplayContent key={stageIndex} stageIndex={stageIndex} selectStage={selectStage} complete={complete} />
    <dialog ref={dialog} className="replay-dialog" aria-label="Expanded JChatMind replay">
      <div className="replay-toolbar"><span>JChatMind · recorded conversation</span><button type="button" onClick={() => dialog.current?.close()}>Close ✕</button></div>
      <ReplayContent key={stageIndex} stageIndex={stageIndex} selectStage={selectStage} complete={complete} />
    </dialog>
  </div>;
}
