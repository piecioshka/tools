(function (d) {
    const nonDecomposable = [
        { from: /ł/g, to: "l" },
    ];

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
        const $slug = d.querySelector("#slugify-slug");
        const $input = d.querySelector("#slugify-input");
        const $output = d.querySelector("#slugify-output");
        const $select = d.querySelector("#slugify-strategy");

        if (!($input instanceof HTMLTextAreaElement)) return;
        if (!($output instanceof HTMLTextAreaElement)) return;
        if (!($select instanceof HTMLSelectElement)) return;
        if (!$slug) return;

        $slug.addEventListener("click", () => {
            $output.value = slugify($input.value, $select.value);
            $output.select();
        });
    }

    d.addEventListener("DOMContentLoaded", main);
})(document);
