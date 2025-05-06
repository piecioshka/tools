(function (d) {
    function main() {
        /**
         * @type {HTMLInputElement|null}
         */
        const $from = document.querySelector(".date-diff-from");
        /**
         * @type {HTMLInputElement|null}
         */
        const $to = document.querySelector(".date-diff-to");
        const $calculate = document.querySelector(".date-diff-calculate");
        /**
         * @type {HTMLInputElement|null}
         */
        const $output = document.querySelector(".date-diff-text-output");

        function isValidDate(dateString) {
            const date = new Date(dateString);
            return !isNaN(date.getTime());
        }

        function calculate() {
            if (!$from?.value || !$to?.value || !isValidDate($from.value) || !isValidDate($to.value)) {
                return NaN; // Return NaN if inputs are invalid
            }
            const from = new Date($from.value).getTime();
            const to = new Date($to.value).getTime();
            const diffTime = Math.abs(to - from);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        }

        function output(days) {
            if ($output) {
                $output.value = `${days} days`;
            }
        }

        function render() {
            output(calculate());
        }

        $calculate?.addEventListener("click", render);
        $from?.addEventListener("change", render);
        $to?.addEventListener("change", render);
        render();
    }

    d.addEventListener("DOMContentLoaded", main);
})(document);
