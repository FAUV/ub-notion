"use client";
import React, { useMemo, useState } from "react";

const API_KEY = process.env.NEXT_PUBLIC_UB_API_KEY ?? "";

function normaliseInitial(field, value) {
  if (value === undefined || value === null) return field.type === "checkbox" ? false : "";
  if (field.type === "multi" || field.type === "relation") {
    if (Array.isArray(value)) return value.join(", ");
    return String(value ?? "");
  }
  if (field.type === "number") {
    return value === "" ? "" : String(value ?? "");
  }
  if (field.type === "date") {
    if (typeof value === "string" && value.length >= 10) return value.slice(0, 10);
  }
  if (field.type === "datetime") {
    if (typeof value === "string" && value.length >= 16) return value.slice(0, 16);
  }
  return value ?? "";
}

function isEmpty(value) {
  return value === undefined || value === null || value === "";
}

function parseFieldValue(field, raw) {
  switch (field.type) {
    case "number": {
      if (isEmpty(raw)) return null;
      const num = Number(raw);
      if (Number.isNaN(num)) throw new Error(`"${field.label}" debe ser numérico`);
      return num;
    }
    case "multi": {
      if (isEmpty(raw)) return [];
      return String(raw)
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
    }
    case "relation": {
      if (isEmpty(raw)) return [];
      return String(raw)
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
    }
    case "checkbox":
      return Boolean(raw);
    case "date":
    case "datetime":
      return isEmpty(raw) ? null : String(raw);
    default:
      return isEmpty(raw) ? null : raw;
  }
}

export default function BaseEntityForm({
  entity,
  mode = "create",
  fields,
  initialValues = {},
  onSuccess,
  onCancel,
  submitLabel,
}) {
  const id = initialValues?.id;
  const [values, setValues] = useState(() => {
    const base = {};
    fields.forEach((field) => {
      base[field.name] = normaliseInitial(field, initialValues?.[field.name]);
    });
    return base;
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const requiredLabels = useMemo(
    () => fields.filter((f) => f.required).map((f) => f.label),
    [fields]
  );

  function handleChange(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    try {
      const data = {};
      for (const field of fields) {
        const raw = values[field.name];
        if (field.required && isEmpty(raw)) {
          throw new Error(`Completa el campo "${field.label}"`);
        }
        if (isEmpty(raw)) continue;
        data[field.name] = parseFieldValue(field, raw);
      }

      if (Object.keys(data).length === 0) {
        throw new Error("Ingresa al menos un campo para guardar");
      }

      setLoading(true);
      const method = mode === "edit" ? "PATCH" : "POST";
      const url = mode === "edit" && id ? `/api/ub/${entity}/${id}` : `/api/ub/${entity}`;
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ data }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "No se pudo guardar en Notion");
      }
      onSuccess?.(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-rose-400/40 bg-rose-100/50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-100">
          {error}
        </div>
      )}
      <div className="grid gap-4">
        {fields.map((field) => (
          <label key={field.name} className="text-sm space-y-1">
            <span className="flex items-center justify-between">
              <span>{field.label}</span>
              {field.required && <span className="text-xs text-neutral-500">Requerido</span>}
            </span>
            {field.type === "textarea" ? (
              <textarea
                value={values[field.name] ?? ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 px-3 py-2 text-sm dark:bg-neutral-900/80"
                placeholder={field.placeholder}
              />
            ) : field.type === "checkbox" ? (
              <input
                type="checkbox"
                checked={Boolean(values[field.name])}
                onChange={(e) => handleChange(field.name, e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-500"
              />
            ) : (
              <input
                type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "datetime" ? "datetime-local" : "text"}
                value={values[field.name] ?? ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 px-3 py-2 text-sm dark:bg-neutral-900/80"
                placeholder={field.placeholder}
              />
            )}
            {field.helper && <p className="text-xs text-neutral-500">{field.helper}</p>}
          </label>
        ))}
      </div>
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {loading ? "Guardando..." : submitLabel ?? (mode === "edit" ? "Actualizar" : "Crear")}
        </button>
      </div>
      {requiredLabels.length > 0 && (
        <p className="text-xs text-neutral-500">Campos obligatorios: {requiredLabels.join(", ")}</p>
      )}
    </form>
  );
}
