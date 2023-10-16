(function (d) {

    function main() {
        const $headers = [...d.querySelectorAll("h2")];

        $headers.forEach(($header) => {
            $header.addEventListener("click", () => {
                const id = $header.parentElement?.getAttribute("id");
                if (id) {
                    location.hash = id;
                }
            });
        });
    }

    d.addEventListener("DOMContentLoaded", main);
})(document);
