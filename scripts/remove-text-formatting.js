(function (d, KEY) {

    function save(content) {
        let data = '';
        try {
            data = JSON.stringify(content);
        } catch (err) {
        } finally {
            localStorage.setItem(KEY, data);
        }
    }

    function revoke() {
        const data = localStorage.getItem(KEY);
        try {
            return JSON.parse(data);
        } catch (err) {
            return '';
        }
    }

    function main() {
        const $editor = d.querySelector('textarea');
        $editor.addEventListener('keyup', () => {
            save($editor.value);
        });
        $editor.value = revoke();
    }

    d.addEventListener('DOMContentLoaded', main);

})(document, '__cache');
