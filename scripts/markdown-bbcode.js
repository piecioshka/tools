(function (d, w) {
    function main() {
        const $input = d.querySelector("#markdown-bbcode-input");
        const $output = d.querySelector("#markdown-bbcode-output");
        const $style = d.querySelector("#markdown-bbcode-style");
        const $keepH1 = d.querySelector("#markdown-bbcode-keep-h1");

        if (!($input instanceof HTMLTextAreaElement)) return;
        if (!($output instanceof HTMLTextAreaElement)) return;
        if (!($style instanceof HTMLSelectElement)) return;
        if (!($keepH1 instanceof HTMLInputElement)) return;
        if (typeof w.convertMarkdownToBBCode !== "function") return;

        function update() {
            const style = $style.value;
            $keepH1.disabled = style !== "pinecoders";
            $output.value = $input.value
                ? w.convertMarkdownToBBCode($input.value, { style, keepH1: style !== "pinecoders" || $keepH1.checked })
                : "";
        }

        $input.addEventListener("input", update);
        $style.addEventListener("change", update);
        $keepH1.addEventListener("change", update);
        setupCopyButton(d.querySelector("#markdown-bbcode-copy"), () => $output.value);
        update();
    }

    d.addEventListener("DOMContentLoaded", main);
})(document, window);
