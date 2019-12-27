(function (d) {

    function slugify(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }

    function main() {
        const $slug = d.querySelector('#slugify-slug');
        const $input = d.querySelector('#slugify-input');
        const $output = d.querySelector('#slugify-output');

        $slug.addEventListener('click', () => {
            const input = $input.value;

            const output = slugify(input);

            $output.value = output;
            $output.select();
        });
    }

    d.addEventListener('DOMContentLoaded', main);

})(document);
