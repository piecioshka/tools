(function (d) {
    const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

    const LEVELS = [
        { key: "aa-normal", min: 4.5 },
        { key: "aa-large", min: 3 },
        { key: "aaa-normal", min: 7 },
        { key: "aaa-large", min: 4.5 },
        { key: "ui", min: 3 },
    ];

    /** @returns {number[] | null} */
    function parseHex(value) {
        const match = HEX.exec(value.trim());
        if (!match) return null;
        const hex = match[1].length === 3 ? match[1].replace(/./g, "$&$&") : match[1];
        return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    }

    function toHex(rgb) {
        return "#" + rgb.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("");
    }

    // Same result as CSS color-mix(in srgb, fg p%, bg).
    function mix(fg, bg, percent) {
        const p = percent / 100;
        return fg.map((channel, i) => channel * p + bg[i] * (1 - p));
    }

    function luminance(rgb) {
        const [r, g, b] = rgb.map((channel) => {
            const c = channel / 255;
            return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    function contrast(a, b) {
        const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
        return (light + 0.05) / (dark + 0.05);
    }

    function setupColorPair($picker, $text, onChange) {
        $picker.addEventListener("input", () => {
            $text.value = $picker.value;
            onChange();
        });
        $text.addEventListener("input", () => {
            const rgb = parseHex($text.value);
            $text.classList.toggle("is-invalid", !rgb);
            if (rgb) $picker.value = toHex(rgb);
            onChange();
        });
    }

    function main() {
        const $root = d.querySelector("#contrast-checker");
        const $fgPicker = d.querySelector("#contrast-fg-picker");
        const $fgText = d.querySelector("#contrast-fg");
        const $bgPicker = d.querySelector("#contrast-bg-picker");
        const $bgText = d.querySelector("#contrast-bg");
        const $tint = d.querySelector("#contrast-tint");
        const $ratio = d.querySelector("#contrast-ratio");
        const $effective = d.querySelector("#contrast-effective-bg");
        const $swap = d.querySelector("#contrast-swap");

        if (!($root instanceof HTMLElement)) return;
        if (!($fgPicker instanceof HTMLInputElement) || !($fgText instanceof HTMLInputElement)) return;
        if (!($bgPicker instanceof HTMLInputElement) || !($bgText instanceof HTMLInputElement)) return;
        if (!($tint instanceof HTMLInputElement)) return;
        if (!($ratio instanceof HTMLElement) || !($effective instanceof HTMLElement)) return;

        // Preview colors live in a constructed stylesheet instead of inline styles.
        const sheet = new CSSStyleSheet();
        d.adoptedStyleSheets = [...d.adoptedStyleSheets, sheet];

        function update() {
            const fg = parseHex($fgText.value);
            const bg = parseHex($bgText.value);
            if (!fg || !bg) {
                $ratio.textContent = "-";
                return;
            }

            const tint = Math.min(100, Math.max(0, Number($tint.value) || 0));
            const effectiveBg = mix(fg, bg, tint);
            const ratio = contrast(fg, effectiveBg);

            $ratio.textContent = `${(Math.floor(ratio * 100) / 100).toFixed(2)} : 1`;
            $effective.textContent = tint
                ? `Background: ${toHex(effectiveBg)} = color-mix(in srgb, ${toHex(fg)} ${tint}%, ${toHex(bg)})`
                : `Background: ${toHex(bg)}`;

            LEVELS.forEach(({ key, min }) => {
                const $cell = $root.querySelector(`[data-contrast-level="${key}"]`);
                if (!$cell) return;
                const pass = ratio >= min;
                $cell.textContent = pass ? "✅ Pass" : "❌ Fail";
                $cell.classList.toggle("is-fail", !pass);
            });

            sheet.replaceSync(`.contrast-preview { color: ${toHex(fg)}; background: ${toHex(effectiveBg)}; }`);
        }

        setupColorPair($fgPicker, $fgText, update);
        setupColorPair($bgPicker, $bgText, update);
        $tint.addEventListener("input", update);

        if ($swap instanceof HTMLButtonElement) {
            $swap.addEventListener("click", () => {
                [$fgText.value, $bgText.value] = [$bgText.value, $fgText.value];
                [$fgPicker.value, $bgPicker.value] = [$bgPicker.value, $fgPicker.value];
                update();
            });
        }

        update();
    }

    d.addEventListener("DOMContentLoaded", main);
})(document);
