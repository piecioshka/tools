(function (d, w, KEY) {
    const SAMPLE = [
        "# Hello Markdown",
        "",
        "Type in the **visual editor** or in the *Markdown* source - both stay in sync.",
        "",
        "- Lists with `inline code`",
        "- [Links](https://piecioshka.github.io/tools/)",
        "",
        "> Quotes work too.",
    ].join("\n");

    const SAFE_URL = /^(https?:|mailto:|#|\/|\.\/|\.\.\/)/i;
    const ESCAPABLE = /\\([\\`*_{}[\]()#+\-.!~>|])/g;

    // ---------- Markdown -> HTML ----------

    function escapeHtml(text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function safeUrl(url) {
        const trimmed = url.trim();
        return SAFE_URL.test(trimmed) || !/^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : "#";
    }

    function renderInline(text) {
        const tokens = [];
        const keep = (html) => `\u0000${tokens.push(html) - 1}\u0000`;

        let out = text
            .replace(ESCAPABLE, (_, char) => keep(escapeHtml(char)))
            .replace(/`([^`]+)`/g, (_, code) => keep(`<code>${escapeHtml(code)}</code>`));

        out = escapeHtml(out)
            .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => keep(`<img src="${safeUrl(src)}" alt="${alt}">`))
            .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => `<a href="${safeUrl(href)}">${label}</a>`)
            .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
            .replace(/__([^_]+)__/g, "<strong>$1</strong>")
            .replace(/\*([^*]+)\*/g, "<em>$1</em>")
            .replace(/\b_([^_]+)_\b/g, "<em>$1</em>")
            .replace(/~~([^~]+)~~/g, "<del>$1</del>");

        return out.replace(/\u0000(\d+)\u0000/g, (_, i) => tokens[Number(i)]);
    }

    const LIST_ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;

    function parseList(lines, start) {
        const ordered = /\d/.test(LIST_ITEM.exec(lines[start])[2]);
        const items = [];
        let i = start;

        while (i < lines.length) {
            const match = LIST_ITEM.exec(lines[i]);
            if (!match || match[1].length > 0) break;
            const body = [match[3]];
            i++;
            while (i < lines.length && /^\s{2,}\S/.test(lines[i])) {
                body.push(lines[i].replace(/^\s{2,4}/, ""));
                i++;
            }
            items.push(body);
        }

        const html = items
            .map((body) => {
                const [first, ...rest] = body;
                const nested = rest.length ? renderBlocks(rest) : "";
                return `<li>${renderInline(first)}${nested}</li>`;
            })
            .join("");

        const tag = ordered ? "ol" : "ul";
        return { html: `<${tag}>${html}</${tag}>`, next: i };
    }

    function isBlockStart(line) {
        return /^(#{1,6}\s|>|```|(-{3,}|\*{3,}|_{3,})\s*$)/.test(line) || LIST_ITEM.test(line);
    }

    function renderBlocks(lines) {
        const out = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];

            if (!line.trim()) {
                i++;
                continue;
            }

            if (line.startsWith("```")) {
                const code = [];
                i++;
                while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
                i++;
                out.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
                continue;
            }

            const heading = /^(#{1,6})\s+(.*)$/.exec(line);
            if (heading) {
                const level = heading[1].length;
                out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
                i++;
                continue;
            }

            if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
                out.push("<hr>");
                i++;
                continue;
            }

            if (line.startsWith(">")) {
                const quote = [];
                while (i < lines.length && lines[i].startsWith(">")) quote.push(lines[i++].replace(/^>\s?/, ""));
                out.push(`<blockquote>${renderBlocks(quote)}</blockquote>`);
                continue;
            }

            if (LIST_ITEM.test(line)) {
                const list = parseList(lines, i);
                out.push(list.html);
                i = list.next;
                continue;
            }

            const paragraph = [];
            while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) paragraph.push(lines[i++]);
            out.push(`<p>${paragraph.map(renderInline).join("<br>")}</p>`);
        }

        return out.join("");
    }

    function markdownToHtml(markdown) {
        return renderBlocks(markdown.replace(/\r\n?/g, "\n").split("\n"));
    }

    // ---------- HTML -> Markdown ----------

    const BLOCK_TAGS = new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "BLOCKQUOTE", "PRE", "HR"]);

    function escapeMarkdown(text) {
        return text.replace(/([\\`*_[\]~])/g, "\\$1");
    }

    function wrap(marker, content) {
        const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(content);
        if (!match || !match[2]) return content;
        return `${match[1]}${marker}${match[2]}${marker}${match[3]}`;
    }

    function inlineToMarkdown(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            return escapeMarkdown((node.textContent || "").replace(/ /g, " ").replace(/\s*\n\s*/g, " "));
        }
        if (!(node instanceof HTMLElement)) return "";

        const children = () => Array.from(node.childNodes).map(inlineToMarkdown).join("");

        switch (node.tagName) {
            case "BR":
                return "\n";
            case "B":
            case "STRONG":
                return wrap("**", children());
            case "I":
            case "EM":
                return wrap("*", children());
            case "S":
            case "STRIKE":
            case "DEL":
                return wrap("~~", children());
            case "CODE":
                return node.textContent ? `\`${node.textContent}\`` : "";
            case "A": {
                const href = node.getAttribute("href") || "";
                const label = children();
                return href ? `[${label}](${href})` : label;
            }
            case "IMG":
                return `![${node.getAttribute("alt") || ""}](${node.getAttribute("src") || ""})`;
            default:
                return children();
        }
    }

    function indent(text, prefix) {
        return text
            .split("\n")
            .map((line) => (line ? prefix + line : line))
            .join("\n");
    }

    function listToMarkdown(list) {
        const ordered = list.tagName === "OL";
        return Array.from(list.children)
            .filter((item) => item.tagName === "LI")
            .map((item, index) => {
                const marker = ordered ? `${index + 1}. ` : "- ";
                const body = blocksToMarkdown(item, "\n");
                const [first = "", ...rest] = body.split("\n");
                const tail = rest.length ? "\n" + indent(rest.join("\n"), " ".repeat(marker.length)) : "";
                return marker + first + tail;
            })
            .join("\n");
    }

    function blockToMarkdown(node) {
        switch (node.tagName) {
            case "H1":
            case "H2":
            case "H3":
            case "H4":
            case "H5":
            case "H6":
                return "#".repeat(Number(node.tagName[1])) + " " + inlineToMarkdown(node).replace(/\n/g, " ").trim();
            case "UL":
            case "OL":
                return listToMarkdown(node);
            case "BLOCKQUOTE":
                return blocksToMarkdown(node)
                    .split("\n")
                    .map((line) => (line ? `> ${line}` : ">"))
                    .join("\n");
            case "PRE":
                return "```\n" + (node.textContent || "").replace(/\n$/, "") + "\n```";
            case "HR":
                return "---";
            default:
                return blocksToMarkdown(node);
        }
    }

    function blocksToMarkdown(container, separator = "\n\n") {
        const blocks = [];
        let inline = "";

        const flush = () => {
            const text = inline.replace(/[ \t]+\n/g, "\n").trim();
            if (text) blocks.push(text);
            inline = "";
        };

        container.childNodes.forEach((child) => {
            if (child instanceof HTMLElement && BLOCK_TAGS.has(child.tagName)) {
                flush();
                const block = blockToMarkdown(child);
                if (block.trim()) blocks.push(block);
            } else {
                inline += inlineToMarkdown(child);
            }
        });
        flush();

        return blocks.join(separator);
    }

    function htmlToMarkdown(root) {
        return blocksToMarkdown(root).replace(/\n{3,}/g, "\n\n");
    }

    // ---------- Storage ----------

    function save(markdown) {
        try {
            localStorage.setItem(KEY, markdown);
        } catch (err) {
            // Storage unavailable (private mode, quota) - editing still works.
        }
    }

    function restore() {
        try {
            return localStorage.getItem(KEY);
        } catch (err) {
            return null;
        }
    }

    // ---------- UI ----------

    function sanitizeHtml(html) {
        const template = d.createElement("template");
        template.innerHTML = html;
        return markdownToHtml(htmlToMarkdown(template.content));
    }

    function main() {
        const $editor = d.querySelector("#markdown-editor-visual");
        const $source = d.querySelector("#markdown-editor-source");
        const $toolbar = d.querySelector("#markdown-editor .markdown-editor-toolbar");
        const $copy = d.querySelector("#markdown-editor-copy");

        if (!($editor instanceof HTMLElement)) return;
        if (!($source instanceof HTMLTextAreaElement)) return;
        if (!($toolbar instanceof HTMLElement)) return;

        const $buttons = Array.from($toolbar.querySelectorAll("button[data-command]"));

        d.execCommand("defaultParagraphSeparator", false, "p");

        function syncFromEditor() {
            $source.value = htmlToMarkdown($editor);
            save($source.value);
        }

        function syncFromSource() {
            $editor.innerHTML = markdownToHtml($source.value);
            save($source.value);
        }

        function refreshToolbarState() {
            const selection = d.getSelection();
            const inEditor = Boolean(selection && $editor.contains(selection.anchorNode));
            $buttons.forEach(($button) => {
                const command = $button.dataset.command || "";
                if (!["bold", "italic", "strikeThrough"].includes(command)) return;
                $button.setAttribute("aria-pressed", String(inEditor && d.queryCommandState(command)));
            });
        }

        function insertInlineCode() {
            const selection = d.getSelection();
            const text = selection ? selection.toString() : "";
            d.execCommand("insertHTML", false, `<code>${escapeHtml(text || "code")}</code>`);
        }

        function insertLink() {
            const url = w.prompt("Link URL", "https://");
            if (!url) return;
            d.execCommand("createLink", false, safeUrl(url));
        }

        function runCommand(command, value) {
            $editor.focus();
            if (command === "code") insertInlineCode();
            else if (command === "link") insertLink();
            else if (command === "formatBlock") d.execCommand(command, false, `<${value}>`);
            else d.execCommand(command, false);
            syncFromEditor();
            refreshToolbarState();
        }

        $buttons.forEach(($button) => {
            // Keep the selection inside the editor while clicking toolbar buttons.
            $button.addEventListener("mousedown", (event) => event.preventDefault());
            $button.addEventListener("click", () => {
                runCommand($button.dataset.command || "", $button.dataset.value);
            });
        });

        $editor.addEventListener("input", syncFromEditor);
        $editor.addEventListener("paste", (event) => {
            const data = event.clipboardData;
            if (!data) return;
            event.preventDefault();
            const html = data.getData("text/html");
            const content = html
                ? sanitizeHtml(html)
                : markdownToHtml(data.getData("text/plain")).replace(/^<p>([\s\S]*)<\/p>$/, "$1");
            d.execCommand("insertHTML", false, content);
        });

        $source.addEventListener("input", syncFromSource);
        d.addEventListener("selectionchange", refreshToolbarState);

        if ($copy instanceof HTMLButtonElement) {
            $copy.addEventListener("click", async () => {
                await navigator.clipboard.writeText($source.value);
                $copy.textContent = "Copied!";
                setTimeout(() => {
                    $copy.textContent = "Copy Markdown";
                }, 1500);
            });
        }

        const saved = restore();
        $source.value = saved === null ? SAMPLE : saved;
        syncFromSource();
    }

    d.addEventListener("DOMContentLoaded", main);
})(document, window, "tools:markdown-editor");
