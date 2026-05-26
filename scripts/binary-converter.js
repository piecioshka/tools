(function (d) {
    function main() {
        setupComponent({
            input: "#text-binary-input",
            output: "#text-binary-output",
            button: "#text-binary-convert",
            convert: (data) =>
                data
                    .trim()
                    .split("")
                    .map((char) =>
                        "00".concat(char.charCodeAt(0).toString(2)).slice(-8)
                    )
                    .join(""),
        });
        setupComponent({
            input: "#binary-text-input",
            output: "#binary-text-output",
            button: "#binary-text-convert",
            convert: (data) =>
                data
                    .trim()
                    .split(/([01]{8})/g)
                    .filter((x) => x.length)
                    .map((group) => String.fromCharCode(parseInt(group, 2)))
                    .join(""),
        });
    }

    d.addEventListener("DOMContentLoaded", main);
})(document);
