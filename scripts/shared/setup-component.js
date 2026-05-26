/**
 * @typedef {Object} SetupOptions
 * @property {string} input
 * @property {string} output
 * @property {string} button
 * @property {(data: string) => string} convert
 */

/** @param {SetupOptions} opts */
function setupComponent(opts) {
    const $input = document.querySelector(opts.input);
    const $output = document.querySelector(opts.output);
    const $button = document.querySelector(opts.button);

    if (!($input instanceof HTMLTextAreaElement)) return;
    if (!($output instanceof HTMLTextAreaElement)) return;
    if (!($button instanceof HTMLButtonElement)) return;

    $button.addEventListener("click", () => {
        try {
            $output.value = opts.convert($input.value);
        } catch (err) {
            $output.value = "";
            throw err;
        }
        $output.select();
    });

    $output.addEventListener("click", () => {
        $output.select();
    });
}
