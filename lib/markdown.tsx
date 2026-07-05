import { useState } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="absolute top-2 right-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      style={{ background: "#4A3728", color: "#B8A38C" }}
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeBlock({ language, code }: { language?: string; code: string }) {
  return (
    <div className="group relative my-3 rounded-lg overflow-hidden" style={{ background: "#1A0F0A" }}>
      {language && (
        <div
          className="px-4 py-1.5 text-xs font-mono"
          style={{ background: "#2A1B14", color: "#8C7A64", borderBottom: "1px solid #3A2A1E" }}
        >
          {language}
        </div>
      )}
      <CopyButton text={code} />
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed" style={{ color: "#E8D5C0" }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function parseInline(input: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(`[^`]+`)|(\*\*[^*]+\*\*)|(_[^_]+_)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIdx) {
      nodes.push(<span key={key++}>{input.slice(lastIdx, match.index)}</span>);
    }
    if (match[1]) {
      const code = match[1].slice(1, -1);
      nodes.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 rounded text-sm font-mono"
          style={{ background: "#3A2A1E", color: "#E8A33D" }}
        >
          {code}
        </code>
      );
    } else if (match[2]) {
      nodes.push(<strong key={key++}>{match[2].slice(2, -2)}</strong>);
    } else if (match[3]) {
      nodes.push(<em key={key++}>{match[3].slice(1, -1)}</em>);
    }
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < input.length) {
    nodes.push(<span key={key++}>{input.slice(lastIdx)}</span>);
  }
  return nodes;
}

function parseLine(line: string, key: number): React.ReactNode {
  const trimmed = line.trim();

  const headingMatch = trimmed.match(/^(#{1,6})\s/);
  if (headingMatch) {
    const level = headingMatch[1].length;
    const text = trimmed.slice(level + 1);
    const sizes: Record<number, string> = {
      1: "text-2xl font-bold my-4",
      2: "text-xl font-bold my-3",
      3: "text-lg font-semibold my-2",
      4: "text-base font-semibold my-2",
      5: "text-sm font-medium my-1",
      6: "text-xs font-medium my-1",
    };
    const props = { key, className: sizes[level], style: { color: "#F5E6D3" as const } };
    switch (level) {
      case 1: return <h1 {...props}>{parseInline(text)}</h1>;
      case 2: return <h2 {...props}>{parseInline(text)}</h2>;
      case 3: return <h3 {...props}>{parseInline(text)}</h3>;
      case 4: return <h4 {...props}>{parseInline(text)}</h4>;
      case 5: return <h5 {...props}>{parseInline(text)}</h5>;
      case 6: return <h6 {...props}>{parseInline(text)}</h6>;
      default: return <p key={key} className="text-sm leading-relaxed my-1.5" style={{ color: "#E8D5C0" }}>{parseInline(text)}</p>;
    }
  }

  if (/^>\s/.test(trimmed)) {
    return (
      <blockquote
        key={key}
        className="pl-3 my-2 border-l-2 italic text-sm"
        style={{ borderColor: "#E8A33D", color: "#B8A38C" }}
      >
        {parseInline(trimmed.replace(/^>\s*/, ""))}
      </blockquote>
    );
  }

  if (/^- /.test(trimmed) || /^\* /.test(trimmed)) {
    return (
      <li key={key} className="ml-5 list-disc text-sm my-1" style={{ color: "#E8D5C0" }}>
        {parseInline(trimmed.replace(/^[-*]\s*/, ""))}
      </li>
    );
  }

  if (/^\d+\.\s/.test(trimmed)) {
    return (
      <li key={key} className="ml-5 list-decimal text-sm my-1" style={{ color: "#E8D5C0" }}>
        {parseInline(trimmed.replace(/^\d+\.\s*/, ""))}
      </li>
    );
  }

  if (trimmed === "---") {
    return <hr key={key} className="my-4 border-0 h-px" style={{ background: "#3A2A1E" }} />;
  }

  if (trimmed === "") {
    return <br key={key} />;
  }

  return (
    <p key={key} className="text-sm leading-relaxed my-1.5" style={{ color: "#E8D5C0" }}>
      {parseInline(line)}
    </p>
  );
}

export function Markdown({ content }: { content: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = content.split("\n");
  let key = 0;
  let inCode = false;
  let codeLanguage = "";
  let codeBuffer: string[] = [];

  function flushCode() {
    if (codeBuffer.length > 0) {
      blocks.push(
        <CodeBlock key={key++} language={codeLanguage || undefined} code={codeBuffer.join("\n")} />
      );
      codeBuffer = [];
      codeLanguage = "";
    }
  }

  for (const line of lines) {
    if (/^```/.test(line)) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushCode();
        inCode = true;
        codeLanguage = line.slice(3).trim();
      }
      continue;
    }
    if (inCode) {
      codeBuffer.push(line);
    } else {
      blocks.push(parseLine(line, key++));
    }
  }
  if (inCode) {
    flushCode();
  }

  return <div className="space-y-0.5">{blocks}</div>;
}
