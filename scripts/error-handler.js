(function (global) {

    const TIME_TO_HIDE_ERROR = 5000;
    let timeout = null;

    function hideError() {
        const $msg = document.querySelector('.error-message');
        $msg.classList.add('hide');
    }

    function displayError(message) {
        const $msg = document.querySelector('.error-message');
        $msg.classList.remove('hide');

        const $text = document.querySelector('.error-text');
        $text.textContent = message;

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(hideError, TIME_TO_HIDE_ERROR);
    }

    // Object.assign(global, { displayError });

    global.onerror = (message) => {
        console.log(message);
        displayError(message);
    }

}(window));
