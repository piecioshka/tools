(function (d) {
    function calc(x, y, z) {
        if (x === 0) return 0;
        return (y * z) / x;
    }

    function compile($x, $y, $z) {
        const x = Number($x.value) || 0;
        const y = Number($y.value) || 0;
        const z = Number($z.value) || 0;
        return calc(x, y, z);
    }

    function main() {
        const $x = document.querySelector(".x");
        const $y = document.querySelector(".y");
        const $z = document.querySelector(".z");
        const $q = document.querySelector(".q");

        if (!($x instanceof HTMLInputElement)) return;
        if (!($y instanceof HTMLInputElement)) return;
        if (!($z instanceof HTMLInputElement)) return;
        if (!($q instanceof HTMLInputElement)) return;

        function render() {
            $q.value = String(compile($x, $y, $z));
        }

        [$x, $y, $z].forEach(($input) => {
            $input.addEventListener("input", render);
            $input.addEventListener("focus", () => {
                $input.select();
            });
        });
    }

    d.addEventListener("DOMContentLoaded", main);
})(document);
