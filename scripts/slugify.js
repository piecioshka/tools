(function (d) {
    const nonDecomposable = [{ from: /ł/g, to: "l" }];

    const map = [
        { from: /\s+/g, to: "-" },
        { from: /[^\w-]+/g, to: "" },
        { from: /--+/g, to: "-" },
        { from: /^-+/, to: "" },
        { from: /-+$/, to: "" },
    ];

    function slugify(text, form) {
        let v = text
            .toLowerCase()
            .normalize(form)
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "");
        for (const { from, to } of nonDecomposable) v = v.replace(from, to);
        return map.reduce((value, { from, to }) => value.replace(from, to), v);
    }

    function main() {
        const $select = d.querySelector("#slugify-strategy");
        const $input = d.querySelector("#slugify-input");
        const $output = d.querySelector("#slugify-output");
        const $slug = d.querySelector("#slugify-slug");
        const $copy = d.querySelector("#slugify-copy");

        if (!($input instanceof HTMLTextAreaElement)) return;
        if (!$slug) return;

        function updateOutput() {
            if (!($input instanceof HTMLTextAreaElement)) return;
            if (!($output instanceof HTMLTextAreaElement)) return;
            if (!($select instanceof HTMLSelectElement)) return;
            $output.value = slugify($input.value, $select.value);
        }

        $slug.addEventListener("click", updateOutput);
        $input.addEventListener("keyup", updateOutput);
        $input.addEventListener("blur", updateOutput);

        if (!($copy instanceof HTMLButtonElement)) return;

        $copy.addEventListener("click", async () => {
            if (!($output instanceof HTMLTextAreaElement)) return;
            if (!($select instanceof HTMLSelectElement)) return;
            await navigator.clipboard.writeText($output.value);
            $copy.textContent = "Copied!";
            $output.select();
            setTimeout(() => {
                $copy.textContent = "Copy";
                $output.setSelectionRange(0, 0);
            }, 1500);
        });
    }

    d.addEventListener("DOMContentLoaded", main);
})(document);
