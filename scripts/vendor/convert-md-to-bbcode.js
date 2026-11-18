// convert-md-to-bbcode 1.0.1 (https://github.com/piecioshka/convert-md-to-bbcode), MIT License.
// Vendored from dist/index.js; the ES module export is wrapped into a classic script exposing window.convertMarkdownToBBCode.
(function (w) {
const ABSOLUTE_URL = /^[a-z][a-z0-9+.-]*:\/\//i;
// Private-use-area character: cannot appear in reasonable Markdown input,
// so it safely marks stashed inline-code fragments during conversion.
const SENTINEL = '\uE000';
const SENTINEL_PATTERN = new RegExp(`${SENTINEL}(\\d+)${SENTINEL}`, 'g');
// Backslash-escaped Markdown punctuation; the escaped character is stashed
// like inline code so no emphasis/link pass can read it as syntax.
const ESCAPE_PATTERN = /\\([\\`*_~[\]()!])/g;
// URL inside (...) with one level of balanced parentheses, e.g. wiki links.
const URL_PART = String.raw `((?:[^()\s]|\([^()\s]*\))+)`;
const IMAGE_PATTERN = new RegExp(String.raw `!\[[^\]]*\]\(${URL_PART}[^)]*\)`, 'g');
const LINK_PATTERN = new RegExp(String.raw `\[([^\]]+)\]\(${URL_PART}[^)]*\)`, 'g');
function stashToken(stash, value) {
    stash.push(value);
    return `${SENTINEL}${stash.length - 1}${SENTINEL}`;
}
/**
 * Inline Markdown -> BBCode. Inline code is extracted first so its content
 * is never touched by the emphasis/link regexes, then restored as [b]
 * (BBCode has no inline-code tag). Backslash escapes are stashed the same
 * way, after code (escapes have no meaning inside a code span).
 */
function convertInline(text) {
    const stash = [];
    let out = text.replace(/`([^`]+)`/g, (_, code) => stashToken(stash, `[b]${code}[/b]`));
    out = out.replace(ESCAPE_PATTERN, (_, char) => stashToken(stash, char));
    out = out
        .replace(IMAGE_PATTERN, (_, url) => ABSOLUTE_URL.test(url) ? `[image]${url}[/image]` : '')
        .replace(LINK_PATTERN, (_, label, url) => ABSOLUTE_URL.test(url) ? `[url=${url}]${label}[/url]` : label)
        .replace(/!\[[^\]]*\]\(\s*\)/g, '')
        .replace(/\[([^\]]+)\]\(\s*\)/g, '$1')
        .replace(/\*\*\*([^*]+)\*\*\*/g, '[b][i]$1[/i][/b]')
        .replace(/___([^_]+)___/g, '[b][i]$1[/i][/b]')
        // The (?!marker) guards keep a lone marker out of the bold edges, so an
        // emphasis run touching the boundary ("**a *b***") nests instead of
        // producing crossed tags.
        .replace(/\*\*(?!\*)(.+?)\*\*(?!\*)/g, '[b]$1[/b]')
        .replace(/__(?!_)(.+?)__(?!_)/g, '[b]$1[/b]')
        .replace(/(^|[^\w*])\*([^*\s][^*]*?)\*(?=[^\w*]|$)/g, '$1[i]$2[/i]')
        .replace(/(^|[^\w_])_([^_\s][^_]*?)_(?=[^\w_]|$)/g, '$1[i]$2[/i]')
        .replace(/~~([^~]+)~~/g, '[s]$1[/s]');
    return out.replace(SENTINEL_PATTERN, (_, index) => String(stash[Number(index)]));
}
/**
 * Inline Markdown -> plain text, for headings: the heading is emitted inside
 * [b] already, so emphasis markers are dropped instead of converted (nested
 * tags would break once the heading text is uppercased). Code spans and
 * backslash escapes are stashed so their content survives untouched.
 */
function stripInline(text) {
    const stash = [];
    let out = text.replace(/`([^`]+)`/g, (_, code) => stashToken(stash, code));
    out = out.replace(ESCAPE_PATTERN, (_, char) => stashToken(stash, char));
    out = out
        .replace(IMAGE_PATTERN, '')
        .replace(LINK_PATTERN, '$1')
        .replace(/!\[[^\]]*\]\(\s*\)/g, '')
        .replace(/\[([^\]]+)\]\(\s*\)/g, '$1')
        .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
        .replace(/___([^_]+)___/g, '$1')
        .replace(/\*\*(?!\*)(.+?)\*\*(?!\*)/g, '$1')
        .replace(/__(?!_)(.+?)__(?!_)/g, '$1')
        .replace(/(^|[^\w*])\*([^*\s][^*]*?)\*(?=[^\w*]|$)/g, '$1$2')
        .replace(/(^|[^\w_])_([^_\s][^_]*?)_(?=[^\w_]|$)/g, '$1$2')
        .replace(/~~([^~]+)~~/g, '$1');
    return out.replace(SENTINEL_PATTERN, (_, index) => String(stash[Number(index)]));
}
function closeList(state) {
    const level = state.listStack.pop();
    if (level)
        state.out.push(`[/${level.kind.split('=')[0]}]`);
}
function closeLists(state) {
    while (state.listStack.length > 0)
        closeList(state);
}
function closeQuote(state) {
    if (state.quoteOpen) {
        state.out.push('[/quote]');
        state.quoteOpen = false;
    }
}
function closeBlocks(state) {
    closeLists(state);
    closeQuote(state);
}
/** Fenced code block -> [pine] (monospace; keeps ASCII diagrams aligned). */
function consumeFence(state, line) {
    const fence = line.match(/^\s*(```|~~~)/);
    if (!fence)
        return false;
    closeBlocks(state);
    const marker = fence[1] ?? '```';
    const block = [];
    state.i++;
    while (state.i < state.lines.length &&
        !(state.lines[state.i] ?? '').trim().startsWith(marker)) {
        block.push(state.lines[state.i] ?? '');
        state.i++;
    }
    state.out.push('[pine]', ...block, '[/pine]');
    return true;
}
/** Table -> [pine] block, verbatim (BBCode has no tables; monospace keeps columns). */
function consumeTable(state, line) {
    const isRow = (text) => /^\s*\|.*\|\s*$/.test(text);
    if (!isRow(line))
        return false;
    closeBlocks(state);
    const block = [];
    while (state.i < state.lines.length && isRow(state.lines[state.i] ?? '')) {
        const row = state.lines[state.i] ?? '';
        if (!/^\s*\|[\s:|-]+\|\s*$/.test(row))
            block.push(row);
        state.i++;
    }
    state.i--;
    state.out.push('[pine]', ...block, '[/pine]');
    return true;
}
/**
 * Heading. BBCode has no headers, so every heading becomes a plain [b] line.
 * In the "pinecoders" style H1/H2 become `█ [b]UPPERCASE[/b]` section lines
 * instead, and the first H1 is dropped unless keepH1 is set.
 */
function consumeHeading(state, line) {
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (!heading)
        return false;
    closeBlocks(state);
    const level = (heading[1] ?? '').length;
    const text = stripInline((heading[2] ?? '').trim());
    const isFirstH1 = level === 1 && !state.h1Seen;
    if (isFirstH1)
        state.h1Seen = true;
    if (isFirstH1 && !state.keepH1)
        return true;
    if (state.style === 'pinecoders' && level <= 2) {
        state.out.push(`█ [b]${text.toUpperCase()}[/b]`);
    }
    else {
        state.out.push(`[b]${text}[/b]`);
    }
    return true;
}
/** Horizontal rule -> dropped (section headers already separate content). */
function consumeRule(state, line) {
    if (!/^\s*([-*_])\s*(\1\s*){2,}$/.test(line))
        return false;
    closeBlocks(state);
    return true;
}
function consumeQuote(state, line) {
    const quote = line.match(/^\s*>\s?(.*)$/);
    if (!quote)
        return false;
    closeLists(state);
    if (!state.quoteOpen) {
        state.out.push('[quote]');
        state.quoteOpen = true;
    }
    state.out.push(convertInline(quote[1] ?? ''));
    return true;
}
/**
 * List item; nesting is preserved with nested [list] tags. Levels are
 * tracked by the indent that opened them, so any consistent indent step
 * (2, 3, 4 spaces or a tab) nests exactly one level, and siblings with the
 * same indent stay on the same level. A marker type change at the same
 * indent starts a new list, as in CommonMark.
 */
function consumeListItem(state, line) {
    const item = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
    if (!item)
        return false;
    closeQuote(state);
    const indent = (item[1] ?? '').replace(/\t/g, '  ').length;
    const kind = /^\d/.test(item[2] ?? '') ? 'list=1' : 'list';
    enterListLevel(state, kind, indent);
    state.out.push(`[*]${convertInline(item[3] ?? '')}`);
    return true;
}
/** Close levels the item dedents out of, then open a new one when needed. */
function enterListLevel(state, kind, indent) {
    while (state.listStack.length > 0 &&
        (state.listStack[state.listStack.length - 1]?.indent ?? 0) > indent) {
        closeList(state);
    }
    const top = state.listStack[state.listStack.length - 1];
    if (top && top.indent === indent && top.kind !== kind)
        closeList(state);
    const parent = state.listStack[state.listStack.length - 1];
    if (!parent || indent > parent.indent) {
        state.listStack.push({ kind, indent });
        state.out.push(`[${kind}]`);
    }
}
/** Continuation of a list item (indented text under a bullet). */
function consumeListContinuation(state, line) {
    if (state.listStack.length === 0 || !/^\s+\S/.test(line))
        return false;
    state.out.push(convertInline(line.trim()));
    return true;
}
function consumeBlank(state, line) {
    if (line.trim() !== '')
        return false;
    // A blank line inside a "loose list" (the next non-blank line is another
    // item or an indented continuation) must not split the list in two.
    if (state.listStack.length > 0) {
        let next = state.i + 1;
        while (next < state.lines.length &&
            (state.lines[next] ?? '').trim() === '') {
            next++;
        }
        const ahead = state.lines[next] ?? '';
        if (/^\s*([-*+]|\d+[.)])\s+/.test(ahead) || /^\s+\S/.test(ahead)) {
            return true;
        }
    }
    closeBlocks(state);
    state.out.push('');
    return true;
}
function consumeParagraph(state, line) {
    closeBlocks(state);
    state.out.push(convertInline(line));
    return true;
}
const HANDLERS = [
    consumeFence,
    consumeTable,
    consumeHeading,
    consumeRule,
    consumeQuote,
    consumeListItem,
    consumeListContinuation,
    consumeBlank,
    consumeParagraph,
];
/**
 * Convert a Markdown document to BBCode.
 *
 * Supported output tags:
 * [b] [i] [s] [pine] [list] [list=1] [*] [quote] [url=...] [image]
 *
 * There are no headers or tables in that dialect, so headings become plain
 * [b] lines (or `█ [b]SECTION[/b]` lines with style: "pinecoders"), fenced
 * code and tables land in [pine] blocks (monospace keeps ASCII art and
 * columns aligned), relative links degrade to their label text, and
 * horizontal rules are dropped.
 */
function convertMarkdownToBBCode(markdown, options = {}) {
    const style = options.style ?? 'plain';
    const state = {
        lines: markdown.replace(/\r\n/g, '\n').split('\n'),
        out: [],
        i: 0,
        h1Seen: false,
        listStack: [],
        quoteOpen: false,
        keepH1: options.keepH1 ?? style !== 'pinecoders',
        style,
    };
    for (state.i = 0; state.i < state.lines.length; state.i++) {
        const line = state.lines[state.i] ?? '';
        HANDLERS.some((handler) => handler(state, line));
    }
    closeBlocks(state);
    // Collapse runs of blank lines and trim the edges
    const collapsed = state.out
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^\n+|\n+$/g, '');
    return `${collapsed}\n`;
}

    w.convertMarkdownToBBCode = convertMarkdownToBBCode;
})(window);
