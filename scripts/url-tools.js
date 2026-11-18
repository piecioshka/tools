(function (d) {
    function setupEncoder() {
        const $input = d.querySelector("#url-encode-input");
        const $output = d.querySelector("#url-encode-output");
        const $encode = d.querySelector("#url-encode");
        const $decode = d.querySelector("#url-decode");
        const $whole = d.querySelector("#url-encode-whole");
        const $plus = d.querySelector("#url-encode-plus");

        if (!($input instanceof HTMLTextAreaElement)) return;
        if (!($output instanceof HTMLTextAreaElement)) return;
        if (!($whole instanceof HTMLInputElement) || !($plus instanceof HTMLInputElement)) return;

        function run(convert) {
            try {
                $output.value = convert($input.value);
            } catch (err) {
                $output.value = "";
                throw err;
            }
        }

        $encode?.addEventListener("click", () => {
            run((value) => ($whole.checked ? encodeURI(value) : encodeURIComponent(value)));
        });

        $decode?.addEventListener("click", () => {
            run((value) => {
                const prepared = $plus.checked ? value.replace(/\+/g, " ") : value;
                return $whole.checked ? decodeURI(prepared) : decodeURIComponent(prepared);
            });
        });

        setupCopyButton(d.querySelector("#url-encode-copy"), () => $output.value);
    }

    function setupParser() {
        const $input = d.querySelector("#url-parser-input");
        const $status = d.querySelector("#url-parser-status");
        const $parts = d.querySelector("#url-parser-parts");
        const $params = d.querySelector("#url-parser-params");
        const $add = d.querySelector("#url-parser-add");
        const $output = d.querySelector("#url-parser-output");

        if (!($input instanceof HTMLInputElement)) return;
        if (!($status instanceof HTMLElement)) return;
        if (!($parts instanceof HTMLTableElement) || !($params instanceof HTMLTableElement)) return;
        if (!($output instanceof HTMLTextAreaElement)) return;

        const $paramsBody = $params.tBodies[0];
        /** @type {URL | null} */
        let current = null;

        function rebuild() {
            if (!current) return;
            const search = new URLSearchParams();
            Array.from($paramsBody.rows).forEach(($row) => {
                const [$key, $value] = Array.from($row.querySelectorAll("input"));
                if ($key.value) search.append($key.value, $value.value);
            });
            const url = new URL(current.href);
            url.search = search.toString();
            $output.value = url.href;
        }

        function textInput(value, label) {
            const $field = d.createElement("input");
            $field.type = "text";
            $field.value = value;
            $field.setAttribute("aria-label", label);
            $field.addEventListener("input", rebuild);
            return $field;
        }

        function addParamRow(key, value) {
            const $row = $paramsBody.insertRow();
            $row.insertCell().append(textInput(key, "Parameter name"));
            $row.insertCell().append(textInput(value, "Parameter value"));
            const $remove = d.createElement("button");
            $remove.type = "button";
            $remove.className = "small-button";
            $remove.textContent = "Remove";
            $remove.addEventListener("click", () => {
                $row.remove();
                rebuild();
            });
            $row.insertCell().append($remove);
            return $row;
        }

        function renderParts(url) {
            const parts = [
                ["Protocol", url.protocol],
                ["Username", url.username],
                ["Password", url.password],
                ["Host", url.hostname],
                ["Port", url.port],
                ["Path", decodeURIComponent(url.pathname)],
                ["Query", url.search],
                ["Hash", url.hash],
            ].filter(([, value]) => value);

            $parts.tBodies[0].replaceChildren(
                ...parts.map(([name, value]) => {
                    const $row = d.createElement("tr");
                    const $name = d.createElement("th");
                    $name.scope = "row";
                    $name.textContent = name;
                    const $value = d.createElement("td");
                    const $code = d.createElement("code");
                    $code.textContent = value;
                    $value.append($code);
                    $row.append($name, $value);
                    return $row;
                }),
            );
        }

        function parse() {
            const value = $input.value.trim();
            $paramsBody.replaceChildren();
            current = null;

            try {
                current = value ? new URL(value) : null;
            } catch (err) {
                current = null;
            }

            const isError = Boolean(value) && !current;
            $status.textContent = isError ? "Invalid URL. Include the protocol, e.g. https://" : "";
            $status.classList.toggle("is-error", isError);
            [$parts, $params].forEach(($table) => $table.classList.toggle("is-hidden", !current));
            $add?.classList.toggle("is-hidden", !current);

            if (!current) {
                $output.value = "";
                return;
            }

            renderParts(current);
            current.searchParams.forEach((paramValue, key) => addParamRow(key, paramValue));
            rebuild();
        }

        $add?.addEventListener("click", () => {
            const $row = addParamRow("", "");
            $row.querySelector("input")?.focus();
        });

        $input.addEventListener("input", parse);
        setupCopyButton(d.querySelector("#url-parser-copy"), () => $output.value);
        parse();
    }

    function main() {
        setupEncoder();
        setupParser();
    }

    d.addEventListener("DOMContentLoaded", main);
})(document);
