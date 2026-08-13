// Runtime DOM auto-translator.
// The app is authored in French. When the user switches to English, this
// walks visible text nodes, batches them to the `translate-batch` edge
// function, caches results in localStorage, and swaps them in place.
// A MutationObserver keeps dynamic content (async data, dialogs, etc.) translated.

import { supabase } from "@/integrations/supabase/client";

type Lang = "fr" | "en";

const CACHE_KEY = "ladune_translate_cache_v1";
const ORIGINAL = Symbol.for("ladune.originalText");
const SOURCE_LANG: Lang = "fr";

interface CachedNode extends Text {
  [ORIGINAL]?: string;
}

const loadCache = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
};
let cache: Record<string, string> = loadCache();
const saveCache = () => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* quota — ignore */
  }
};

const SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA", "INPUT",
  "SVG", "PATH", "CANVAS", "IFRAME",
]);

const shouldSkip = (node: Node): boolean => {
  let el: Node | null = node;
  while (el) {
    if (el.nodeType === Node.ELEMENT_NODE) {
      const e = el as HTMLElement;
      if (SKIP_TAGS.has(e.tagName)) return true;
      if (e.hasAttribute("data-no-translate") || e.getAttribute("translate") === "no") return true;
    }
    el = el.parentNode;
  }
  return false;
};

const isTranslatable = (text: string) => {
  const t = text.trim();
  if (t.length < 2) return false;
  // skip pure numbers, dates, currencies, emails, urls
  if (/^[\d\s.,:/€$%+\-()]+$/.test(t)) return false;
  if (/^https?:\/\//i.test(t)) return false;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return false;
  // must contain a letter
  if (!/[A-Za-zÀ-ÿ]/.test(t)) return false;
  return true;
};

const collectTextNodes = (root: Node): CachedNode[] => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n: Node) => {
      if (!n.nodeValue || !isTranslatable(n.nodeValue)) return NodeFilter.FILTER_REJECT;
      if (shouldSkip(n)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes: CachedNode[] = [];
  let cur = walker.nextNode();
  while (cur) {
    nodes.push(cur as CachedNode);
    cur = walker.nextNode();
  }
  return nodes;
};

const collectAttrTargets = (
  root: Node,
): Array<{ el: HTMLElement; attr: string }> => {
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return [];
  const targets: Array<{ el: HTMLElement; attr: string }> = [];
  const scope = root.nodeType === Node.DOCUMENT_NODE ? (root as Document).body : (root as Element);
  const attrs = ["placeholder", "title", "aria-label", "alt"];
  attrs.forEach((attr) => {
    scope.querySelectorAll<HTMLElement>(`[${attr}]`).forEach((el) => {
      if (shouldSkip(el)) return;
      const v = el.getAttribute(attr);
      if (v && isTranslatable(v)) targets.push({ el, attr });
    });
  });
  return targets;
};

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const key = (from: Lang, to: Lang, text: string) => `${from}>${to}::${text}`;

const requestTranslation = async (
  texts: string[],
  from: Lang,
  to: Lang,
): Promise<string[]> => {
  const { data, error } = await supabase.functions.invoke("translate-batch", {
    body: { texts, from, to },
  });
  if (error || !data?.translations) {
    console.warn("Translation failed:", error || "No data");
    return texts;
  }
  return data.translations as string[];
};

interface AttrTarget { el: HTMLElement; attr: string }

const translateBatch = async (
  items: Array<
    | { kind: "text"; node: CachedNode; original: string }
    | { kind: "attr"; target: AttrTarget; original: string }
  >,
  to: Lang,
) => {
  if (to === SOURCE_LANG) return;
  // dedupe original strings for the network call
  const needing: string[] = [];
  const map = new Map<string, number>();
  for (const it of items) {
    const k = key(SOURCE_LANG, to, it.original);
    if (cache[k] !== undefined) continue;
    if (!map.has(it.original)) {
      map.set(it.original, needing.length);
      needing.push(it.original);
    }
  }

  if (needing.length > 0) {
    for (const batch of chunk(needing, 40)) {
      // eslint-disable-next-line no-await-in-loop
      const translated = await requestTranslation(batch, SOURCE_LANG, to);
      batch.forEach((src, i) => {
        cache[key(SOURCE_LANG, to, src)] = translated[i] ?? src;
      });
    }
    saveCache();
  }

  for (const it of items) {
    const translated = cache[key(SOURCE_LANG, to, it.original)] ?? it.original;
    if (it.kind === "text") {
      // preserve leading/trailing whitespace
      const raw = it.node.nodeValue ?? "";
      const leading = raw.match(/^\s*/)?.[0] ?? "";
      const trailing = raw.match(/\s*$/)?.[0] ?? "";
      it.node.nodeValue = leading + translated + trailing;
    } else {
      it.target.el.setAttribute(it.target.attr, translated);
    }
  }
};

const rememberOriginals = (nodes: CachedNode[]) => {
  for (const n of nodes) {
    if (n[ORIGINAL] === undefined) n[ORIGINAL] = (n.nodeValue ?? "").trim();
  }
};

const rememberAttrOriginals = (targets: AttrTarget[]) => {
  for (const t of targets) {
    const store = `data-i18n-orig-${t.attr}`;
    if (!t.el.hasAttribute(store)) {
      t.el.setAttribute(store, t.el.getAttribute(t.attr) ?? "");
    }
  }
};

const restoreOriginals = (root: Node) => {
  for (const node of collectTextNodes(root)) {
    const original = (node as CachedNode)[ORIGINAL];
    if (original !== undefined) {
      const raw = node.nodeValue ?? "";
      const leading = raw.match(/^\s*/)?.[0] ?? "";
      const trailing = raw.match(/\s*$/)?.[0] ?? "";
      node.nodeValue = leading + original + trailing;
    }
  }
  const scope = root.nodeType === Node.DOCUMENT_NODE
    ? (root as Document).body
    : (root as Element);
  if (scope && "querySelectorAll" in scope) {
    ["placeholder", "title", "aria-label", "alt"].forEach((attr) => {
      scope.querySelectorAll<HTMLElement>(`[data-i18n-orig-${attr}]`).forEach((el) => {
        const orig = el.getAttribute(`data-i18n-orig-${attr}`) ?? "";
        el.setAttribute(attr, orig);
      });
    });
  }
};

let currentLang: Lang = SOURCE_LANG;
let observer: MutationObserver | null = null;
let pending: Set<Node> = new Set();
let flushTimer: number | null = null;

const flush = async () => {
  flushTimer = null;
  const roots = Array.from(pending);
  pending = new Set();

  const textNodes: CachedNode[] = [];
  const attrTargets: AttrTarget[] = [];
  for (const r of roots) {
    if (!r.isConnected) continue;
    textNodes.push(...collectTextNodes(r));
    attrTargets.push(...collectAttrTargets(r));
  }
  if (textNodes.length === 0 && attrTargets.length === 0) return;

  rememberOriginals(textNodes);
  rememberAttrOriginals(attrTargets);

  if (currentLang === SOURCE_LANG) return;

  const items: Parameters<typeof translateBatch>[0] = [
    ...textNodes.map((n) => ({
      kind: "text" as const,
      node: n,
      original: (n[ORIGINAL] ?? n.nodeValue ?? "").trim(),
    })),
    ...attrTargets.map((t) => ({
      kind: "attr" as const,
      target: t,
      original: (t.el.getAttribute(`data-i18n-orig-${t.attr}`) ?? "").trim(),
    })),
  ].filter((i) => i.original.length > 0);

  await translateBatch(items, currentLang);
};

const schedule = (root: Node) => {
  pending.add(root);
  if (flushTimer !== null) return;
  flushTimer = window.setTimeout(flush, 120);
};

const startObserver = () => {
  if (observer) return;
  observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "childList") {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.TEXT_NODE) {
            schedule(n);
          }
        });
      } else if (m.type === "characterData" && m.target.nodeType === Node.TEXT_NODE) {
        // text mutated by React — re-store original & re-translate
        const node = m.target as CachedNode;
        // if we changed it ourselves, ignore
        const trimmed = (node.nodeValue ?? "").trim();
        const already = currentLang !== SOURCE_LANG && cache[key(SOURCE_LANG, currentLang, node[ORIGINAL] ?? "")] === trimmed;
        if (already) continue;
        node[ORIGINAL] = trimmed;
        if (node.parentNode) schedule(node.parentNode);
      } else if (m.type === "attributes" && m.target.nodeType === Node.ELEMENT_NODE) {
        schedule(m.target);
      }
    }
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["placeholder", "title", "aria-label", "alt"],
  });
};

export const setAutoTranslateLanguage = async (lang: Lang) => {
  currentLang = lang;
  if (lang === SOURCE_LANG) {
    restoreOriginals(document);
    return;
  }
  schedule(document.body);
};

export const initAutoTranslate = (initial: Lang) => {
  currentLang = initial;
  const boot = () => {
    startObserver();
    if (currentLang !== SOURCE_LANG) schedule(document.body);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
};
