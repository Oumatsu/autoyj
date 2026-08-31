"use client";

import React, { useMemo } from "react";
import { resolveMarkdownImage } from "@/lib/static-assets";

// ── Markdown line-by-line parser ──

let mdKey = 0;
function nextKey() {
  return mdKey++;
}

function parseInlineMd(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // **bold**
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*([\s\S]+?)\*\*([\s\S]*)/);
    if (boldMatch) {
      if (boldMatch[1]) parts.push(boldMatch[1]);
      parts.push(<strong key={nextKey()}>{parseInlineMd(boldMatch[2])}</strong>);
      remaining = boldMatch[3];
      continue;
    }
    // Since bold is parsed first, any remaining * are italics.
    const emMatch = remaining.match(/^([\s\S]*?)\*([^*]+?)\*([\s\S]*)/);
    if (emMatch) {
      if (emMatch[1]) parts.push(emMatch[1]);
      parts.push(<em key={nextKey()}>{parseInlineMd(emMatch[2])}</em>);
      remaining = emMatch[3];
      continue;
    }
    // [text](url)
    const linkMatch = remaining.match(/^([\s\S]*?)\[([^\]]+)\]\(([^)]+)\)([\s\S]*)/);
    if (linkMatch) {
      if (linkMatch[1]) parts.push(linkMatch[1]);
      parts.push(
        <a
          key={nextKey()}
          href={linkMatch[3]}
          className="text-gold hover:underline"
        >
          {linkMatch[2]}
        </a>,
      );
      remaining = linkMatch[4];
      continue;
    }
    // `code`
    const codeMatch = remaining.match(/^([\s\S]*?)`([\s\S]+?)`([\s\S]*)/);
    if (codeMatch) {
      if (codeMatch[1]) parts.push(codeMatch[1]);
      parts.push(
        <code key={nextKey()} className="bg-white/10 px-1.5 py-0.5 rounded text-sm">
          {codeMatch[2]}
        </code>,
      );
      remaining = codeMatch[3];
      continue;
    }
    // Plain text
    parts.push(remaining);
    break;
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function parseMarkdown(
  md: string,
  imageBasePath?: string,
  imageFallback?: string,
): React.ReactNode[] {
  mdKey = 0;
  const lines = md.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // ### heading
    if (line.startsWith("### ")) {
      elements.push(<h3 key={nextKey()}>{parseInlineMd(line.slice(4))}</h3>);
      i++;
      continue;
    }

    // ## heading
    if (line.startsWith("## ")) {
      elements.push(<h2 key={nextKey()}>{parseInlineMd(line.slice(3))}</h2>);
      i++;
      continue;
    }

    // # heading
    if (line.startsWith("# ")) {
      elements.push(<h1 key={nextKey()}>{parseInlineMd(line.slice(2))}</h1>);
      i++;
      continue;
    }

    // > blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].replace(/^>\s*/, ""));
        i++;
      }
      elements.push(
        <blockquote key={nextKey()} className="bq-note">
          {quoteLines.map((ql, qi) => (
            <p key={qi}>{parseInlineMd(ql)}</p>
          ))}
        </blockquote>,
      );
      continue;
    }

    // --- horizontal rule
    if (/^-{3,}$|^\*{3,}$/.test(line.trim())) {
      elements.push(<hr key={nextKey()} />);
      i++;
      continue;
    }

    // ![alt](src)  image (with optional *caption* on next line)
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      const alt = imgMatch[1];
      let src = imgMatch[2];
      if (imageBasePath && imageBasePath.startsWith("/pic/") && !src.startsWith("/")) {
        src = `${imageBasePath}/${src}`;
      }
      src = resolveMarkdownImage(src, imageFallback);
      let caption = "";
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";
      const isCaptionLine =
        nextLine.startsWith("*") &&
        nextLine.endsWith("*") &&
        !nextLine.startsWith("**");
      if (isCaptionLine) {
        caption = nextLine.replace(/^\*/, "").replace(/\*$/, "").trim();
        i++;
      }
      elements.push(
        <div key={nextKey()} className="rounded-[1.5rem] overflow-hidden my-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="w-full h-auto object-cover"
            style={{ maxHeight: "450px" }}
            onError={(event) => {
              const fallback = resolveMarkdownImage(null, imageFallback);
              if (!event.currentTarget.src.endsWith(fallback)) {
                event.currentTarget.src = fallback;
              }
            }}
          />
          {caption && (
            <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5">
              <p className="text-xs text-gray-500 font-light italic leading-relaxed">
                {caption}
              </p>
            </div>
          )}
        </div>,
      );
      i++;
      continue;
    }

    // - or * unordered list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: React.ReactNode[] = [];
      while (
        i < lines.length &&
        (lines[i].startsWith("- ") || lines[i].startsWith("* "))
      ) {
        items.push(
          <li key={nextKey()}>
            {parseInlineMd(lines[i].replace(/^[-*]\s*/, ""))}
          </li>,
        );
        i++;
      }
      elements.push(<ul key={nextKey()}>{items}</ul>);
      continue;
    }

    // 1. ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(
          <li key={nextKey()}>
            {parseInlineMd(lines[i].replace(/^\d+\.\s*/, ""))}
          </li>,
        );
        i++;
      }
      elements.push(<ol key={nextKey()}>{items}</ol>);
      continue;
    }

    // | table |
    if (line.trim().startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(
          lines[i]
            .split("|")
            .filter((c) => c.trim())
            .map((c) => c.trim()),
        );
        i++;
      }
      const isSeparatorRow = (row: string[]) =>
        row.every((c) => /^:?-{2,}:?$/.test(c));
      elements.push(
        <div key={nextKey()} className="overflow-x-auto my-8">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {rows.map((row, ri) => {
                if (isSeparatorRow(row)) return null;
                const isHeader = ri === 0;
                const Tag = isHeader ? "th" : "td";
                const cellClass = isHeader
                  ? "py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left"
                  : "py-3 px-4 text-sm text-gray-300 border-b border-white/5";
                return (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <Tag key={ci} className={cellClass}>
                        {parseInlineMd(cell)}
                      </Tag>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // paragraph — accumulate until blank line or special start
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("> ") &&
      !lines[i].trim().startsWith("|") &&
      !lines[i].startsWith("- ") &&
      !lines[i].startsWith("* ") &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^!\[/.test(lines[i]) &&
      !/^(-{3,}|\*{3,})$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (paraLines.length > 0) {
      // Detect italic-only metadata line: starts and ends with * (single)
      const isMeta =
        paraLines.length === 1 &&
        paraLines[0].startsWith("*") &&
        paraLines[0].endsWith("*") &&
        !paraLines[0].startsWith("**");
      if (isMeta) {
        elements.push(
          <p key={nextKey()} className="text-gray-500 text-xs font-light italic mt-8">
            {parseInlineMd(paraLines[0].replace(/^\*/, "").replace(/\*$/, "").trim())}
          </p>,
        );
      } else {
        elements.push(
          <p key={nextKey()}>
            {paraLines.map((pl, pi) => (
              <React.Fragment key={pi}>
                {parseInlineMd(pl)}
                {pi < paraLines.length - 1 ? <br /> : null}
              </React.Fragment>
            ))}
          </p>,
        );
      }
    }
  }

  return elements;
}

// ── Public component ──

interface MarkdownRendererProps {
  content: string;
  imageBasePath?: string;
  imageFallback?: string;
}

function MarkdownRenderer({
  content,
  imageBasePath,
  imageFallback,
}: MarkdownRendererProps) {
  const rendered = useMemo(() => {
    if (!content) return null;
    return parseMarkdown(content, imageBasePath, imageFallback);
  }, [content, imageBasePath, imageFallback]);

  return <>{rendered}</>;
}

export default MarkdownRenderer;
