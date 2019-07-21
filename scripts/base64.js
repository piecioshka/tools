function setupComponent({ input, output, button }) {
    const $input = document.querySelector(input);
    const $output = document.querySelector(output);
    const $button = document.querySelector(button);

    $button.addEventListener('click', () => {
        $output.value = btoa($input.value);
    });
}

function main() {
    setupComponent({
        input: '#text-base64-input',
        output: '#text-base64-output',
        button: '#text-base64-convert'
    });
}

main();
