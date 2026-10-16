(function () {
	"use strict";

	const DEFAULT_TABLE_SELECTOR = "[data-history-table], #history-table, #historyTable, .history-table";
	const FIELD_ALIASES = {
		date: ["date", "createdAt", "created_at", "fecha"],
		description: ["description", "detail", "concept", "descripcion", "motivo"],
		type: ["type", "transactionType", "transaction_type", "tipo"],
		points: ["points", "amount", "pointsAmount", "points_amount", "puntos"]
	};

	function normalizeEntries(payload) {
		if (Array.isArray(payload)) return payload;
		if (!payload || typeof payload !== "object") return [];
		for (const key of ["history", "movements", "transactions", "data", "items"]) {
			if (Array.isArray(payload[key])) return payload[key];
		}
		return [];
	}

	function resolveTable(target) {
		if (target && target.nodeType === 1) return target;
		if (typeof target === "string") return document.querySelector(target);
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

		const sample = entries.find((entry) => entry && typeof entry === "object");
		return sample ? Object.keys(sample).map((key, index) => ({ label: key, key, index })) : [];
	}

	function findProperty(entry, column) {
		const identity = (column.key || column.label || "").toLowerCase();
		const aliasName = Object.keys(FIELD_ALIASES).find((name) =>
			name === identity || FIELD_ALIASES[name].some((alias) => alias.toLowerCase() === identity)
		);
		const candidates = [column.key, ...(aliasName ? FIELD_ALIASES[aliasName] : []), column.label]
			.filter(Boolean);
		return candidates.find((key) => Object.prototype.hasOwnProperty.call(entry, key));
	}

	function formatValue(value, column, entry) {
		const identity = (column.key || column.label || "").toLowerCase();
		const isDate = identity.includes("date") || identity.includes("fecha") ||
			FIELD_ALIASES.date.includes(column.key);
		if (isDate && value !== null && value !== undefined && value !== "") {
			const date = new Date(value);
			if (!Number.isNaN(date.getTime())) return date.toLocaleDateString();
		}
		if (value === null || value === undefined || value === "") return "—";
		if (typeof value === "object") return JSON.stringify(value);
		return String(value);
	}

	function renderHistory(payload, target) {
		if (typeof document === "undefined") return false;
		const table = resolveTable(target);
		if (!table) return false;

		const body = table.tagName === "TBODY" ? table : table.tBodies[0] || table.createTBody();
		const entries = normalizeEntries(payload);
		const columns = getColumns(table, entries);
		const fragment = document.createDocumentFragment();
		body.replaceChildren();

		if (entries.length === 0) {
			const row = document.createElement("tr");
			const cell = document.createElement("td");
			cell.colSpan = Math.max(columns.length, 1);
			cell.className = "history-empty";
			cell.textContent = "No hay movimientos en el historial.";
			row.appendChild(cell);
			fragment.appendChild(row);
		} else {
			entries.forEach((entry) => {
				const record = entry && typeof entry === "object" ? entry : {};
				const row = document.createElement("tr");
				columns.forEach((column) => {
					const cell = document.createElement("td");
					const property = findProperty(record, column);
					cell.textContent = formatValue(property ? record[property] : undefined, column, record);
					row.appendChild(cell);
				});
				fragment.appendChild(row);
			});
		}

		body.appendChild(fragment);
		return true;
	}

	if (typeof window !== "undefined") window.renderHistory = renderHistory;
	if (typeof module !== "undefined" && module.exports) module.exports = renderHistory;
})();
