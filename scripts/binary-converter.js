(function (d) {

    function setupComponent({ input, output, button, convert }) {
        const $input = document.querySelector(input);
        const $output = document.querySelector(output);
        const $button = document.querySelector(button);

        $button.addEventListener('click', () => {
            $output.value = convert($input.value);
            $output.select();
        });

        $output.addEventListener('click', () => {
            $output.selectionStart = 0;
            $output.selectionEnd = $output.value.length;
        });

        $output.addEventListener('keydown', (evt) => {
            if (evt.metaKey) return;
            if (evt.ctrlKey) return;
            evt.preventDefault();
        });
    }

    function main() {
        setupComponent({
            input: '#text-binary-input',
            output: '#text-binary-output',
            button: '#text-binary-convert',
            convert: (data) => data.trim()
                .split('')
                .map(char => char.charCodeAt(0).toString(2))
                .join('')
        });
        setupComponent({
            input: '#binary-text-input',
            output: '#binary-text-output',
            button: '#binary-text-convert',
            convert: (data) => data.trim()
                .split(/([0,1]{8})/g)
                .filter(x => x.length)
                .map(group => String.fromCharCode(parseInt(group, 2)))
                .join('')
        });
    }

    d.addEventListener('DOMContentLoaded', main);

}(document));
