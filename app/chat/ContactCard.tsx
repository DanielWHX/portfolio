"use client";

import { useState } from "react";

import type { ContactCardData } from "@/lib/portfolio/contact-profile";

export default function ContactCard({ contact, message }: { contact: ContactCardData; message: string }) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  async function copyWeChat() {
    try {
      await navigator.clipboard.writeText(contact.wechat);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  const links = [
    { label: "Email", value: contact.email, href: `mailto:${contact.email}`, icon: "✉", tone: "email" },
    { label: "Phone", value: contact.phone, href: `tel:${contact.phone}`, icon: "☎", tone: "phone" },
    { label: "GitHub", value: "github.com/DanielWHX", href: contact.github, icon: "GH", tone: "github" },
    { label: "LinkedIn", value: "hongxiang-wang-5aa597221", href: contact.linkedin, icon: "in", tone: "linkedin" },
  ];

  return (
    <article className="contact-card" aria-label="Contact Hongxiang">
      <p className="contact-card-kicker">GET IN TOUCH</p>
      <h2>Let&apos;s connect <span aria-hidden="true">👋</span></h2>
      <p className="contact-card-intro">{message}</p>

      <ul className="contact-card-methods" aria-label="Contact methods">
        {links.map(({ label, value, href, icon, tone }) => (
          <li key={label}>
            <a className="contact-method" href={href} {...(href.startsWith("https:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              <span className={`contact-icon contact-icon-${tone}`} aria-hidden="true">{icon}</span>
              <span className="contact-method-text">
                <strong>{label}</strong>
                <span>{value}</span>
              </span>
              <span className="contact-method-arrow" aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
        <li className="contact-method contact-method-wechat">
          <span className="contact-icon contact-icon-wechat" aria-hidden="true">💬</span>
          <span className="contact-method-text">
            <strong>WeChat</strong>
            <span className="contact-wechat-id">{contact.wechat}</span>
          </span>
          <button className="contact-copy" type="button" onClick={copyWeChat} aria-label="Copy WeChat ID">
            {copyStatus === "copied" ? "Copied ✓" : "Copy"}
          </button>
        </li>
      </ul>
      <p className="contact-copy-status" role="status">
        {copyStatus === "copied" ? "WeChat ID copied." : copyStatus === "error" ? "Copy unavailable. Select the WeChat ID to copy it." : ""}
      </p>
    </article>
  );
}
