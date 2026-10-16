
(function () {
    "use strict";

    const DEFAULT_TABLE_SELECTOR =
        "[data-history-table], #history-table, #historyTable, .history-table";

    const FIELD_ALIASES = {
        date: ["date", "createdAt", "created_at", "fecha", "action_date"],
        description: [
            "description",
            "detail",
            "concept",
            "descripcion",
            "motivo",
            "name"
        ],
        type: ["type", "transactionType", "transaction_type", "tipo"],
        points: [
            "points",
            "amount",
            "pointsAmount",
            "points_amount",
            "puntos",
            "points_earned",
            "points_awarded"
        ]
    };

    function normalizeEntries(payload) {
        if (Array.isArray(payload)) return payload;

        if (!payload || typeof payload !== "object") return [];

        for (const key of [
            "history",
            "movements",
            "transactions",
            "data",
            "items"
        ]) {
            if (Array.isArray(payload[key])) return payload[key];
        }

        return [];
    }

    function resolveTable(target) {
        if (target && target.nodeType === 1) return target;

        if (typeof target === "string") {
            return document.querySelector(target);
        }

        return document.querySelector(DEFAULT_TABLE_SELECTOR);
    }

    function getColumns(table, entries) {
        const headers = Array.from(table.querySelectorAll("thead th"));

        if (headers.length) {
            return headers.map((header, index) => ({
                label: header.textContent.trim(),
                key: header.dataset.key || header.dataset.field || null,
                index
            }));
        }

        const sample = entries.find(
            (entry) => entry && typeof entry === "object"
        );

        return sample
            ? Object.keys(sample).map((key, index) => ({
                label: key,
                key,
                index
            }))
            : [];
    }

    function findProperty(entry, column) {
        const identity = (
            column.key || column.label || ""
        ).toLowerCase();

        const aliasName = Object.keys(FIELD_ALIASES).find((name) =>
            name === identity ||
            FIELD_ALIASES[name].some(
                (alias) => alias.toLowerCase() === identity
            )
        );

        const candidates = [
            column.key,
            ...(aliasName ? FIELD_ALIASES[aliasName] : []),
            column.label
        ].filter(Boolean);

        return candidates.find((key) =>
            Object.prototype.hasOwnProperty.call(entry, key)
        );
    }

    function formatValue(value, column) {
        const identity = (
            column.key || column.label || ""
        ).toLowerCase();

        const isDate =
            identity.includes("date") ||
            identity.includes("fecha") ||
            FIELD_ALIASES.date.includes(column.key);

        if (
            isDate &&
            value !== null &&
            value !== undefined &&
            value !== ""
        ) {
            const date = new Date(value);

            if (!Number.isNaN(date.getTime())) {
                return date.toLocaleDateString("es-ES");
            }
        }

        if (value === null || value === undefined || value === "") {
            return "—";
        }

        if (typeof value === "object") {
            return JSON.stringify(value);
        }

        return String(value);
    }

    function normalizeCategory(category) {
        return String(category || "")
            .trim()
            .toLocaleLowerCase("es-ES")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function createActionIcon(category) {
        const colors = {
            movilidad: ["#E8EEFF", "#4058A8"],
            naturaleza: ["#E2F5E8", "#247346"],
            reciclaje: ["#DDF4E7", "#23764B"],
            participacion: ["#FFF0DE", "#A65A19"]
        };

        const normalized = normalizeCategory(category);
        const palette = colors[normalized] || ["#E8F4EE", "#2F6B50"];

        const wrapper = document.createElement("span");
        wrapper.className = "row-icon-box";
        wrapper.style.backgroundColor = palette[0];
        wrapper.style.color = palette[1];

        const svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );

        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("width", "22");
        svg.setAttribute("height", "22");
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "currentColor");
        svg.setAttribute("stroke-width", "1.7");
        svg.setAttribute("stroke-linecap", "round");
        svg.setAttribute("stroke-linejoin", "round");
        svg.setAttribute("aria-hidden", "true");

        const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );

        path.setAttribute(
            "d",
            "M20 4C11 4 5 7 5 14a5 5 0 0 0 5 5c7 0 10-6 10-15ZM4 21c3-6 7-9 12-12"
        );

        svg.appendChild(path);
        wrapper.appendChild(svg);

        return wrapper;
    }

    function renderHistory(payload, target) {
        if (typeof document === "undefined") return false;

        const table = resolveTable(target);
        if (!table) return false;

        const body = table.tagName === "TBODY"
            ? table
            : table.tBodies[0] || table.createTBody();

        const entries = normalizeEntries(payload);
        const columns = getColumns(table, entries);
        const fragment = document.createDocumentFragment();

        body.replaceChildren();

        if (entries.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = Math.max(columns.length, 1);
            cell.className = "history-empty";
            cell.textContent = "No hay acciones registradas.";

            row.appendChild(cell);
            fragment.appendChild(row);
        } else {
            entries.forEach((entry) => {
                const record = entry && typeof entry === "object"
                    ? entry
                    : {};

                const row = document.createElement("tr");

                columns.forEach((column) => {
                    const cell = document.createElement("td");
                    const property = findProperty(record, column);
                    const value = property
                        ? record[property]
                        : undefined;

                    if (column.index === 0) {
                        cell.className = "td-left";

                        const actionInfo = document.createElement("div");
                        actionInfo.className = "action-info";

                        const category = record.category || record.categoria;
                        actionInfo.appendChild(createActionIcon(category));

                        const title = document.createElement("div");
                        title.className = "row-main-title";
                        title.textContent = formatValue(value, column);

                        actionInfo.appendChild(title);
                        cell.appendChild(actionInfo);
                    } else if (column.index === 2) {
                        cell.className = "td-general";

                        const tag = document.createElement("span");
                        tag.className = "category-tag-table";
                        tag.textContent = formatValue(value, column);

                        cell.appendChild(tag);
                    } else {
                        cell.className = column.index === 4
                            ? "td-right"
                            : "td-general";

                        if (column.index === 3 && value !== undefined) {
                            cell.textContent = `${formatValue(value, column)} kg CO₂`;
                        } else if (column.index === 4 && value !== undefined) {
                            cell.textContent = `+${formatValue(value, column)}`;
                        } else {
                            cell.textContent = formatValue(value, column);
                        }
                    }

                    row.appendChild(cell);
                });

                fragment.appendChild(row);
            });
        }

        body.appendChild(fragment);
        return true;
    }

    if (typeof window !== "undefined") {
        window.renderHistory = renderHistory;
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = renderHistory;
    }
})();
