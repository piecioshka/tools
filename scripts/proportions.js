(function (d) {
    function calc(x, y, z) {
        return (y * z) / x;
    }

    function compile($x, $y, $z) {
        const x = Number($x.value) || 0;
        const y = Number($y.value) || 0;
        const z = Number($z.value) || 0;
        return calc(x, y, z) || 0;
    }

    function main() {
        const $x = document.querySelector(".x");
        const $y = document.querySelector(".y");
        const $z = document.querySelector(".z");
        const $q = document.querySelector(".q");

        function render() {
            const result = compile($x, $y, $z);
            $q.value = result;
        }

        [$x, $y, $z].forEach(($input) => {
            $input.addEventListener("change", () => {
                render();
            });
            $input.addEventListener("focus", () => {
                $input.select();
            });
        });
    }

    d.addEventListener("DOMContentLoaded", main);
})(document);
