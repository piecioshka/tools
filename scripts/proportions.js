(function (d) {
    function calc(x, y, z) {
        if (x === 0) return 0;
        return (y * z) / x;
    }

    function gcd(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b !== 0) {
            [a, b] = [b, a % b];
        }
        return a || 1;
    }

    function formatRatio(a, b) {
        if (!Number.isFinite(a) || !Number.isFinite(b)) return "Ratio: —";
        if (a === 0 && b === 0) return "Ratio: 0 : 0";
        if (b === 0) return "Ratio: 1 : 0";

        let ratio;
        if (Number.isInteger(a) && Number.isInteger(b)) {
            if (a === 0) {
                ratio = "0 : 1";
            } else {
                const divisor = gcd(a, b);
                ratio = `${a / divisor} : ${b / divisor}`;
            }
        } else {
            const k = Number((a / b).toFixed(4));
            ratio = `${k} : 1`;
        }

        const division = Number((a / b).toFixed(4));
        return `Ratio: ${ratio} (${division})`;
    }

    function main() {
        const $x = document.querySelector(".x");
        const $y = document.querySelector(".y");
        const $z = document.querySelector(".z");
        const $q = document.querySelector(".q");
        const $ratioLeft = document.querySelector(".ratio-left");
        const $ratioRight = document.querySelector(".ratio-right");

        if (!($x instanceof HTMLInputElement)) return;
        if (!($y instanceof HTMLInputElement)) return;
        if (!($z instanceof HTMLInputElement)) return;
        if (!($q instanceof HTMLInputElement)) return;
        if (!$ratioLeft || !$ratioRight) return;

        function render() {
            const x = Number($x.value) || 0;
            const y = Number($y.value) || 0;
            const z = Number($z.value) || 0;
            const q = calc(x, y, z);
            $q.value = String(q);
            $ratioLeft.textContent = formatRatio(x, y);
            $ratioRight.textContent = formatRatio(z, q);
        }

        [$x, $y, $z].forEach(($input) => {
            $input.addEventListener("input", render);
            $input.addEventListener("focus", () => {
                $input.select();
            });
        });

        render();
    }

    d.addEventListener("DOMContentLoaded", main);
})(document);
