"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import { contactInfo } from "@/lib/data/contact";

interface ContactSectionProps {
  dict: Dictionary;
  locale: Locale;
}

const mono: React.CSSProperties = { fontFamily: "var(--font-geist-mono, monospace)" };
const sans: React.CSSProperties = { fontFamily: "var(--font-geist-sans, sans-serif)" };

const inputStyle: React.CSSProperties = {
  ...sans,
  background: "transparent",
  border: "none",
  borderBottom: "1px solid rgba(10,10,10,0.2)",
  padding: "12px 0",
  fontSize: 14,
  color: "#0A0A0A",
  width: "100%",
  outline: "none",
  transition: "border-color 0.12s",
};

export function ContactSection({ dict }: ContactSectionProps) {
  const { contact } = dict;
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const payload = {
      name:    (form.elements.namedItem("name")    as HTMLInputElement).value,
      email:   (form.elements.namedItem("email")   as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div style={{ ...sans, color: "#0A0A0A" }}>
      <div style={{ marginBottom: 64 }}>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 12 }}>
          {contact.heading}
        </h1>
        <p style={{ fontSize: 16, color: "rgba(10,10,10,0.5)", lineHeight: 1.6 }}>{contact.subheading}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 64 }}>
        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {[
            { name: "name",    label: contact.form_name,    type: "text" },
            { name: "email",   label: contact.form_email,   type: "email" },
            { name: "subject", label: contact.form_subject, type: "text" },
          ].map(({ name, label, type }) => (
            <div key={name} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ ...mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(10,10,10,0.4)" }}>
                {label}
              </label>
              <input
                name={name}
                type={type}
                required
                style={inputStyle}
                onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderBottomColor = "#0A0A0A"; }}
                onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.borderBottomColor = "rgba(10,10,10,0.2)"; }}
              />
            </div>
          ))}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ ...mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(10,10,10,0.4)" }}>
              {contact.form_message}
            </label>
            <textarea
              name="message"
              required
              rows={5}
              style={{ ...inputStyle, resize: "none" }}
              onFocus={(e) => { (e.currentTarget as HTMLTextAreaElement).style.borderBottomColor = "#0A0A0A"; }}
              onBlur={(e) => { (e.currentTarget as HTMLTextAreaElement).style.borderBottomColor = "rgba(10,10,10,0.2)"; }}
            />
          </div>

          {status === "success" && (
            <p style={{ ...mono, fontSize: 12, color: "#2A9D5C" }}>{contact.form_success}</p>
          )}
          {status === "error" && (
            <p style={{ ...mono, fontSize: 12, color: "#C0392B" }}>{contact.form_error}</p>
          )}

          <button
            type="submit"
            disabled={status === "sending" || status === "success"}
            style={{
              ...mono,
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "12px 28px",
              background: "#0A0A0A",
              color: "#F2F0EC",
              border: "none",
              cursor: status === "sending" || status === "success" ? "not-allowed" : "pointer",
              opacity: status === "sending" || status === "success" ? 0.5 : 1,
              alignSelf: "flex-start",
              transition: "background 0.12s",
            }}
            onMouseEnter={(e) => {
              if (status === "idle") (e.currentTarget as HTMLButtonElement).style.background = "#6B35D9";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#0A0A0A";
            }}
          >
            {status === "sending" ? contact.form_sending : contact.form_send}
          </button>
        </form>

        {/* Direct links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <span style={{ ...mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(10,10,10,0.4)" }}>
            {contact.or_reach}
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, borderTop: "1px solid rgba(10,10,10,0.08)" }}>
            {[
              { label: "Email",    href: `mailto:${contactInfo.email}`,  value: contactInfo.email },
              { label: "GitHub",   href: contactInfo.github,             value: "claytonbrgsdev" },
              { label: "LinkedIn", href: contactInfo.linkedin,           value: "clayton-borges-web-dev" },
            ].map(({ label, href, value }) => (
              <div key={label} style={{ borderBottom: "1px solid rgba(10,10,10,0.08)", padding: "14px 0", display: "flex", alignItems: "baseline", gap: 20 }}>
                <span style={{ ...mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(10,10,10,0.35)", minWidth: 64 }}>
                  {label}
                </span>
                <a
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  style={{ ...sans, fontSize: 14, color: "#0A0A0A", textDecoration: "none", borderBottom: "1px solid rgba(10,10,10,0.2)", paddingBottom: 1, transition: "color 0.12s, border-color 0.12s" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#6B35D9";
                    (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = "#6B35D9";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#0A0A0A";
                    (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = "rgba(10,10,10,0.2)";
                  }}
                >
                  {value}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
