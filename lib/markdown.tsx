import { useState } from "react";

const SYNTAX_COLORS: Record<string, Record<string, string>> = {
  js: {
    keyword: "#c678dd",
    string: "#98c379",
    number: "#d19a66",
    builtin: "#e5c07b",
    comment: "#5c6370",
    operator: "#56b6c2",
    func: "#61afef",
    variable: "#e06c75",
  },
  jsx: {
    keyword: "#c678dd",
    string: "#98c379",
    number: "#d19a66",
    builtin: "#e5c07b",
    comment: "#5c6370",
    operator: "#56b6c2",
    func: "#61afef",
    tag: "#e06c75",
    attr: "#d19a66",
  },
  ts: {
    keyword: "#c678dd",
    string: "#98c379",
    number: "#d19a66",
    builtin: "#e5c07b",
    comment: "#5c6370",
    operator: "#56b6c2",
    func: "#61afef",
    type: "#e5c07b",
  },
  python: {
    keyword: "#c678dd",
    string: "#98c379",
    number: "#d19a66",
    builtin: "#e5c07b",
    comment: "#5c6370",
    decorator: "#61afef",
    operator: "#56b6c2",
  },
  bash: {
    keyword: "#c678dd",
    string: "#98c379",
    comment: "#5c6370",
    builtin: "#e5c07b",
  },
  json: {
    key: "#e06c75",
    string: "#98c379",
    number: "#d19a66",
    boolean: "#56b6c2",
    null: "#c678dd",
  },
  css: {
    property: "#61afef",
    value: "#98c379",
    selector: "#e06c75",
    keyword: "#c678dd",
    unit: "#d19a66",
    comment: "#5c6370",
  },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="absolute top-2 right-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:scale-105"
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
  const lines = code.split("\n");
  const lang = language || "";
  const colors = SYNTAX_COLORS[lang] || null;
  const lineCount = lines.length;

  return (
    <div className="group relative my-3 rounded-xl overflow-hidden" style={{ background: "#0f0a08", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
      <div
        className="flex items-center justify-between px-4 py-1.5 text-xs font-mono select-none"
        style={{ background: "#1a120e", color: "#8C7A64", borderBottom: "1px solid #3A2A1E" }}
      >
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#e06c75" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#e5c07b" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#98c379" }} />
          </span>
          <span style={{ color: "#5c6370" }}>{lang || "code"}</span>
        </div>
        {lineCount > 1 && (
          <span style={{ color: "#5c6370" }}>{lineCount} lines</span>
        )}
      </div>
      <CopyButton text={code} />
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed" style={{ color: "#E8D5C0" }}>
        {colors ? (
          <code>{highlightCode(code, lang, colors)}</code>
        ) : (
          <code>{code}</code>
        )}
      </pre>
    </div>
  );
}

function highlightCode(code: string, lang: string, colors: Record<string, string>): React.ReactNode {
  const lines = code.split("\n");
  return lines.map((line, i) => (
    <div key={i} className="flex">
      <span
        className="select-none text-right pr-4 shrink-0"
        style={{ color: "#4a3728", minWidth: "2.5ch" }}
      >
        {i + 1}
      </span>
      <span className="flex-1">
        <HighlightLine line={line} lang={lang} colors={colors} />
      </span>
      {i < lines.length - 1 && "\n"}
    </div>
  ));
}

const HIGHLIGHT_PATTERNS: Record<string, RegExp[]> = {
  keyword: [
    /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|import|export|from|default|async|await|yield|throw|try|catch|finally|new|class|extends|super|this|typeof|instanceof|void|delete|in|of|class|implements|interface|enum|type|declare|module|namespace|abstract|private|protected|public|static|readonly|as|any|boolean|number|string|null|undefined|never|unknown|symbol|bigint)\b/g,
  ],
  string: [/(["'`])(?:(?!\1|\\).|\\.)*\1/g],
  number: [/\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g],
  comment: [/(\/\/.*$)|(\/\*[\s\S]*?\*\/)/gm],
  builtin: [/\b(console|Math|JSON|Promise|Array|Object|String|Number|Boolean|Map|Set|Symbol|RegExp|Error|Date|parseInt|parseFloat|setTimeout|setInterval|fetch|require|process|Buffer|__dirname|__filename|module|exports|Reflect|Proxy|WeakMap|WeakSet)\b/g],
};

function HighlightLine({ line, colors }: { line: string; lang: string; colors: Record<string, string> }) {
  const tokens: React.ReactNode[] = [];
  const patterns = HIGHLIGHT_PATTERNS;
  let lastIdx = 0;

  const matches: { start: number; end: number; color: string }[] = [];

  for (const [type, regexps] of Object.entries(patterns)) {
    const color = colors[type];
    if (!color) continue;
    for (const re of regexps) {
      let m: RegExpExecArray | null;
      re.lastIndex = 0;
      while ((m = re.exec(line)) !== null) {
        matches.push({ start: m.index, end: m.index + m[0].length, color });
      }
    }
  }

  matches.sort((a, b) => a.start - b.start);

  for (const m of matches) {
    if (m.start > lastIdx) {
      tokens.push(<span key={tokens.length}>{line.slice(lastIdx, m.start)}</span>);
    }
    tokens.push(
      <span key={tokens.length} style={{ color: m.color }}>
        {line.slice(m.start, m.end)}
      </span>,
    );
    lastIdx = m.end;
  }
  if (lastIdx < line.length) {
    tokens.push(<span key={tokens.length}>{line.slice(lastIdx)}</span>);
  }

  return <>{tokens.length > 0 ? tokens : line}</>;
}

function parseInline(input: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(`[^`]+`)|(!\[([^\]]*)\]\(([^)]+)\))|(\[([^\]]*)\]\(([^)]+)\))|(\*\*[^*]+\*\*)|(~~[^~]+~~)|(_[^_]+_)/g;
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
          style={{ background: "rgba(232,163,61,0.12)", color: "#E8A33D" }}
        >
          {code}
        </code>
      );
    } else if (match[2]) {
      const alt = match[3];
      const src = match[4];
      nodes.push(
        <img
          key={key++}
          src={src}
          alt={alt}
          className="max-w-full h-auto rounded-lg my-2"
          loading="lazy"
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = "none";
          }}
        />
      );
    } else if (match[5]) {
      const text = match[6];
      const href = match[7];
      nodes.push(
        <a
          key={key++}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-dotted underline-offset-2 transition-colors hover:decoration-solid"
          style={{ color: "#E8A33D" }}
        >
          {text}
        </a>
      );
    } else if (match[8]) {
      nodes.push(<strong key={key++}>{match[8].slice(2, -2)}</strong>);
    } else if (match[9]) {
      nodes.push(
        <del key={key++} style={{ color: "#8C7A64" }}>
          {match[9].slice(2, -2)}
        </del>
      );
    } else if (match[10]) {
      nodes.push(<em key={key++}>{match[10].slice(1, -1)}</em>);
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

  const taskMatch = trimmed.match(/^[-*]\s+\[([ xX])\]\s+(.+)/);
  if (taskMatch) {
    const checked = taskMatch[1] !== " ";
    return (
      <li key={key} className="flex items-start gap-2 ml-1 my-1 text-sm" style={{ color: "#E8D5C0" }}>
        <input
          type="checkbox"
          checked={checked}
          readOnly
          className="mt-0.5 shrink-0 accent-[#E8A33D]"
        />
        <span className={checked ? "line-through" : ""} style={{ color: checked ? "#8C7A64" : "#E8D5C0" }}>
          {parseInline(taskMatch[2])}
        </span>
      </li>
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

function parseTableBlock(lines: string[], startIdx: number, key: number): { node: React.ReactNode; consumed: number } {
  const headerLine = lines[startIdx];
  const alignLine = lines[startIdx + 1];
  if (!alignLine || !/^[\s:|:-]+$/.test(alignLine.trim())) {
    return { node: parseLine(headerLine, key), consumed: 1 };
  }

  const headers = headerLine.split("|").map((s) => s.trim()).filter(Boolean);
  const alignParts = alignLine.split("|").map((s) => s.trim()).filter(Boolean);

  const aligns = alignParts.map((part) => {
    if (/^:-+:$/.test(part)) return "center" as const;
    if (/^-+:$/.test(part)) return "right" as const;
    return "left" as const;
  });

  const rows: string[][] = [];
  let i = startIdx + 2;
  while (i < lines.length && lines[i].includes("|") && !/^```/.test(lines[i].trim())) {
    const cells = lines[i].split("|").map((s) => s.trim()).filter(Boolean);
    if (cells.length > 0) rows.push(cells);
    i++;
  }

  const tableNode = (
    <div key={key} className="my-3 overflow-x-auto rounded-lg" style={{ border: "1px solid #3A2A1E" }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ background: "#1a120e" }}>
            {headers.map((h, ci) => (
              <th
                key={ci}
                className="px-3 py-2 font-semibold whitespace-nowrap border-b"
                style={{ borderColor: "#4A3728", color: "#F5E6D3", textAlign: aligns[ci] || "left" }}
              >
                {parseInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? "transparent" : "rgba(15,10,8,0.5)" }}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-3 py-2 border-b"
                  style={{ borderColor: "#3A2A1E", color: "#E8D5C0", textAlign: aligns[ci] || "left" }}
                >
                  {parseInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return { node: tableNode, consumed: i - startIdx };
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

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line.trim())) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushCode();
        inCode = true;
        codeLanguage = line.trim().slice(3).trim();
      }
      i++;
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      i++;
      continue;
    }

    if (line.includes("|") && /^\|/.test(line.trim()) && i + 1 < lines.length && /^[\s:|:-]+$/.test(lines[i + 1].trim())) {
      const { node, consumed } = parseTableBlock(lines, i, key++);
      blocks.push(node);
      i += consumed;
      continue;
    }

    blocks.push(parseLine(line, key++));
    i++;
  }

  if (inCode) {
    flushCode();
  }

  return <div className="space-y-0.5">{blocks}</div>;
}
