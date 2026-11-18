(function (d) {
    const HOMOGLYPHS = {
        // Cyrillic
        а: "a", в: "b", е: "e", к: "k", м: "m", н: "h", о: "o", р: "p", с: "c", т: "t", у: "y", х: "x",
        і: "i", ј: "j", ѕ: "s", ԁ: "d", ӏ: "l", ԛ: "q", ԝ: "w",
        А: "A", В: "B", Е: "E", К: "K", М: "M", Н: "H", О: "O", Р: "P", С: "C", Т: "T", Х: "X",
        І: "I", Ј: "J", Ѕ: "S", Ү: "Y",
        // Greek
        Α: "A", Β: "B", Ε: "E", Ζ: "Z", Η: "H", Ι: "I", Κ: "K", Μ: "M", Ν: "N", Ο: "O", Ρ: "P", Τ: "T",
        Υ: "Y", Χ: "X", ο: "o", ν: "v", ρ: "p", ι: "i",
    };

    const NAMES = {
        " ": "NO-BREAK SPACE",
        "­": "SOFT HYPHEN",
        " ": "EN QUAD",
        " ": "EM QUAD",
        " ": "EN SPACE",
        " ": "EM SPACE",
        " ": "THREE-PER-EM SPACE",
        " ": "FOUR-PER-EM SPACE",
        " ": "SIX-PER-EM SPACE",
        " ": "FIGURE SPACE",
        " ": "PUNCTUATION SPACE",
        " ": "THIN SPACE",
        " ": "HAIR SPACE",
        "​": "ZERO WIDTH SPACE",
        "‌": "ZERO WIDTH NON-JOINER",
        "‍": "ZERO WIDTH JOINER",
        "‎": "LEFT-TO-RIGHT MARK",
        "‏": "RIGHT-TO-LEFT MARK",
        "‐": "HYPHEN",
        "‑": "NON-BREAKING HYPHEN",
        "‒": "FIGURE DASH",
        "–": "EN DASH",
        "—": "EM DASH",
        "―": "HORIZONTAL BAR",
        "‪": "LEFT-TO-RIGHT EMBEDDING",
        "‫": "RIGHT-TO-LEFT EMBEDDING",
        "‬": "POP DIRECTIONAL FORMATTING",
        "‭": "LEFT-TO-RIGHT OVERRIDE",
        "‮": "RIGHT-TO-LEFT OVERRIDE",
        " ": "NARROW NO-BREAK SPACE",
        " ": "MEDIUM MATHEMATICAL SPACE",
        "⁠": "WORD JOINER",
        "⁦": "LEFT-TO-RIGHT ISOLATE",
        "⁧": "RIGHT-TO-LEFT ISOLATE",
        "⁨": "FIRST STRONG ISOLATE",
        "⁩": "POP DIRECTIONAL ISOLATE",
        "−": "MINUS SIGN",
        "　": "IDEOGRAPHIC SPACE",
        "﻿": "BYTE ORDER MARK / ZERO WIDTH NO-BREAK SPACE",
    };

    /** @type {{ category: string, label: string, test: RegExp, replace: (char: string) => string }[]} */
    const RULES = [
        { category: "cyrillic", label: "Cyrillic", test: /\p{Script=Cyrillic}/u, replace: (c) => HOMOGLYPHS[c] ?? c },
        { category: "greek", label: "Greek", test: /\p{Script=Greek}/u, replace: (c) => HOMOGLYPHS[c] ?? c },
        { category: "dash", label: "Dash", test: /[‐-―−]/u, replace: () => "-" },
        { category: "space", label: "Unusual space", test: /[  -   　]/u, replace: () => " " },
        { category: "invisible", label: "Invisible", test: /[­​-‍⁠﻿]/u, replace: () => "" },
        { category: "bidi", label: "Bidi control", test: /[‎‏‪-‮⁦-⁩]/u, replace: () => "" },
        { category: "control", label: "Control", test: /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u, replace: () => "" },
    ];

    const VISIBLE_CATEGORIES = new Set(["cyrillic", "greek", "dash"]);

    function codePoint(char) {
        return "U+" + (char.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, "0");
    }

    function charName(char, rule) {
        if (NAMES[char]) return NAMES[char];
        if (rule.category === "cyrillic" || rule.category === "greek") {
            const latin = HOMOGLYPHS[char];
            return `${rule.label.toUpperCase()} LETTER` + (latin ? ` (looks like "${latin}")` : "");
        }
        return rule.label.toUpperCase();
    }

    function findRule(char) {
        return RULES.find((rule) => rule.test.test(char));
    }

    function inspect(text) {
        const findings = new Map();
        const parts = [];
        let clean = "";
        let line = 1;
        let column = 1;

        for (const char of text) {
            const rule = findRule(char);
            if (rule) {
                const replacement = rule.replace(char);
                const entry = findings.get(char) ?? { char, rule, replacement, count: 0, first: `${line}:${column}` };
                entry.count++;
                findings.set(char, entry);
                parts.push({ char, rule });
                clean += replacement;
            } else {
                parts.push({ char });
                clean += char;
            }
            if (char === "\n") {
                line++;
                column = 1;
            } else {
                column++;
            }
        }

        return { findings: Array.from(findings.values()), parts, clean };
    }

    function renderPreview($preview, parts) {
        $preview.replaceChildren();
        let buffer = "";
        const flush = () => {
            if (buffer) $preview.append(d.createTextNode(buffer));
            buffer = "";
        };

        parts.forEach(({ char, rule }) => {
            if (!rule) {
                buffer += char;
                return;
            }
            flush();
            const $mark = d.createElement("mark");
            $mark.className = `unicode-mark unicode-mark-${rule.category}`;
            $mark.title = `${codePoint(char)} ${charName(char, rule)}`;
            $mark.textContent = VISIBLE_CATEGORIES.has(rule.category) ? char : codePoint(char);
            $preview.append($mark);
        });
        flush();
    }

    function cell(content, tag = "td", className = "") {
        const $cell = d.createElement(tag);
        if (className) $cell.className = className;
        $cell.textContent = content;
        return $cell;
    }

    function codeCell(content, className = "") {
        const $cell = d.createElement("td");
        if (className) $cell.className = className;
        const $code = d.createElement("code");
        $code.textContent = content;
        $cell.append($code);
        return $cell;
    }

    function renderTable($body, findings) {
        $body.replaceChildren(
            ...findings.map(({ char, rule, replacement, count, first }) => {
                const $row = d.createElement("tr");
                const shown = VISIBLE_CATEGORIES.has(rule.category) ? char : "·";
                const replacementLabel = replacement === "" ? "(removed)" : replacement === " " ? "(space)" : replacement;
                $row.append(
                    codeCell(shown),
                    codeCell(codePoint(char), "nowrap"),
                    cell(charName(char, rule)),
                    cell(rule.label, "td", "hide-narrow"),
                    cell(String(count)),
                    cell(first, "td", "nowrap hide-narrow"),
                    codeCell(replacement === char ? "(kept)" : replacementLabel),
                );
                return $row;
            }),
        );
    }

    function main() {
        const $input = d.querySelector("#unicode-inspector-input");
        const $preview = d.querySelector("#unicode-inspector-preview");
        const $summary = d.querySelector("#unicode-inspector-summary");
        const $table = d.querySelector("#unicode-inspector-table");
        const $output = d.querySelector("#unicode-inspector-output");

        if (!($input instanceof HTMLTextAreaElement)) return;
        if (!($preview instanceof HTMLElement)) return;
        if (!($summary instanceof HTMLElement)) return;
        if (!($table instanceof HTMLTableElement)) return;
        if (!($output instanceof HTMLTextAreaElement)) return;

        const $body = $table.tBodies[0];

        function update() {
            const { findings, parts, clean } = inspect($input.value);
            const total = findings.reduce((sum, finding) => sum + finding.count, 0);

            renderPreview($preview, parts);
            renderTable($body, findings);
            $table.classList.toggle("is-hidden", findings.length === 0);
            $summary.textContent = $input.value
                ? total
                    ? `Found ${total} suspicious character(s), ${findings.length} distinct.`
                    : "No suspicious characters found."
                : "";
            $output.value = clean;
        }

        $input.addEventListener("input", update);
        setupCopyButton(d.querySelector("#unicode-inspector-copy"), () => $output.value);
        update();
    }

    d.addEventListener("DOMContentLoaded", main);
})(document);
