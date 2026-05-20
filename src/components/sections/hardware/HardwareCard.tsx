"use client";

// TODO: Add GSAP scroll-triggered entrance, image gallery lightbox
import { useState } from "react";
import Image from "next/image";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import type { HardwareProject, HardwareImage } from "@/lib/data/hardware";

interface HardwareCardProps {
  project: HardwareProject;
  dict: Dictionary;
  locale: Locale;
  index: number;
}

const IMAGE_TYPE_LABELS: Record<HardwareImage["type"], keyof Dictionary["hardware"]> = {
  photo: "photo_label",
  schematic: "schematic_label",
  diagram: "diagram_label",
  breadboard: "breadboard_label",
  pcb: "pcb_label",
};

const STATUS_LABELS: Record<HardwareProject["status"], keyof Dictionary["hardware"]> = {
  completed: "status_completed",
  "in-progress": "status_in_progress",
  prototype: "status_prototype",
};

export function HardwareCard({ project, dict, locale }: HardwareCardProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const name = locale === "pt" ? project.namePt : project.nameEn;
  const tagline = locale === "pt" ? project.taglinePt : project.taglineEn;
  const description = locale === "pt" ? project.descriptionPt : project.descriptionEn;
  const body = locale === "pt" ? project.bodyPt : project.bodyEn;
  const paragraphs = body.split("\n\n").filter(Boolean);

  const hw = dict.hardware;

  return (
    <article className="border-t border-white/10 pt-16">
      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-12">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <span className="font-mono text-xs tracking-widest uppercase opacity-40">
              {project.microcontroller}
            </span>
            <span className="font-mono text-xs tracking-widest uppercase opacity-40">·</span>
            <span className="font-mono text-xs tracking-widest uppercase opacity-40">
              {project.year}
            </span>
            <span
              className={`font-mono text-xs tracking-wide px-2 py-0.5 border ${
                project.status === "completed"
                  ? "border-green-500/40 text-green-400 opacity-70"
                  : project.status === "in-progress"
                  ? "border-yellow-500/40 text-yellow-400 opacity-70"
                  : "border-white/20 opacity-40"
              }`}
            >
              {hw[STATUS_LABELS[project.status]] as string}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">{name}</h2>
          <p className="opacity-50 text-lg">{tagline}</p>
        </div>

        {/* Links */}
        <div className="flex gap-4 shrink-0">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs tracking-wide border border-white/20 px-4 py-2 opacity-60 hover:opacity-100 hover:border-white/50 transition-all"
            >
              {hw.view_code} ↗
            </a>
          )}
          {project.videoUrl && (
            <a
              href={project.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs tracking-wide border border-white/20 px-4 py-2 opacity-60 hover:opacity-100 hover:border-white/50 transition-all"
            >
              {hw.view_video} ↗
            </a>
          )}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-2 gap-16">
        {/* Left — Image gallery */}
        <div>
          {project.images.length > 0 ? (
            <div>
              {/* Main image */}
              <div
                className="relative aspect-[4/3] bg-white/5 border border-white/10 overflow-hidden cursor-zoom-in mb-3"
                onClick={() => setLightboxOpen(true)}
              >
                <Image
                  src={project.images[activeImage].src}
                  alt={project.images[activeImage].alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onError={(e) => {
                    // Graceful fallback while real images are pending
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                {/* Fallback overlay (shown when image is missing) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-xs opacity-20">
                    [{hw[IMAGE_TYPE_LABELS[project.images[activeImage].type]] as string}]
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 font-mono text-xs opacity-40 bg-black/60 px-2 py-1">
                  {hw[IMAGE_TYPE_LABELS[project.images[activeImage].type]] as string}
                </div>
              </div>

              {/* Caption */}
              {project.images[activeImage].caption && (
                <p className="text-xs opacity-40 font-mono mb-4">
                  {project.images[activeImage].caption}
                </p>
              )}

              {/* Thumbnails */}
              {project.images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {project.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`relative w-16 h-16 border overflow-hidden transition-all ${
                        i === activeImage
                          ? "border-white/60"
                          : "border-white/10 opacity-50 hover:opacity-80"
                      }`}
                      aria-label={img.alt}
                    >
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover"
                        sizes="64px"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-mono text-[8px] opacity-30">
                          {hw[IMAGE_TYPE_LABELS[img.type]] as string}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-[4/3] bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="font-mono text-xs opacity-20">[{hw.gallery_label}]</span>
            </div>
          )}
        </div>

        {/* Right — Content */}
        <div className="flex flex-col gap-8">
          {/* Description */}
          <p className="opacity-70 leading-relaxed">{description}</p>

          {/* Body paragraphs */}
          <div className="flex flex-col gap-4">
            {paragraphs.map((para, i) => (
              <p key={i} className="opacity-50 text-sm leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          {/* Tech stack */}
          <div>
            <span className="font-mono text-xs tracking-widest uppercase opacity-40 block mb-3">
              Stack
            </span>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="font-mono text-xs border border-white/15 px-3 py-1.5 opacity-60"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Specs table */}
          {project.specs.length > 0 && (
            <div>
              <span className="font-mono text-xs tracking-widest uppercase opacity-40 block mb-3">
                {hw.specs_label}
              </span>
              <table className="w-full text-sm">
                <tbody>
                  {project.specs.map((spec) => (
                    <tr key={spec.label} className="border-b border-white/5">
                      <td className="py-2 pr-4 font-mono text-xs opacity-40 whitespace-nowrap align-top">
                        {spec.label}
                      </td>
                      <td className="py-2 opacity-70 align-top">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && project.images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-6 right-6 font-mono text-sm opacity-50 hover:opacity-100"
            onClick={() => setLightboxOpen(false)}
          >
            ✕ close
          </button>
          <div className="relative max-w-4xl w-full max-h-[80vh] aspect-[4/3]">
            <Image
              src={project.images[activeImage].src}
              alt={project.images[activeImage].alt}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
          {project.images[activeImage].caption && (
            <p className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs opacity-40">
              {project.images[activeImage].caption}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
