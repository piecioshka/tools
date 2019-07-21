function setupComponent({ input, output, button, convert }) {
    const $input = document.querySelector(input);
    const $output = document.querySelector(output);
    const $button = document.querySelector(button);

    $button.addEventListener('click', () => {
        $output.value = convert($input.value);
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
        input: '#text-base64-input',
        output: '#text-base64-output',
        button: '#text-base64-convert',
        convert: btoa
    });
    setupComponent({
        input: '#base64-text-input',
        output: '#base64-text-output',
        button: '#base64-text-convert',
        convert: atob
    });
}

window.addEventListener('load', main);
