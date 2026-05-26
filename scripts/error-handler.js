(function (global, d) {
    const TIME_TO_HIDE_ERROR = 5000;
    let timeout = null;

    function hideError() {
        const $msg = d.querySelector(".error-message");
        if (!$msg) return;
        $msg.classList.add("hide");
    }

    function displayError(message) {
        const $msg = d.querySelector(".error-message");
        if (!$msg) return;
        $msg.classList.remove("hide");

        const $text = d.querySelector(".error-text");
        if (!$text) return;
        $text.textContent = String(message);

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(hideError, TIME_TO_HIDE_ERROR);
    }

    global.onerror = (message) => {
        console.error(message);
        displayError(message);
    };
})(window, document);
