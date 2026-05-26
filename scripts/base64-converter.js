(function (d) {
    function main() {
        setupComponent({
            input: "#text-base64-input",
            output: "#text-base64-output",
            button: "#text-base64-convert",
            convert: btoa,
        });
        setupComponent({
            input: "#base64-text-input",
            output: "#base64-text-output",
            button: "#base64-text-convert",
            convert: atob,
        });
    }

    d.addEventListener("DOMContentLoaded", main);
})(document);
