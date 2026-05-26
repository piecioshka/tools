(function (d, w) {
    function getSelectedToolId() {
        return w.location.hash.replace(/^#/, "");
    }

    function main() {
        const desktopMediaQuery = w.matchMedia("(min-width: 861px)");
        const $sidebar = d.querySelector(".tools-sidebar");
        const $toggle = d.querySelector("[data-tools-sidebar-toggle]");
        const $placeholder = d.querySelector("[data-tool-placeholder]");
        const $tools = Array.from(d.querySelectorAll(".component"));
        const $links = Array.from(d.querySelectorAll(".tools-list a"));

        function setSidebarOpen(isOpen) {
            d.body.classList.toggle("is-sidebar-open", isOpen);
            d.body.classList.toggle("is-sidebar-closed", !isOpen);

            if ($sidebar instanceof HTMLElement) {
                $sidebar.classList.toggle("is-open", isOpen);
            }

            if ($toggle instanceof HTMLButtonElement) {
                $toggle.setAttribute("aria-expanded", String(isOpen));
            }
        }

        function showSelectedTool() {
            const selectedToolId = getSelectedToolId();
            const $selectedTool = $tools.find(($tool) => $tool.id === selectedToolId);

            $tools.forEach(($tool) => {
                $tool.classList.toggle("is-active", $tool === $selectedTool);
            });

            $links.forEach(($link) => {
                const isCurrent = $link.hash === `#${selectedToolId}` && $selectedTool;
                $link.classList.toggle("is-active", Boolean(isCurrent));

                if (isCurrent) {
                    $link.setAttribute("aria-current", "page");
                } else {
                    $link.removeAttribute("aria-current");
                }
            });

            if ($placeholder instanceof HTMLElement) {
                $placeholder.classList.toggle("is-hidden", Boolean($selectedTool));
            }
        }

        if ($toggle instanceof HTMLButtonElement) {
            $toggle.addEventListener("click", () => {
                const isExpanded = $toggle.getAttribute("aria-expanded") === "true";
                setSidebarOpen(!isExpanded);
            });
        }

        $links.forEach(($link) => {
            $link.addEventListener("click", () => {
                if (!desktopMediaQuery.matches) {
                    setSidebarOpen(false);
                }
            });
        });

        setSidebarOpen(desktopMediaQuery.matches);

        desktopMediaQuery.addEventListener("change", (event) => {
            setSidebarOpen(event.matches);
        });

        showSelectedTool();
        w.addEventListener("hashchange", showSelectedTool);
    }

    d.addEventListener("DOMContentLoaded", main);
})(document, window);
