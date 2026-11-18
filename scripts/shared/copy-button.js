/**
 * Copies the text returned by `getText` to the clipboard on click
 * and briefly confirms it on the button label.
 *
 * @param {Element | null} $button
 * @param {() => string} getText
 */
function setupCopyButton($button, getText) {
    if (!($button instanceof HTMLButtonElement)) return;
    const label = $button.textContent;

    $button.addEventListener("click", async () => {
        await navigator.clipboard.writeText(getText());
        $button.textContent = "Copied!";
        setTimeout(() => {
            $button.textContent = label;
        }, 1500);
    });
}
