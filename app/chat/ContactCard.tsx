"use client";

import { useState } from "react";
import type { ContactCardData } from "@/lib/portfolio/contact-profile";
import PortfolioIcon, { type PortfolioIconName } from "./PortfolioIcon";

export default function ContactCard({ contact }: { contact: ContactCardData }) {
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
    { label: "Email", value: contact.email, icon: "mail", tone: "email" },
    { label: "Phone", value: contact.phone, icon: "phone", tone: "phone" },
    { label: "GitHub", value: contact.github, icon: "github", tone: "github" },
    { label: "LinkedIn", value: contact.linkedin, icon: "linkedin", tone: "linkedin" },
    { label: "WeChat", value: contact.wechat, icon: "chat", tone: "wechat" },
  ] satisfies { label: string; value: string; icon: PortfolioIconName; tone: string }[];

  return (
    <article className="contact-card" aria-label="Contact Hongxiang">
      <h2>Let&apos;s connect</h2>

      <ul className="contact-card-methods" aria-label="Contact methods">
        {methods.map(({ label, value, icon, tone }) => {
          const copyLabel = label === "WeChat" ? "WeChat ID" : label;
          const copied = copyFeedback?.label === copyLabel && copyFeedback.status === "copied";
          return (
            <li className="contact-method" key={label}>
              <span className={`contact-icon contact-icon-${tone}`}><PortfolioIcon name={icon} /></span>
              <span className="contact-method-text">
                <strong>{label}</strong>
                <span className="contact-value">{value}</span>
              </span>
              <button className="contact-copy" type="button" data-copied={copied} onClick={() => copyContact(copyLabel, value)} aria-label={copied ? `${copyLabel} copied` : `Copy ${copyLabel}`}>
                {copied ? <PortfolioIcon name="check" size={16} /> : "Copy"}
              </button>
            </li>
          );
        })}
      </ul>
      {copyFeedback?.status === "error" && (
        <p className="contact-copy-status" role="status">
          Copy unavailable. Select the {copyFeedback.label} value to copy it.
        </p>
      )}
    </article>
  );
}
