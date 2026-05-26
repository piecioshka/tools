(function (d) {
    const COOKIE_NAME = "tools:theme";
    const LIGHT_THEME = "light";

    function getCookie(name) {
        return d.cookie
            .split("; ")
            .find((item) => item.startsWith(`${name}=`))
            ?.split("=")[1] ?? null;
    }

    function saveThemeCookie(theme) {
        const maxAge = 60 * 60 * 24 * 365;
        d.cookie = `${COOKIE_NAME}=${encodeURIComponent(theme)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
    }

    function main() {
        const $toggle = d.querySelector("[data-theme-toggle]");

        function setTheme(theme) {
            const isLightTheme = theme === LIGHT_THEME;

            d.body.classList.toggle("theme-light", isLightTheme);

            if ($toggle instanceof HTMLButtonElement) {
                $toggle.setAttribute(
                    "aria-label",
                    isLightTheme ? "Switch to dark theme" : "Switch to light theme"
                );
            }
        }

        const storedTheme = getCookie(COOKIE_NAME);
        setTheme(storedTheme === LIGHT_THEME ? LIGHT_THEME : "dark");

        if ($toggle instanceof HTMLButtonElement) {
            $toggle.addEventListener("click", () => {
                const nextTheme = d.body.classList.contains("theme-light") ? "dark" : LIGHT_THEME;
                setTheme(nextTheme);
                saveThemeCookie(nextTheme);
            });
        }
    }

    d.addEventListener("DOMContentLoaded", main);
})(document);
