const ALLOWED_TAGS = new Set([
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "p",
  "br",
  "ul",
  "ol",
  "li",
  "span",
  "div",
]);

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, "\u00a0")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&amp;/g, "&");
}

/** Prepare editor HTML for learner display with proper paragraphs and decoded entities. */
export function normalizeRichTextHtml(html: string): string {
  let text = html.trim();
  if (!text) return "";

  if (/&lt;\/?[a-z]/i.test(text)) {
    text = decodeHtmlEntities(text);
  }

  const hasMarkup = /<\/?[a-z][\s\S]*?>/i.test(text);
  if (!hasMarkup) {
    const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    if (lines.length > 1) {
      return lines.map((line) => `<p>${line}</p>`).join("");
    }
    return `<p>${text}</p>`;
  }

  return text;
}

/** Strip scripts/events; keep basic formatting tags for learner display. */
export function sanitizeHtml(html: string) {
  if (!html) return "";
  if (typeof DOMParser === "undefined") return html;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const walk = (node: Node) => {
    const children = [...node.childNodes];
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (!ALLOWED_TAGS.has(tag)) {
          while (el.firstChild) el.parentNode?.insertBefore(el.firstChild, el);
          el.remove();
          continue;
        }
        [...el.attributes].forEach((attr) => el.removeAttribute(attr.name));
        walk(el);
      }
    }
  };
  walk(doc.body);
  return doc.body.innerHTML;
}

export function isHtmlContent(value: string) {
  return /<\/?[a-z][\s\S]*?>/i.test(value) || /&(?:[a-z]+|#\d+|#x[\da-f]+);/i.test(value);
}

/** True when rich text has visible content (not empty / only breaks). */
export function richTextHasContent(html?: string | null) {
  if (!html) return false;
  const trimmed = html.trim();
  if (!trimmed || trimmed === "<br>" || trimmed === "<p><br></p>" || trimmed === "<div><br></div>") {
    return false;
  }
  if (typeof DOMParser !== "undefined") {
    const text = new DOMParser().parseFromString(trimmed, "text/html").body.textContent ?? "";
    return text.replace(/\u00a0/g, " ").trim().length > 0;
  }
  return trimmed.replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").trim().length > 0;
}
