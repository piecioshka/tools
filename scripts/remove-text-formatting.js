(function (d, KEY) {
    function save(content) {
        try {
            localStorage.setItem(KEY, JSON.stringify(content));
        } catch (err) {
            localStorage.setItem(KEY, "");
        }
    }

    function revoke() {
        const data = localStorage.getItem(KEY);
        if (!data) return "";
        try {
            return JSON.parse(data) ?? "";
        } catch (err) {
            return "";
        }
    }

    function main() {
        const $editor = d.querySelector("#remove-text-formatting textarea");
        if (!($editor instanceof HTMLTextAreaElement)) return;
        $editor.addEventListener("input", () => {
            save($editor.value);
        });
        $editor.value = revoke();
    }

    d.addEventListener("DOMContentLoaded", main);
})(document, "tools:remove-text-formatting");
