(function (d) {
    const map = [
        { from: /\s+/g, to: "-" },
        { from: /[^\w\-]+/g, to: "" },
        { from: /\-\-+/g, to: "-" },
        { from: /^-+/, to: "" },
        { from: /-+$/, to: "" },
    ];

    function slugify(text, form) {
        const lowerCased = text.toLowerCase().normalize(form);
        return map.reduce((value, { from, to }) => {
            return value.replace(from, to);
        }, lowerCased);
    }

    function main() {
        const $slug = d.querySelector("#slugify-slug");
        const $input = d.querySelector("#slugify-input");
        const $output = d.querySelector("#slugify-output");
        const $select = d.querySelector("#slugify-strategy");

        $slug.addEventListener("click", () => {
            const input = $input.value;
            const output = slugify(input.toString(), $select.value);

            $output.value = output;
            $output.select();
        });
    }

    d.addEventListener("DOMContentLoaded", main);
})(document);
