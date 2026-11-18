(function (d) {
    // Numbers at or above this are treated as milliseconds (1e11 s is year 5138).
    const MS_THRESHOLD = 1e11;

    const pad = (value, size = 2) => String(value).padStart(size, "0");

    function formatDate(date, utc) {
        const get = (local, universal) => (utc ? date[universal]() : date[local]());
        const year = get("getFullYear", "getUTCFullYear");
        const month = pad(get("getMonth", "getUTCMonth") + 1);
        const day = pad(get("getDate", "getUTCDate"));
        const hours = pad(get("getHours", "getUTCHours"));
        const minutes = pad(get("getMinutes", "getUTCMinutes"));
        const seconds = pad(get("getSeconds", "getUTCSeconds"));
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    function formatOffset(date) {
        const offset = -date.getTimezoneOffset();
        const sign = offset >= 0 ? "+" : "-";
        const abs = Math.abs(offset);
        return `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
    }

    const UNITS = [
        ["year", 365 * 24 * 3600],
        ["month", 30 * 24 * 3600],
        ["day", 24 * 3600],
        ["hour", 3600],
        ["minute", 60],
        ["second", 1],
    ];

    function formatRelative(date) {
        const diff = (date.getTime() - Date.now()) / 1000;
        const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
        const [unit, size] = UNITS.find(([, seconds]) => Math.abs(diff) >= seconds) ?? UNITS[UNITS.length - 1];
        return formatter.format(Math.round(diff / size), unit);
    }

    /** @returns {{ date: Date, detected: string } | null} */
    function parseInput(raw) {
        const value = raw.trim();
        if (!value) return null;

        if (/^-?\d+(\.\d+)?$/.test(value)) {
            const number = Number(value);
            const isMs = Math.abs(number) >= MS_THRESHOLD;
            return {
                date: new Date(isMs ? number : number * 1000),
                detected: isMs ? "Unix timestamp in milliseconds" : "Unix timestamp in seconds",
            };
        }

        // "YYYY-MM-DD HH:mm" is not parsed by every engine, so normalize the separator.
        const normalized = value.replace(/^(\d{4}-\d{2}-\d{2}) (\d)/, "$1T$2");
        const time = Date.parse(normalized);
        if (Number.isNaN(time)) return null;
        const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
        return { date: new Date(time), detected: isDateOnly ? "Date (interpreted as UTC midnight)" : "Date string" };
    }

    function main() {
        const $input = d.querySelector("#timestamp-input");
        const $now = d.querySelector("#timestamp-now");
        const $status = d.querySelector("#timestamp-status");
        const $table = d.querySelector("#timestamp-table");

        if (!($input instanceof HTMLInputElement)) return;
        if (!($status instanceof HTMLElement)) return;
        if (!($table instanceof HTMLTableElement)) return;

        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const $values = new Map(
            Array.from($table.querySelectorAll("[data-timestamp-value]")).map(($cell) => [
                $cell.getAttribute("data-timestamp-value"),
                $cell,
            ]),
        );

        function setValue(key, value) {
            const $cell = $values.get(key);
            if ($cell) $cell.textContent = value;
        }

        function update() {
            const parsed = parseInput($input.value);
            const isValid = Boolean(parsed && !Number.isNaN(parsed.date.getTime()));

            $status.classList.toggle("is-error", Boolean($input.value.trim()) && !isValid);
            $table.classList.toggle("is-hidden", !isValid);

            if (!parsed || !isValid) {
                $status.textContent = $input.value.trim() ? "Unrecognized date or timestamp." : "";
                return;
            }

            const { date, detected } = parsed;
            $status.textContent = `Detected: ${detected}.`;
            setValue("seconds", String(Math.floor(date.getTime() / 1000)));
            setValue("milliseconds", String(date.getTime()));
            setValue("utc", formatDate(date, true));
            setValue("local", `${formatDate(date, false)} (${timeZone}, UTC${formatOffset(date)})`);
            setValue("iso", date.toISOString());
            setValue("relative", formatRelative(date));
        }

        $table.querySelectorAll("[data-timestamp-copy]").forEach(($button) => {
            const key = $button.getAttribute("data-timestamp-copy");
            setupCopyButton($button, () => $values.get(key)?.textContent ?? "");
        });

        if ($now instanceof HTMLButtonElement) {
            $now.addEventListener("click", () => {
                $input.value = String(Math.floor(Date.now() / 1000));
                update();
            });
        }

        $input.addEventListener("input", update);
        $input.value = String(Math.floor(Date.now() / 1000));
        update();
    }

    d.addEventListener("DOMContentLoaded", main);
})(document);
