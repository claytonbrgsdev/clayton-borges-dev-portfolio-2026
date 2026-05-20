"use client";

// TODO: Add GSAP reveal animations + form submission with Resend or similar
import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import { contactInfo } from "@/lib/data/contact";

interface ContactSectionProps {
  dict: Dictionary;
  locale: Locale;
}

export function ContactSection({ dict }: ContactSectionProps) {
  const { contact } = dict;
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const payload = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
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
    <div>
      <div className="mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{contact.heading}</h1>
        <p className="text-lg opacity-50">{contact.subheading}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-16">
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs tracking-widest uppercase opacity-40">
              {contact.form_name}
            </label>
            <input
              name="name"
              type="text"
              required
              className="bg-transparent border-b border-white/20 py-3 focus:outline-none focus:border-white/60 transition-colors text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs tracking-widest uppercase opacity-40">
              {contact.form_email}
            </label>
            <input
              name="email"
              type="email"
              required
              className="bg-transparent border-b border-white/20 py-3 focus:outline-none focus:border-white/60 transition-colors text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs tracking-widest uppercase opacity-40">
              {contact.form_subject}
            </label>
            <input
              name="subject"
              type="text"
              required
              className="bg-transparent border-b border-white/20 py-3 focus:outline-none focus:border-white/60 transition-colors text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs tracking-widest uppercase opacity-40">
              {contact.form_message}
            </label>
            <textarea
              name="message"
              required
              rows={5}
              className="bg-transparent border-b border-white/20 py-3 focus:outline-none focus:border-white/60 transition-colors text-sm resize-none"
            />
          </div>

          {status === "success" && (
            <p className="text-sm text-green-400 font-mono">{contact.form_success}</p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-400 font-mono">{contact.form_error}</p>
          )}

          <button
            type="submit"
            disabled={status === "sending" || status === "success"}
            className="mt-2 px-8 py-3 bg-white text-black font-mono text-sm tracking-wide hover:bg-white/90 transition-colors disabled:opacity-50 self-start"
          >
            {status === "sending" ? contact.form_sending : contact.form_send}
          </button>
        </form>

        {/* Direct links */}
        <div className="flex flex-col gap-8">
          <span className="font-mono text-xs tracking-widest uppercase opacity-40">
            {contact.or_reach}
          </span>
          <div className="flex flex-col gap-4">
            <a
              href={`mailto:${contactInfo.email}`}
              className="group flex items-center gap-3 text-sm opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="font-mono text-xs opacity-40 w-16">Email</span>
              <span>{contactInfo.email}</span>
            </a>
            <a
              href={contactInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-sm opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="font-mono text-xs opacity-40 w-16">GitHub</span>
              <span>claytonbrgsdev</span>
            </a>
            <a
              href={contactInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-sm opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="font-mono text-xs opacity-40 w-16">LinkedIn</span>
              <span>clayton-borges-web-dev</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
