"use client";

import { useState } from "react";

import type { ContactCardData } from "@/lib/portfolio/contact-profile";

export default function ContactCard({ contact, message }: { contact: ContactCardData; message: string }) {
  const [copyFeedback, setCopyFeedback] = useState<{ label: string; status: "copied" | "error" } | null>(null);

  async function copyContact(label: string, value: string) {
    setCopyFeedback(null);
    try {
      await navigator.clipboard.writeText(value);
      setCopyFeedback({ label, status: "copied" });
    } catch {
      setCopyFeedback({ label, status: "error" });
    }
  }

  const methods = [
    { label: "Email", value: contact.email, icon: "✉", tone: "email" },
    { label: "Phone", value: contact.phone, icon: "☎", tone: "phone" },
    { label: "GitHub", value: contact.github, icon: "GH", tone: "github" },
    { label: "LinkedIn", value: contact.linkedin, icon: "in", tone: "linkedin" },
    { label: "WeChat", value: contact.wechat, icon: "💬", tone: "wechat" },
  ];

  return (
    <article className="contact-card" aria-label="Contact Hongxiang">
      <p className="contact-card-kicker">GET IN TOUCH</p>
      <h2>Let&apos;s connect <span aria-hidden="true">👋</span></h2>
      <p className="contact-card-intro">{message}</p>

      <ul className="contact-card-methods" aria-label="Contact methods">
        {methods.map(({ label, value, icon, tone }) => {
          const copyLabel = label === "WeChat" ? "WeChat ID" : label;
          const copied = copyFeedback?.label === copyLabel && copyFeedback.status === "copied";
          return (
            <li className="contact-method" key={label}>
              <span className={`contact-icon contact-icon-${tone}`} aria-hidden="true">{icon}</span>
              <span className="contact-method-text">
                <strong>{label}</strong>
                <span className="contact-value">{value}</span>
              </span>
              <button className="contact-copy" type="button" onClick={() => copyContact(copyLabel, value)} aria-label={`Copy ${copyLabel}`}>
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="contact-copy-status" role="status">
        {copyFeedback?.status === "copied"
          ? `${copyFeedback.label} copied.`
          : copyFeedback?.status === "error"
            ? `Copy unavailable. Select the ${copyFeedback.label} value to copy it.`
            : ""}
      </p>
    </article>
  );
}
