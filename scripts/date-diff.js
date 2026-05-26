(function (d) {
    function main() {
        const $from = document.querySelector(".date-diff-from");
        const $to = document.querySelector(".date-diff-to");
        const $calculate = document.querySelector(".date-diff-calculate");
        const $output = document.querySelector(".date-diff-text-output");

        if (!($from instanceof HTMLInputElement)) return;
        if (!($to instanceof HTMLInputElement)) return;
        if (!($output instanceof HTMLInputElement)) return;

        function isValidDate(dateString) {
            const date = new Date(dateString);
            return !isNaN(date.getTime());
        }

        function calculate() {
            if (!$from.value || !$to.value || !isValidDate($from.value) || !isValidDate($to.value)) {
                return NaN;
            }
            const from = new Date($from.value).getTime();
            const to = new Date($to.value).getTime();
            const diffTime = Math.abs(to - from);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        function render() {
            const days = calculate();
            $output.value = Number.isFinite(days) ? `${days} days` : "";
        }

        $calculate?.addEventListener("click", render);
        $from.addEventListener("change", render);
        $to.addEventListener("change", render);
        render();
    }

    d.addEventListener("DOMContentLoaded", main);
})(document);
