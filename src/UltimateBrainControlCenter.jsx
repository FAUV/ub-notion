"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  FolderKanban,
  BookOpenText,
  Target,
  TimerReset,
  Settings,
  Search,
  RefreshCw,
  Database,
  AlertTriangle,
  ClipboardList,
  ListTodo,
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as PieC,
  Pie,
} from "recharts";

import { DEFAULT_MAPPING } from "@/lib/mapping";

const CL_TZ = "America/Santiago";

async function fetchWithFallback(url, fallbackData, timeoutMs = 6000) {
  try {
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), timeoutMs);
    const res = await fetch(url, { signal: ctl.signal, headers: { "x-api-key": (process.env?.NEXT_PUBLIC_UB_API_KEY || "") } });
    clearTimeout(to);
    if (!res.ok) throw new Error("Bad status");
    const json = await res.json();
    return json;
  } catch (e) {
    return fallbackData;
  }
}
const todayISO = new Date().toISOString().slice(0, 10);
function formatTimeCL(iso) { return new Date(iso).toLocaleTimeString("es-CL", { timeZone: CL_TZ }); }
function formatDateCL(iso) { return new Date(iso).toLocaleDateString("es-CL", { timeZone: CL_TZ }); }
function dateKeyCL(iso) { return new Date(iso).toLocaleDateString("en-CA", { timeZone: CL_TZ }); }

function Badge({ children }) {
  return (
    <span className="px-2 py-1 rounded-xl text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
      {children}
    </span>
  );
}
function Stat({ label, value, delta, suffix, percent }) {
  const up = (delta ?? 0) >= 0;
  const v = percent
    ? `${value}%`
    : suffix === "$"
    ? `$${Intl.NumberFormat("es-CL").format(value)}`
    : Intl.NumberFormat("es-CL").format(value);
  return (
    <div className="rounded-2xl p-4 bg-white/70 dark:bg-neutral-900/70 shadow-sm border border-neutral-200/60 dark:border-neutral-800/60">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-neutral-500">{label}</div>
          <div className="text-xl font-semibold mt-1">{v}</div>
        </div>
        {delta !== undefined && (
          <div className={"text-xs font-medium " + (up ? "text-emerald-600" : "text-rose-600")}>
            {up ? "+" : ""}
            {delta}%
          </div>
        )}
      </div>
    </div>
  );
}
function Card({ title, subtitle, right, children, className = "" }) {
  return (
    <div className={`rounded-2xl p-5 bg-white/70 dark:bg-neutral-900/70 shadow-sm border border-neutral-200/60 dark:border-neutral-800/60 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          {subtitle && <div className="text-xs text-neutral-500">{subtitle}</div>}
          <div className="text-base font-semibold">{title}</div>
        </div>
        <div>{right}</div>
      </div>
      {children}
    </div>
  );
}
function DataTable({ columns, rows }) {
  return (
    <div className="overflow-auto max-h-[440px] rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 backdrop-blur bg-white/80 dark:bg-neutral-900/80">
          <tr className="text-left">
            {columns.map((c) => (
              <th key={c.key || c.title} className="px-5 py-3 font-medium">{c.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="odd:bg-neutral-50/40 dark:odd:bg-neutral-950/30">
              {columns.map((c) => (
                <td key={c.key || c.title} className="px-5 py-3 whitespace-nowrap">
                  {c.render ? c.render(r[c.key], r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onEdit}
        className="p-1 rounded-full border border-neutral-200/60 dark:border-neutral-700/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        aria-label="Editar"
        type="button"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onDelete}
        className="p-1 rounded-full border border-neutral-200/60 dark:border-neutral-700/60 hover:bg-rose-100/80 dark:hover:bg-rose-900/40 transition"
        aria-label="Eliminar"
        type="button"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function EntityModal({ modal, schema, values, onChange, onSubmit, onClose, onDelete, error, loading }) {
  if (!modal || !schema) return null;

  const renderField = (field) => {
    const value = values[field.name] ?? (field.type === "multi-select" ? [] : "");
    const common = {
      id: `field-${schema.title}-${field.name}`,
      name: field.name,
    };
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            {...common}
            rows={4}
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 px-3 py-2"
            placeholder={field.placeholder}
          />
        );
      case "select": {
        const listId = `${common.id}-list`;
        return (
          <>
            <input
              {...common}
              value={value ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 px-3 py-2"
              placeholder={field.placeholder}
              list={field.suggestions?.length ? listId : undefined}
            />
            {field.suggestions?.length ? (
              <datalist id={listId}>
                {field.suggestions.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            ) : null}
          </>
        );
      }
      case "multi-select":
        return (
          <select
            {...common}
            multiple
            value={Array.isArray(value) ? value : []}
            onChange={(e) =>
              onChange(
                field.name,
                Array.from(e.target.selectedOptions).map((opt) => opt.value),
              )
            }
            className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 px-3 py-2"
            size={Math.min(6, Math.max(3, field.options?.length || 3))}
          >
            {(field.options || []).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "multi-text":
        return (
          <input
            {...common}
            value={value ?? ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 px-3 py-2"
            placeholder={field.placeholder ?? "valor1, valor2"}
          />
        );
      case "number":
        return (
          <input
            {...common}
            type="number"
            value={value ?? ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 px-3 py-2"
            placeholder={field.placeholder}
          />
        );
      case "date":
        return (
          <input
            {...common}
            type="date"
            value={value ?? ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 px-3 py-2"
          />
        );
      default:
        return (
          <input
            {...common}
            value={value ?? ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 px-3 py-2"
            placeholder={field.placeholder}
          />
        );
    }
  };

  const title = schema.title;
  const modeLabel = modal.mode === "create" ? "Nuevo" : "Editar";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 px-4 py-8">
      <div className="w-full max-w-3xl rounded-3xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/95 dark:bg-neutral-950/95 shadow-xl overflow-hidden">
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-neutral-500">{modeLabel}</div>
              <h2 className="text-xl font-semibold">{title}</h2>
            </div>
            <div className="flex items-center gap-2">
              {modal.mode === "edit" && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="px-3 py-1.5 rounded-2xl border border-rose-400/60 text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-sm flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" /> Borrar
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {schema.fields.map((field) => (
              <label key={field.name} className="text-xs md:text-sm space-y-1">
                <span className="font-medium text-neutral-600 dark:text-neutral-300">
                  {field.label}
                  {field.required && <span className="text-rose-500 ml-1">*</span>}
                </span>
                {renderField(field)}
                {field.helper && <span className="block text-[11px] text-neutral-500">{field.helper}</span>}
              </label>
            ))}
          </div>
          {error && (
            <div className="text-sm text-rose-600 bg-rose-100/70 dark:bg-rose-900/30 px-3 py-2 rounded-2xl">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl border border-neutral-300 dark:border-neutral-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              disabled={loading}
            >
              {loading ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TodayPage({ tasks, calendar }) {
  const dueToday = tasks.filter((t) => t.due === todayISO && t.status !== "Hecho");
  const overdue = tasks.filter((t) => t.due && t.due < todayISO && t.status !== "Hecho");
  const nextUp = tasks.filter((t) => t.scheduled >= todayISO && t.status !== "Hecho").slice(0, 6);
  const weekAheadLimit = new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10);
  const weekAhead = tasks
    .filter((t) => t.due && t.due >= todayISO && t.due <= weekAheadLimit && t.status !== "Hecho")
    .sort((a, b) => String(a.due || "").localeCompare(String(b.due || "")));

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const key = d.toLocaleDateString("en-CA", { timeZone: CL_TZ });
    const label = d.toLocaleDateString("es-CL", { weekday: "short", timeZone: CL_TZ }).replace(".", "");
    const done = tasks.filter((t) => t.status === "Hecho" && t.updated && dateKeyCL(t.updated) === key).length;
    return { day: label, done };
  });

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Vence hoy" value={dueToday.length} />
        <Stat label="Atrasadas" value={overdue.length} />
        <Stat label="Siguientes" value={nextUp.length} />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Hoy" subtitle="Tareas con fecha límite" right={<Badge>{dueToday.length}</Badge>}>
          <ul className="space-y-2">
            {dueToday.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ListTodo className="h-4 w-4" /> {t.title}
                </div>
                <Badge>{t.priority}</Badge>
              </li>
            ))}
            {dueToday.length === 0 && <div className="text-sm text-neutral-500">Sin tareas para hoy 🎯</div>}
          </ul>
        </Card>
        <Card title="Atrasadas" subtitle="Acción inmediata" right={<Badge>{overdue.length}</Badge>}>
          <ul className="space-y-2">
            {overdue.slice(0, 8).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-rose-600">
                  <AlertTriangle className="h-4 w-4" /> {t.title}
                </div>
                <span className="text-xs">Venció: {t.due}</span>
              </li>
            ))}
            {overdue.length === 0 && <div className="text-sm text-neutral-500">Nada atrasado ✅</div>}
          </ul>
        </Card>
        <Card title="Agenda" subtitle="Eventos y bloques" right={<Badge>{calendar.length}</Badge>}>
          <ul className="space-y-2">
            {calendar.slice(0, 8).map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> {e.title}
                </div>
                <span className="text-xs">{formatTimeCL(e.start)}–{formatTimeCL(e.end)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card title="My Day" subtitle="Prioridades esenciales">
          <ul className="space-y-2 text-sm">
            {dueToday.slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2">
                <span>{t.title}</span>
                <Badge>{t.priority ?? "—"}</Badge>
              </li>
            ))}
            {dueToday.length === 0 && <li className="text-neutral-500">Lograste despejar el día ✨</li>}
          </ul>
        </Card>
        <Card title="My Week" subtitle="Vista rápida 7 días">
          <ul className="space-y-2 text-sm">
            {weekAhead.slice(0, 6).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2">
                <span>{t.title}</span>
                <span className="text-xs">{t.due}</span>
              </li>
            ))}
            {weekAhead.length === 0 && <li className="text-neutral-500">Semana despejada 🚀</li>}
          </ul>
        </Card>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Completadas (últimos 7d)" subtitle="Ritmo" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="done" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Por prioridad" subtitle="Distribución">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieC>
                <Pie
                  dataKey="value"
                  nameKey="name"
                  data={[
                    { name: "Alta", value: tasks.filter((t) => t.priority === "Alta").length },
                    { name: "Media", value: tasks.filter((t) => t.priority === "Media").length },
                    { name: "Baja", value: tasks.filter((t) => t.priority === "Baja").length },
                  ]}
                  outerRadius={110}
                  label
                />
                <Tooltip />
              </PieC>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function TasksPage({ tasks, onCreate, onEdit, onDelete }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const [area, setArea] = useState("Todas");
  const [priority, setPriority] = useState("Todas");

  const areas = Array.from(new Set(tasks.map((t) => t.area))).sort();

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const q = !query || t.title.toLowerCase().includes(query.toLowerCase());
      const s = status === "Todos" || t.status === status;
      const a = area === "Todas" || t.area === area;
      const p = priority === "Todas" || t.priority === priority;
      return q && s && a && p;
    });
  }, [tasks, query, status, area, priority]);

  const cols = [
    { key: "title", title: "Tarea" },
    { key: "status", title: "Estado" },
    { key: "project", title: "Proyecto" },
    { key: "area", title: "Área" },
    { key: "priority", title: "Prioridad" },
    { key: "due", title: "Fecha límite" },
    {
      key: "actions",
      title: "",
      render: (_, row) => <RowActions onEdit={() => onEdit?.(row)} onDelete={() => onDelete?.(row)} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 gap-3 items-end">
        <label className="text-sm">
          Buscar
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-1 w-full rounded-2xl px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70"
            placeholder="Escribe para filtrar"
          />
        </label>
        <label className="text-sm">
          Estado
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded-2xl px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70"
          >
            {["Todos", "Por hacer", "En curso", "Hecho"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Área
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="mt-1 w-full rounded-2xl px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70"
          >
            {["Todas", ...areas].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Prioridad
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="mt-1 w-full rounded-2xl px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70"
          >
            {["Todas", "Alta", "Media", "Baja"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      </div>
      <Card
        title="Lista"
        subtitle="Vista de tareas"
        right={
          <div className="flex items-center gap-2">
            {onCreate && (
              <button
                onClick={() => onCreate?.()}
                className="px-3 py-1.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 flex items-center gap-1 text-xs"
              >
                <Plus className="h-4 w-4" /> Nueva tarea
              </button>
            )}
            <Badge>{filtered.length}</Badge>
          </div>
        }
      >
        <DataTable columns={cols} rows={filtered} />
      </Card>
    </div>
  );
}

function ProjectsPage({ projects, onCreate, onEdit, onDelete }) {
  const cols = [
    { key: "title", title: "Proyecto" },
    { key: "status", title: "Estado" },
    { key: "area", title: "Área" },
    {
      key: "progress",
      title: "Progreso",
      render: (v) => (
        <div className="w-40 h-2 bg-neutral-200 dark:bg-neutral-800 rounded">
          <div className="h-full bg-neutral-600 dark:bg-neutral-200" style={{ width: `${v}%` }} />
        </div>
      ),
    },
    { key: "due", title: "Fecha objetivo" },
    { key: "lead", title: "Responsable" },
    {
      key: "actions",
      title: "",
      render: (_, row) => <RowActions onEdit={() => onEdit?.(row)} onDelete={() => onDelete?.(row)} />,
    },
  ];
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Stat label="Activos" value={projects.filter((p) => p.status === "Activo").length} />
        <Stat label="En espera" value={projects.filter((p) => p.status === "En espera").length} />
        <Stat label="Hechos" value={projects.filter((p) => p.status === "Hecho").length} />
        <Stat label="Progreso medio" value={Math.round(projects.reduce((s, p) => s + p.progress, 0) / (projects.length || 1))} percent />
      </div>
      <Card
        title="Proyectos"
        subtitle="Estado y avance"
        right={
          <div className="flex items-center gap-2">
            {onCreate && (
              <button
                onClick={() => onCreate?.()}
                className="px-3 py-1.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 flex items-center gap-1 text-xs"
              >
                <Plus className="h-4 w-4" /> Nuevo proyecto
              </button>
            )}
            <Badge>{projects.length}</Badge>
          </div>
        }
      >
        <DataTable columns={cols} rows={projects} />
      </Card>
    </div>
  );
}

function AreasPage({ areas, onCreate, onEdit, onDelete }) {
  const cols = [
    { key: "title", title: "Área" },
    { key: "owner", title: "Responsable" },
    { key: "mission", title: "Misión", render: (v) => v || "" },
    { key: "tags", title: "Tags", render: (v) => (v || []).join(", ") },
    {
      key: "actions",
      title: "",
      render: (_, row) => <RowActions onEdit={() => onEdit?.(row)} onDelete={() => onDelete?.(row)} />,
    },
  ];
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Total de áreas" value={areas.length} />
        <Stat label="Con responsable" value={areas.filter((a) => a.owner).length} />
        <Stat label="Sin misión" value={areas.filter((a) => !a.mission).length} />
      </div>
      <Card
        title="Áreas"
        subtitle="Responsables y propósito"
        right={
          <div className="flex items-center gap-2">
            {onCreate && (
              <button
                onClick={() => onCreate?.()}
                className="px-3 py-1.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 flex items-center gap-1 text-xs"
              >
                <Plus className="h-4 w-4" /> Nueva área
              </button>
            )}
            <Badge>{areas.length}</Badge>
          </div>
        }
      >
        <DataTable columns={cols} rows={areas} />
      </Card>
    </div>
  );
}

function NotesPage({ notes, onCreate, onEdit, onDelete }) {
  const tabs = [
    { key: "inbox", label: "Inbox" },
    { key: "notes", label: "Notes" },
    { key: "fav", label: "Fav" },
    { key: "clips", label: "Clips" },
    { key: "voice", label: "Voice" },
  ];
  const [activeTab, setActiveTab] = useState("inbox");
  const filtered = useMemo(() => {
    const lowerKey = activeTab.toLowerCase();
    const matcher = (note) => {
      const status = String(note.status || note.type || "").toLowerCase();
      const tags = Array.isArray(note.tags) ? note.tags.join(" ").toLowerCase() : String(note.tags || "").toLowerCase();
      switch (lowerKey) {
        case "inbox": return status.includes("inbox") || tags.includes("inbox");
        case "notes": return status.includes("note") || tags.includes("note");
        case "fav": return Boolean(note.favorite) || tags.includes("fav") || tags.includes("favorite");
        case "clips": return status.includes("clip") || tags.includes("clip");
        case "voice": return status.includes("voice") || tags.includes("voice");
        default: return false;
      }
    };
    const result = notes.filter(matcher);
    return result.length ? result : notes;
  }, [notes, activeTab]);
  const cols = [
    { key: "title", title: "Título" },
    { key: "type", title: "Tipo" },
    { key: "area", title: "Área" },
    { key: "project", title: "Proyecto" },
    { key: "tags", title: "Tags" },
    { key: "updated", title: "Actualizado" },
    {
      key: "actions",
      title: "",
      render: (_, row) => <RowActions onEdit={() => onEdit?.(row)} onDelete={() => onDelete?.(row)} />,
    },
  ];
  return (
    <div className="space-y-6">
      <Card
        title="Notas y Recursos"
        subtitle="Inbox y clasificaciones"
        right={
          <div className="flex items-center gap-2">
            {onCreate && (
              <button
                onClick={() => onCreate?.()}
                className="px-3 py-1.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 flex items-center gap-1 text-xs"
              >
                <Plus className="h-4 w-4" /> Nueva nota
              </button>
            )}
            <Badge>{filtered.length}</Badge>
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1 rounded-full border transition-colors ${
                activeTab === tab.key
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-transparent border-neutral-300 dark:border-neutral-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <DataTable columns={cols} rows={filtered} />
      </Card>
    </div>
  );
}

function ContentPage({ entries }) {
  const tabs = [
    { key: "active", label: "Active Now" },
    { key: "this-month", label: "This Month" },
    { key: "ideas", label: "Ideas" },
    { key: "planned", label: "Planned" },
    { key: "review", label: "Review" },
    { key: "published", label: "Published" },
    { key: "archived", label: "Archived" },
  ];
  const [activeTab, setActiveTab] = useState("active");
  const columns = [
    { key: "title", title: "Título" },
    { key: "status", title: "Estado" },
    { key: "project", title: "Proyecto" },
    { key: "due", title: "Fecha" },
    { key: "tags", title: "Tags" },
  ];
  const filtered = useMemo(() => {
    const normalize = (value) => String(value || "").toLowerCase();
    const target = activeTab.replace("-", " ");
    const list = entries.filter((item) => {
      const status = normalize(item.status || item.stage || item.state);
      const tags = normalize(Array.isArray(item.tags) ? item.tags.join(" ") : item.tags);
      const bucket = status.includes(target) || tags.includes(target);
      if (bucket) return true;
      if (activeTab === "this-month" && item.due) {
        const due = new Date(item.due);
        const now = new Date();
        return due.getMonth() === now.getMonth() && due.getFullYear() === now.getFullYear();
      }
      return false;
    });
    return list.length ? list : entries.slice(0, 10);
  }, [entries, activeTab]);

  return (
    <div className="space-y-6">
      <Card
        title="Content Pipeline"
        subtitle="Creator's Companion"
        right={<Badge>{filtered.length}</Badge>}
      >
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1 rounded-full border transition-colors ${
                activeTab === tab.key
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-transparent border-neutral-300 dark:border-neutral-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <DataTable columns={columns} rows={filtered} />
      </Card>
    </div>
  );
}

function GoalsPage({ goals, onCreate, onEdit, onDelete }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {onCreate && (
          <button
            onClick={() => onCreate?.()}
            className="px-3 py-1.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 flex items-center gap-1 text-xs"
          >
            <Plus className="h-4 w-4" /> Nuevo objetivo
          </button>
        )}
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {goals.map((g) => (
          <Card
            key={g.id}
            title={g.title}
            subtitle={`${g.horizon} · ${g.area}`}
            right={
              <div className="flex items-center gap-2">
                <Badge>{g.progress}%</Badge>
                <RowActions onEdit={() => onEdit?.(g)} onDelete={() => onDelete?.(g)} />
              </div>
            }
          >
            <div className="w-full h-3 bg-neutral-200 dark:bg-neutral-800 rounded">
              <div className="h-full bg-neutral-600 dark:bg-neutral-200" style={{ width: `${g.progress}%` }} />
            </div>
          </Card>
        ))}
      </div>
      <Card title="Timeline anual" subtitle="Próximos hitos">
        <ol className="relative border-l border-neutral-300 dark:border-neutral-700 pl-4 space-y-4 text-sm">
          {goals
            .filter((g) => g.due)
            .sort((a, b) => String(a.due || "").localeCompare(String(b.due || "")))
            .map((goal) => (
              <li key={goal.id} className="ml-2">
                <span className="absolute -left-2 top-1.5 h-3 w-3 rounded-full bg-neutral-900 dark:bg-neutral-200" />
                <div className="font-medium">{goal.title}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {goal.due} · {goal.horizon ?? 'Sin horizonte'} · {goal.area ?? 'Área global'}
                </div>
              </li>
            ))}
          {!goals.some((g) => g.due) && <li className="text-neutral-500">Añade fechas objetivo para poblar la línea de tiempo.</li>}
        </ol>
      </Card>
    </div>
  );
}

function HabitsPage({ habits, onCreate, onEdit, onDelete }) {
  const cols = [
    { key: "title", title: "Hábito" },
    { key: "streak", title: "Racha" },
    { key: "last", title: "Última vez" },
    { key: "cadence", title: "Cadencia" },
    {
      key: "actions",
      title: "",
      render: (_, row) => <RowActions onEdit={() => onEdit?.(row)} onDelete={() => onDelete?.(row)} />,
    },
  ];
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Racha más alta" value={Math.max(0, ...habits.map((h) => h.streak))} />
        <Stat label="Hábitos activos" value={habits.length} />
        <Stat label="Hoy completados" value={habits.filter((h) => h.last === todayISO).length} />
      </div>
      <Card
        title="Hábitos"
        subtitle="Seguimiento"
        right={
          <div className="flex items-center gap-2">
            {onCreate && (
              <button
                onClick={() => onCreate?.()}
                className="px-3 py-1.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 flex items-center gap-1 text-xs"
              >
                <Plus className="h-4 w-4" /> Nuevo hábito
              </button>
            )}
            <Badge>{habits.length}</Badge>
          </div>
        }
      >
        <DataTable columns={cols} rows={habits} />
      </Card>
    </div>
  );
}

function ReviewsPage({ reviews, onCreate, onEdit, onDelete }) {
  const cols = [
    { key: "title", title: "Revisión" },
    { key: "period", title: "Periodo" },
    { key: "mood", title: "Estado" },
    { key: "highlights", title: "Highlights" },
    { key: "next", title: "Siguientes" },
    {
      key: "actions",
      title: "",
      render: (_, row) => <RowActions onEdit={() => onEdit?.(row)} onDelete={() => onDelete?.(row)} />,
    },
  ];
  return (
    <div className="space-y-6">
      <Card
        title="Revisiones"
        subtitle="Weekly/Monthly"
        right={
          <div className="flex items-center gap-2">
            {onCreate && (
              <button
                onClick={() => onCreate?.()}
                className="px-3 py-1.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 flex items-center gap-1 text-xs"
              >
                <Plus className="h-4 w-4" /> Nueva revisión
              </button>
            )}
            <Badge>{reviews.length}</Badge>
          </div>
        }
      >
        <DataTable columns={cols} rows={reviews} />
      </Card>
    </div>
  );
}

function CalendarPage({ calendar, onCreate, onEdit, onDelete }) {
  const cols = [
    { key: "title", title: "Evento" },
    { key: "start", title: "Inicio", render: (v) => formatDateCL(v) + " " + formatTimeCL(v) },
    { key: "end", title: "Fin", render: (v) => formatDateCL(v) + " " + formatTimeCL(v) },
    { key: "related", title: "Relacionado" },
    {
      key: "actions",
      title: "",
      render: (_, row) => <RowActions onEdit={() => onEdit?.(row)} onDelete={() => onDelete?.(row)} />,
    },
  ];
  return (
    <div className="space-y-6">
      <Card
        title="Calendario"
        subtitle="Eventos sincronizados"
        right={
          <div className="flex items-center gap-2">
            {onCreate && (
              <button
                onClick={() => onCreate?.()}
                className="px-3 py-1.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 flex items-center gap-1 text-xs"
              >
                <Plus className="h-4 w-4" /> Nuevo evento
              </button>
            )}
            <Badge>{calendar.length}</Badge>
          </div>
        }
      >
        <DataTable columns={cols} rows={calendar} />
      </Card>
    </div>
  );
}

function StudiesPage({ courses, readings, studyNotes, resources, exams, flashcards, sessions, onCreate, onEdit, onDelete }) {
  const tz = CL_TZ;

  const activeCourses = courses.filter((c) => (c.status ?? "Activo") !== "Completado");
  const upcomingExams = exams
    .filter((e) => e.date && new Date(e.date) >= new Date(new Date().toISOString().slice(0, 10)))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .slice(0, 6);

  const minutesLast14d = sessions
    .filter((s) => s.date)
    .filter((s) => new Date().getTime() - new Date(s.date).getTime() <= 14 * 86400000)
    .reduce((acc, s) => acc + (Number(s.duration) || 0), 0);

  const colsReadings = [
    { key: "title", title: "Lectura" },
    { key: "course", title: "Curso" },
    { key: "type", title: "Tipo" },
    { key: "status", title: "Estado" },
    { key: "due", title: "Para", render: (v) => (v ? formatDateCL(v) : "") },
    { key: "tags", title: "Tags", render: (v) => (v || []).join(", ") },
    {
      key: "actions",
      title: "",
      render: (_, row) => <RowActions onEdit={() => onEdit?.("readings", row)} onDelete={() => onDelete?.("readings", row)} />,
    },
  ];
  const colsSessions = [
    { key: "date", title: "Fecha", render: (v) => (v ? new Date(v).toLocaleString("es-CL", { timeZone: tz }) : "") },
    { key: "duration", title: "Duración (min)" },
    { key: "course", title: "Curso" },
    { key: "topic", title: "Tema" },
    { key: "notes", title: "Notas" },
    {
      key: "actions",
      title: "",
      render: (_, row) => <RowActions onEdit={() => onEdit?.("sessions", row)} onDelete={() => onDelete?.("sessions", row)} />,
    },
  ];
  const colsNotes = [
    { key: "title", title: "Nota" },
    { key: "course", title: "Curso" },
    { key: "reading", title: "Lectura" },
    { key: "concepts", title: "Conceptos", render: (v) => (v || []).join(", ") },
    { key: "tags", title: "Tags", render: (v) => (v || []).join(", ") },
    { key: "updated", title: "Actualizado", render: (v) => (v ? new Date(v).toLocaleString("es-CL", { timeZone: tz }) : "") },
    {
      key: "actions",
      title: "",
      render: (_, row) => <RowActions onEdit={() => onEdit?.("study_notes", row)} onDelete={() => onDelete?.("study_notes", row)} />,
    },
  ];
  const colsResources = [
    { key: "title", title: "Recurso" },
    { key: "type", title: "Tipo" },
    { key: "course", title: "Curso" },
    { key: "link", title: "Enlace" },
    { key: "tags", title: "Tags", render: (v) => (v || []).join(", ") },
    {
      key: "actions",
      title: "",
      render: (_, row) => <RowActions onEdit={() => onEdit?.("resources", row)} onDelete={() => onDelete?.("resources", row)} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Stat label="Cursos activos" value={activeCourses.length} />
        <Stat label="Lecturas en progreso" value={readings.filter((r) => r.status !== "Completado").length} />
        <Stat label="Min últimos 14 días" value={minutesLast14d} />
        <Stat label="Exámenes próximos" value={upcomingExams.length} />
      </div>

      <Card
        title="Progreso por curso"
        subtitle="% completado"
        right={
          <button
            onClick={() => onCreate?.("courses")}
            className="px-3 py-1.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 flex items-center gap-1 text-xs"
          >
            <Plus className="h-4 w-4" /> Nuevo curso
          </button>
        }
      >
        <div className="grid md:grid-cols-2 gap-4">
          {activeCourses.map((c) => (
            <div key={c.id} className="rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 p-3">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="truncate pr-2">{c.title}</span>
                <div className="flex items-center gap-2">
                  <Badge>{Math.round(c.progress || 0)}%</Badge>
                  <RowActions onEdit={() => onEdit?.("courses", c)} onDelete={() => onDelete?.("courses", c)} />
                </div>
              </div>
              <div className="mt-2 h-2 rounded bg-neutral-200/60 dark:bg-neutral-800/60">
                <div className="h-2 rounded bg-neutral-900 dark:bg-white" style={{ width: `${Math.min(100, Math.max(0, c.progress || 0))}%` }} />
              </div>
              <div className="text-xs mt-2 text-neutral-500">{c.provider || c.area || ""}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card
          title="Próximas evaluaciones"
          subtitle="6 siguientes"
          right={
            <button
              onClick={() => onCreate?.("exams")}
              className="px-3 py-1.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 flex items-center gap-1 text-xs"
            >
              <Plus className="h-4 w-4" /> Nueva evaluación
            </button>
          }
        >
          <ul className="space-y-2 text-sm">
            {upcomingExams.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3">
                <span className="truncate flex-1">{e.title} — {e.course}</span>
                <span className="tabular-nums text-xs">{e.date ? formatDateCL(e.date) : ""}</span>
                <RowActions onEdit={() => onEdit?.("exams", e)} onDelete={() => onDelete?.("exams", e)} />
              </li>
            ))}
            {upcomingExams.length===0 && <div className="text-xs text-neutral-500">Sin evaluaciones próximas</div>}
          </ul>
        </Card>
        <Card
          title="Flashcards pendientes (hoy)"
          right={
            <button
              onClick={() => onCreate?.("flashcards")}
              className="px-3 py-1.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 flex items-center gap-1 text-xs"
            >
              <Plus className="h-4 w-4" /> Nueva tarjeta
            </button>
          }
        >
          <ul className="space-y-2 text-sm">
            {flashcards.filter((f)=> f.due && f.due <= new Date().toISOString().slice(0,10)).slice(0,10).map((f)=>(
              <li key={f.id} className="flex items-center justify-between gap-3">
                <span className="truncate flex-1">{f.front}</span>
                <RowActions onEdit={() => onEdit?.("flashcards", f)} onDelete={() => onDelete?.("flashcards", f)} />
              </li>
            ))}
            {flashcards.length===0 && <div className="text-xs text-neutral-500">Sin tarjetas pendientes</div>}
          </ul>
        </Card>
      </div>

      <Card
        title="Lecturas en progreso"
        right={
          <button
            onClick={() => onCreate?.("readings")}
            className="px-3 py-1.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 flex items-center gap-1 text-xs"
          >
            <Plus className="h-4 w-4" /> Nueva lectura
          </button>
        }
      >
        <DataTable columns={colsReadings} rows={readings} />
      </Card>

      <Card
        title="Sesiones de estudio (recientes)"
        right={
          <button
            onClick={() => onCreate?.("sessions")}
            className="px-3 py-1.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 flex items-center gap-1 text-xs"
          >
            <Plus className="h-4 w-4" /> Registrar sesión
          </button>
        }
      >
        <DataTable columns={colsSessions} rows={sessions.sort((a,b)=> String(b.date||"").localeCompare(String(a.date||""))).slice(0,20)} />
      </Card>

      <Card
        title="Notas de estudio (últimas)"
        right={
          <button
            onClick={() => onCreate?.("study_notes")}
            className="px-3 py-1.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 flex items-center gap-1 text-xs"
          >
            <Plus className="h-4 w-4" /> Nueva nota
          </button>
        }
      >
        <DataTable columns={colsNotes} rows={studyNotes.sort((a,b)=> String(b.updated||"").localeCompare(String(a.updated||""))).slice(0,20)} />
      </Card>

      <Card
        title="Recursos"
        right={
          <button
            onClick={() => onCreate?.("resources")}
            className="px-3 py-1.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 flex items-center gap-1 text-xs"
          >
            <Plus className="h-4 w-4" /> Nuevo recurso
          </button>
        }
      >
        <DataTable columns={colsResources} rows={resources} />
      </Card>
    </div>
  );
}

const MOCK = {
  tasks: [], projects: [], areas: [], notes: [], goals: [], habits: [], reviews: [], calendar: [],
  studies: { courses: [], readings: [], study_notes: [], resources: [], exams: [], flashcards: [], sessions: [] }
};

async function ubGet(path, params = {}, fallback) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => (v!==undefined && v!==null && v!=="") && sp.append(k, String(v)));
  const url = sp.toString() ? `${path}?${sp.toString()}` : path;
  return await fetchWithFallback(url, fallback);
}

const NAV = [
  { id: "today", label: "Hoy", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "tasks", label: "Tareas", icon: <CheckSquare className="h-4 w-4" /> },
  { id: "projects", label: "Proyectos", icon: <FolderKanban className="h-4 w-4" /> },
  { id: "content", label: "Contenido", icon: <BookOpenText className="h-4 w-4" /> },
  { id: "areas", label: "Áreas", icon: <ListTodo className="h-4 w-4" /> },
  { id: "notes", label: "Notas/Recursos", icon: <BookOpenText className="h-4 w-4" /> },
  { id: "goals", label: "Objetivos", icon: <Target className="h-4 w-4" /> },
  { id: "habits", label: "Hábitos", icon: <TimerReset className="h-4 w-4" /> },
  { id: "reviews", label: "Revisiones", icon: <ClipboardList className="h-4 w-4" /> },
  { id: "calendar", label: "Calendario", icon: <CalendarDays className="h-4 w-4" /> },
  { id: "studies", label: "Estudios", icon: <GraduationCap className="h-4 w-4" /> },
  { id: "settings", label: "Configuración", icon: <Settings className="h-4 w-4" /> },
];

export default function UltimateBrainControlCenter() {
  const [page, setPage] = useState("today");
  const [themeDark, setThemeDark] = useState(true);
  const [mapping, setMapping] = useState(DEFAULT_MAPPING);
  const [lastSyncISO, setLastSyncISO] = useState(new Date().toISOString());
  const [globalQuery, setGlobalQuery] = useState("");

  const [tasks, setTasks] = useState(MOCK.tasks);
  const [projects, setProjects] = useState(MOCK.projects);
  const [areas, setAreas] = useState(MOCK.areas);
  const [notes, setNotes] = useState(MOCK.notes);
  const [goals, setGoals] = useState(MOCK.goals);
  const [habits, setHabits] = useState(MOCK.habits);
  const [reviews, setReviews] = useState(MOCK.reviews);
  const [calendar, setCalendar] = useState(MOCK.calendar);

  const [courses, setCourses] = useState(MOCK.studies.courses);
  const [readings, setReadings] = useState(MOCK.studies.readings);
  const [studyNotes, setStudyNotes] = useState(MOCK.studies.study_notes);
  const [resources, setResources] = useState(MOCK.studies.resources);
  const [exams, setExams] = useState(MOCK.studies.exams);
  const [flashcards, setFlashcards] = useState(MOCK.studies.flashcards);
  const [sessions, setSessions] = useState(MOCK.studies.sessions);

  const [modal, setModal] = useState(null);
  const [modalForm, setModalForm] = useState({});
  const [modalError, setModalError] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const uniqueStrings = (...sources) => {
    const set = new Set();
    sources
      .filter(Boolean)
      .forEach((list) => {
        (list || []).forEach((value) => {
          if (Array.isArray(value)) {
            value.forEach((inner) => {
              if (inner !== undefined && inner !== null && inner !== "") set.add(String(inner));
            });
          } else if (value !== undefined && value !== null && value !== "") {
            set.add(String(value));
          }
        });
      });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  };

  const projectOptions = useMemo(
    () => projects.map((p) => ({ value: p.id, label: p.title || "(sin título)" })).filter((p) => p.value),
    [projects],
  );
  const taskStatusOptions = useMemo(() => uniqueStrings(tasks.map((t) => t.status)), [tasks]);
  const taskPriorityOptions = useMemo(() => uniqueStrings(["Alta", "Media", "Baja"], tasks.map((t) => t.priority)), [tasks]);
  const taskEnergyOptions = useMemo(() => uniqueStrings(tasks.map((t) => t.energy)), [tasks]);
  const taskEffortOptions = useMemo(() => uniqueStrings(tasks.map((t) => t.effort)), [tasks]);
  const taskTagSuggestions = useMemo(() => uniqueStrings(tasks.map((t) => t.tags || [])), [tasks]);
  const areaNames = useMemo(
    () => uniqueStrings(areas.map((a) => a.title), tasks.map((t) => t.area), projects.map((p) => p.area)),
    [areas, tasks, projects],
  );
  const projectStatusOptions = useMemo(() => uniqueStrings(projects.map((p) => p.status)), [projects]);
  const projectLeadOptions = useMemo(() => uniqueStrings(projects.map((p) => p.lead)), [projects]);
  const projectTagSuggestions = useMemo(() => uniqueStrings(projects.map((p) => p.tags || [])), [projects]);
  const areaOwnerOptions = useMemo(() => uniqueStrings(areas.map((a) => a.owner)), [areas]);
  const areaTagSuggestions = useMemo(() => uniqueStrings(areas.map((a) => a.tags || [])), [areas]);
  const noteTypeOptions = useMemo(() => uniqueStrings(notes.map((n) => n.type)), [notes]);
  const noteTagSuggestions = useMemo(() => uniqueStrings(notes.map((n) => n.tags || [])), [notes]);
  const goalHorizonOptions = useMemo(() => uniqueStrings(goals.map((g) => g.horizon)), [goals]);
  const goalTagSuggestions = useMemo(() => uniqueStrings(goals.map((g) => g.tags || [])), [goals]);
  const habitCadenceOptions = useMemo(() => uniqueStrings(habits.map((h) => h.cadence)), [habits]);
  const reviewMoodOptions = useMemo(() => uniqueStrings(reviews.map((r) => r.mood)), [reviews]);
  const calendarRelatedOptions = useMemo(() => {
    const seen = new Map();
    const push = (id, label) => {
      if (id && !seen.has(id)) seen.set(id, label || "(sin título)");
    };
    tasks.forEach((t) => push(t.id, `Tarea · ${t.title}`));
    projects.forEach((p) => push(p.id, `Proyecto · ${p.title}`));
    notes.forEach((n) => push(n.id, `Nota · ${n.title}`));
    return Array.from(seen.entries()).map(([value, label]) => ({ value, label }));
  }, [tasks, projects, notes]);

  const courseStatusOptions = useMemo(() => uniqueStrings(courses.map((c) => c.status)), [courses]);
  const courseAreaOptions = useMemo(() => uniqueStrings(courses.map((c) => c.area)), [courses, areaNames]);
  const courseProviderOptions = useMemo(() => uniqueStrings(courses.map((c) => c.provider)), [courses]);
  const courseTagSuggestions = useMemo(() => uniqueStrings(courses.map((c) => c.tags || [])), [courses]);
  const readingTypeOptions = useMemo(() => uniqueStrings(readings.map((r) => r.type)), [readings]);
  const readingStatusOptions = useMemo(() => uniqueStrings(readings.map((r) => r.status)), [readings]);
  const readingSourceOptions = useMemo(() => uniqueStrings(readings.map((r) => r.source)), [readings]);
  const readingTagSuggestions = useMemo(() => uniqueStrings(readings.map((r) => r.tags || [])), [readings]);
  const studyConceptSuggestions = useMemo(() => uniqueStrings(studyNotes.map((n) => n.concepts || [])), [studyNotes]);
  const studyNoteTagSuggestions = useMemo(() => uniqueStrings(studyNotes.map((n) => n.tags || [])), [studyNotes]);
  const resourceTypeOptions = useMemo(() => uniqueStrings(resources.map((r) => r.type)), [resources]);
  const resourceTagSuggestions = useMemo(() => uniqueStrings(resources.map((r) => r.tags || [])), [resources]);
  const examStatusOptions = useMemo(() => uniqueStrings(exams.map((e) => e.status)), [exams]);
  const examTagSuggestions = useMemo(() => uniqueStrings(exams.map((e) => e.tags || [])), [exams]);
  const flashcardDeckOptions = useMemo(() => uniqueStrings(flashcards.map((f) => f.deck)), [flashcards]);

  const courseTitleSuggestions = useMemo(() => uniqueStrings(courses.map((c) => c.title)), [courses]);
  const readingTitleSuggestions = useMemo(() => uniqueStrings(readings.map((r) => r.title)), [readings]);

  const formSchemas = useMemo(
    () => ({
      tasks: {
        title: "Tarea",
        endpoint: "/api/ub/tasks",
        fields: [
          { name: "title", label: "Título", type: "text", required: true },
          { name: "status", label: "Estado", type: "select", suggestions: taskStatusOptions },
          { name: "project_ids", label: "Proyectos", type: "multi-select", options: projectOptions },
          { name: "area", label: "Área", type: "select", suggestions: areaNames },
          { name: "priority", label: "Prioridad", type: "select", suggestions: taskPriorityOptions },
          { name: "due", label: "Fecha límite", type: "date" },
          { name: "scheduled", label: "Programado", type: "date" },
          { name: "energy", label: "Energía", type: "select", suggestions: taskEnergyOptions },
          { name: "effort", label: "Esfuerzo", type: "select", suggestions: taskEffortOptions },
          { name: "tags", label: "Tags", type: "multi-text", suggestions: taskTagSuggestions, helper: "Separa por comas" },
        ],
      },
      projects: {
        title: "Proyecto",
        endpoint: "/api/ub/projects",
        fields: [
          { name: "title", label: "Título", type: "text", required: true },
          { name: "status", label: "Estado", type: "select", suggestions: projectStatusOptions },
          { name: "area", label: "Área", type: "select", suggestions: areaNames },
          { name: "due", label: "Fecha objetivo", type: "date" },
          { name: "progress", label: "Progreso (%)", type: "number" },
          { name: "lead", label: "Responsable", type: "select", suggestions: projectLeadOptions },
          { name: "tags", label: "Tags", type: "multi-text", suggestions: projectTagSuggestions, helper: "Separa por comas" },
        ],
      },
      areas: {
        title: "Área",
        endpoint: "/api/ub/areas",
        fields: [
          { name: "title", label: "Nombre", type: "text", required: true },
          { name: "owner", label: "Responsable", type: "select", suggestions: areaOwnerOptions },
          { name: "mission", label: "Misión", type: "textarea" },
          { name: "tags", label: "Tags", type: "multi-text", suggestions: areaTagSuggestions },
        ],
      },
      notes: {
        title: "Nota",
        endpoint: "/api/ub/notes",
        fields: [
          { name: "title", label: "Título", type: "text", required: true },
          { name: "type", label: "Tipo", type: "select", suggestions: noteTypeOptions },
          { name: "area", label: "Área", type: "select", suggestions: areaNames },
          { name: "project_ids", label: "Proyectos", type: "multi-select", options: projectOptions },
          { name: "tags", label: "Tags", type: "multi-text", suggestions: noteTagSuggestions },
        ],
      },
      goals: {
        title: "Objetivo",
        endpoint: "/api/ub/goals",
        fields: [
          { name: "title", label: "Título", type: "text", required: true },
          { name: "horizon", label: "Horizonte", type: "select", suggestions: goalHorizonOptions },
          { name: "progress", label: "Progreso (%)", type: "number" },
          { name: "area", label: "Área", type: "select", suggestions: areaNames },
          { name: "tags", label: "Tags", type: "multi-text", suggestions: goalTagSuggestions },
        ],
      },
      habits: {
        title: "Hábito",
        endpoint: "/api/ub/habits",
        fields: [
          { name: "title", label: "Nombre", type: "text", required: true },
          { name: "streak", label: "Racha", type: "number" },
          { name: "last", label: "Última vez", type: "date" },
          { name: "cadence", label: "Cadencia", type: "select", suggestions: habitCadenceOptions },
        ],
      },
      reviews: {
        title: "Revisión",
        endpoint: "/api/ub/reviews",
        fields: [
          { name: "title", label: "Título", type: "text", required: true },
          { name: "period", label: "Periodo", type: "textarea" },
          { name: "mood", label: "Estado", type: "select", suggestions: reviewMoodOptions },
          { name: "highlights", label: "Highlights", type: "textarea" },
          { name: "next", label: "Siguientes", type: "textarea" },
        ],
      },
      calendar: {
        title: "Evento",
        endpoint: "/api/ub/calendar",
        fields: [
          { name: "title", label: "Título", type: "text", required: true },
          { name: "start", label: "Inicio", type: "date", required: true },
          { name: "end", label: "Fin", type: "date" },
          { name: "related_ids", label: "Relacionado", type: "multi-select", options: calendarRelatedOptions },
        ],
      },
      "studies.courses": {
        title: "Curso",
        endpoint: "/api/ub/studies",
        collection: "courses",
        fields: [
          { name: "title", label: "Título", type: "text", required: true },
          { name: "status", label: "Estado", type: "select", suggestions: courseStatusOptions },
          { name: "area", label: "Área", type: "select", suggestions: courseAreaOptions },
          { name: "progress", label: "Progreso (%)", type: "number" },
          { name: "provider", label: "Proveedor", type: "select", suggestions: courseProviderOptions },
          { name: "tags", label: "Tags", type: "multi-text", suggestions: courseTagSuggestions },
        ],
      },
      "studies.readings": {
        title: "Lectura",
        endpoint: "/api/ub/studies",
        collection: "readings",
        fields: [
          { name: "title", label: "Título", type: "text", required: true },
          { name: "type", label: "Tipo", type: "select", suggestions: readingTypeOptions },
          { name: "course", label: "Curso", type: "select", suggestions: courseTitleSuggestions },
          { name: "status", label: "Estado", type: "select", suggestions: readingStatusOptions },
          { name: "source", label: "Fuente", type: "select", suggestions: readingSourceOptions },
          { name: "tags", label: "Tags", type: "multi-text", suggestions: readingTagSuggestions },
          { name: "due", label: "Para", type: "date" },
        ],
      },
      "studies.study_notes": {
        title: "Nota de estudio",
        endpoint: "/api/ub/studies",
        collection: "study_notes",
        fields: [
          { name: "title", label: "Título", type: "text", required: true },
          { name: "course", label: "Curso", type: "select", suggestions: courseTitleSuggestions },
          { name: "reading", label: "Lectura", type: "select", suggestions: readingTitleSuggestions },
          { name: "concepts", label: "Conceptos", type: "multi-text", suggestions: studyConceptSuggestions },
          { name: "tags", label: "Tags", type: "multi-text", suggestions: studyNoteTagSuggestions },
        ],
      },
      "studies.resources": {
        title: "Recurso",
        endpoint: "/api/ub/studies",
        collection: "resources",
        fields: [
          { name: "title", label: "Título", type: "text", required: true },
          { name: "type", label: "Tipo", type: "select", suggestions: resourceTypeOptions },
          { name: "link", label: "Enlace", type: "text", placeholder: "https://" },
          { name: "course", label: "Curso", type: "select", suggestions: courseTitleSuggestions },
          { name: "tags", label: "Tags", type: "multi-text", suggestions: resourceTagSuggestions },
        ],
      },
      "studies.exams": {
        title: "Evaluación",
        endpoint: "/api/ub/studies",
        collection: "exams",
        fields: [
          { name: "title", label: "Título", type: "text", required: true },
          { name: "course", label: "Curso", type: "select", suggestions: courseTitleSuggestions },
          { name: "date", label: "Fecha", type: "date" },
          { name: "weight", label: "Ponderación", type: "number" },
          { name: "status", label: "Estado", type: "select", suggestions: examStatusOptions },
          { name: "tags", label: "Tags", type: "multi-text", suggestions: examTagSuggestions },
        ],
      },
      "studies.flashcards": {
        title: "Flashcard",
        endpoint: "/api/ub/studies",
        collection: "flashcards",
        fields: [
          { name: "front", label: "Frente", type: "textarea", required: true },
          { name: "back", label: "Reverso", type: "textarea", required: true },
          { name: "deck", label: "Baraja", type: "select", suggestions: flashcardDeckOptions },
          { name: "ease", label: "Facilidad", type: "number", placeholder: "2.5" },
          { name: "interval", label: "Intervalo (días)", type: "number" },
          { name: "due", label: "Revisión", type: "date" },
        ],
      },
      "studies.sessions": {
        title: "Sesión",
        endpoint: "/api/ub/studies",
        collection: "sessions",
        fields: [
          { name: "date", label: "Fecha", type: "date", required: true },
          { name: "duration", label: "Duración (min)", type: "number" },
          { name: "course", label: "Curso", type: "select", suggestions: courseTitleSuggestions },
          { name: "topic", label: "Tema", type: "textarea" },
          { name: "notes", label: "Notas", type: "textarea" },
        ],
      },
    }),
    [
      taskStatusOptions,
      projectOptions,
      areaNames,
      taskPriorityOptions,
      taskEnergyOptions,
      taskEffortOptions,
      taskTagSuggestions,
      projectStatusOptions,
      projectLeadOptions,
      projectTagSuggestions,
      areaOwnerOptions,
      areaTagSuggestions,
      noteTypeOptions,
      noteTagSuggestions,
      goalHorizonOptions,
      goalTagSuggestions,
      habitCadenceOptions,
      reviewMoodOptions,
      calendarRelatedOptions,
      courseStatusOptions,
      courseAreaOptions,
      courseProviderOptions,
      courseTagSuggestions,
      readingTypeOptions,
      readingStatusOptions,
      readingSourceOptions,
      readingTagSuggestions,
      studyConceptSuggestions,
      studyNoteTagSuggestions,
      resourceTypeOptions,
      resourceTagSuggestions,
      examStatusOptions,
      examTagSuggestions,
      flashcardDeckOptions,
      courseTitleSuggestions,
      readingTitleSuggestions,
    ],
  );

  useEffect(() => {
    if (!modal) {
      setModalForm({});
      return;
    }
    const schema = formSchemas[modal.entity];
    if (!schema) return;
    const initial = {};
    schema.fields.forEach((field) => {
      const value = modal.record?.[field.name];
      if (field.type === "multi-text") {
        initial[field.name] = Array.isArray(value) ? value.join(", ") : value ? String(value) : "";
      } else if (field.type === "multi-select") {
        initial[field.name] = Array.isArray(value) ? value : value ? [value] : [];
      } else if (field.type === "number") {
        initial[field.name] = value ?? "";
      } else if (field.type === "date") {
        initial[field.name] = value ? String(value).slice(0, 10) : "";
      } else {
        initial[field.name] = value ?? "";
      }
    });
    setModalError(null);
    setModalForm(initial);
  }, [modal, formSchemas]);

  const openModal = useCallback((entity, mode, record = {}) => {
    setModal({ entity, mode, record });
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
    setModalForm({});
    setModalError(null);
    setModalLoading(false);
  }, []);

  const updateModalField = (name, value) => {
    setModalForm((prev) => ({ ...prev, [name]: value }));
  };

  const serializeForm = (schema, values) => {
    const payload = {};
    schema.fields.forEach((field) => {
      let raw = values[field.name];
      if (field.type === "multi-text") {
        if (Array.isArray(raw)) {
          raw = raw;
        } else if (typeof raw === "string") {
          raw = raw
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v.length > 0);
        } else {
          raw = [];
        }
        payload[field.name] = raw;
      } else if (field.type === "multi-select") {
        if (!raw) payload[field.name] = [];
        else if (Array.isArray(raw)) payload[field.name] = raw;
        else payload[field.name] = [raw];
      } else if (field.type === "number") {
        if (raw === "" || raw === null || raw === undefined) {
          payload[field.name] = null;
        } else {
          const num = Number(raw);
          payload[field.name] = Number.isFinite(num) ? num : null;
        }
      } else if (field.type === "date") {
        payload[field.name] = raw ? raw : null;
      } else {
        payload[field.name] = raw === "" ? null : raw;
      }
    });
    if (schema.collection) payload.collection = schema.collection;
    return payload;
  };

  const submitModal = async (event) => {
    event.preventDefault();
    if (!modal) return;
    const schema = formSchemas[modal.entity];
    if (!schema) return;
    const payload = serializeForm(schema, modalForm);
    if (modal.mode === "edit" && modal.record?.id) payload.id = modal.record.id;
    const headers = { "Content-Type": "application/json" };
    if (process.env.NEXT_PUBLIC_UB_API_KEY) headers["x-api-key"] = process.env.NEXT_PUBLIC_UB_API_KEY;
    const url = schema.collection ? `${schema.endpoint}?collection=${schema.collection}` : schema.endpoint;
    setModalLoading(true);
    setModalError(null);
    try {
      const res = await fetch(url, {
        method: modal.mode === "create" ? "POST" : "PATCH",
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo guardar");
      }
      await syncAll();
      closeModal();
    } catch (err) {
      console.error(err);
      setModalError(err.message || "Error");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = useCallback(
    async (entityKey, record) => {
      const schema = formSchemas[entityKey];
      if (!schema || !record?.id) return;
      if (typeof window !== "undefined") {
        const confirmed = window.confirm("¿Eliminar este registro de Notion?");
        if (!confirmed) return;
      }
      const headers = { "Content-Type": "application/json" };
      if (process.env.NEXT_PUBLIC_UB_API_KEY) headers["x-api-key"] = process.env.NEXT_PUBLIC_UB_API_KEY;
      const url = schema.collection ? `${schema.endpoint}?collection=${schema.collection}` : schema.endpoint;
      try {
        const res = await fetch(url, {
          method: "DELETE",
          headers,
          body: JSON.stringify({ id: record.id, collection: schema.collection }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "No se pudo eliminar");
        }
        await syncAll();
      } catch (err) {
        console.error(err);
        if (typeof window !== "undefined") window.alert(err.message || "Error eliminando registro");
      }
    },
    [formSchemas, syncAll],
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", themeDark);
  }, [themeDark]);

  const syncAll = useCallback(async () => {
    const [t, p, a, n, g, h, r, c, mp, st] = await Promise.all([
      ubGet("/api/ub/tasks",     { q: globalQuery, expand: "relations" }, MOCK.tasks),
      ubGet("/api/ub/projects",  { q: globalQuery },                      MOCK.projects),
      ubGet("/api/ub/areas",     { q: globalQuery },                      MOCK.areas),
      ubGet("/api/ub/notes",     { q: globalQuery, expand: "relations" }, MOCK.notes),
      ubGet("/api/ub/goals",     { q: globalQuery },                      MOCK.goals),
      ubGet("/api/ub/habits",    { q: globalQuery },                      MOCK.habits),
      ubGet("/api/ub/reviews",   { q: globalQuery },                      MOCK.reviews),
      ubGet("/api/ub/calendar",  { q: globalQuery, expand: "relations" }, MOCK.calendar),
      ubGet("/api/ub/mapping",   {},                                      DEFAULT_MAPPING),
      ubGet("/api/ub/studies",   { q: globalQuery }, { courses: [], readings: [], study_notes: [], resources: [], exams: [], flashcards: [], sessions: [] }),
    ]);
    setTasks(t); setProjects(p); setAreas(a); setNotes(n); setGoals(g); setHabits(h); setReviews(r); setCalendar(c);
    setMapping(mp);
    setCourses(st.courses || []); setReadings(st.readings || []); setStudyNotes(st.study_notes || []);
    setResources(st.resources || []); setExams(st.exams || []); setFlashcards(st.flashcards || []); setSessions(st.sessions || []);
    setLastSyncISO(new Date().toISOString());
  }, [globalQuery]);

  // Tracks initial sync to avoid debouncing the first load.
  const didInitialSync = useRef(false);

  useEffect(() => {
    if (!didInitialSync.current) {
      didInitialSync.current = true;
      void syncAll();
      return;
    }
    const id = setTimeout(() => { void syncAll(); }, 350);
    return () => clearTimeout(id);
  }, [globalQuery, syncAll]);

  async function saveMapping() {
  try {
    const res = await fetch("/api/ub/mapping", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Incluye la clave sólo si existe una API key
        "x-api-key": process.env.NEXT_PUBLIC_UB_API_KEY ?? "",
      },
      body: JSON.stringify(mapping),
    });
    if (!res.ok) throw new Error("save failed");
    await syncAll();
  } catch (e) {
    console.error(e);
  }
}


  function Field({ label, value, onChange, placeholder = "" }) {
    return (
      <label className="text-xs md:text-sm">
        {label}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-2xl px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70"
          placeholder={placeholder}
        />
      </label>
    );
  }
  function DbEditor({ obj, onSet, prefix = "db" }) {
    return (
      <div className="grid md:grid-cols-2 gap-3">
        {Object.entries(obj).map(([k, v]) => (
          <div key={k}>
            {typeof v === "string" ? (
              <Field label={`DB ${k}`} value={v} onChange={(val) => onSet(`${prefix}.${k}`, val)} placeholder="database_id" />
            ) : (
              <div className="rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 p-3">
                <div className="text-sm font-medium mb-2">{k}</div>
                <DbEditor obj={v} onSet={onSet} prefix={`${prefix}.${k}`} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
  function PropsEditor({ obj, onSet, path }) {
    return (
      <div className="grid grid-cols-2 gap-2 text-xs">
        {Object.entries(obj).map(([k, v]) => (
          <div key={k}>
            {typeof v === "string" ? (
              <label>
                {k}
                <input
                  value={v}
                  onChange={(e) => onSet(`${path}.${k}`, e.target.value)}
                  className="mt-1 w-full rounded-xl px-2 py-1 border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70"
                />
              </label>
            ) : (
              <div className="rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 p-3 col-span-2">
                <div className="text-sm font-medium mb-2">{k}</div>
                <PropsEditor obj={v} onSet={onSet} path={`${path}.${k}`} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  function SettingsPage({ mapping, setMapping, onSync }) {
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState(null);
    const set = (path, value) => {
      setMapping((m) => {
        const next = JSON.parse(JSON.stringify(m));
        const keys = path.split(".");
        let cur = next;
        for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
        cur[keys[keys.length - 1]] = value;
        return next;
      });
    };
    async function handleSave() {
      try { setSaving(true); await saveMapping(); setSavedAt(new Date().toISOString()); }
      finally { setSaving(false); }
    }
    return (
      <div className="space-y-6">
        <Card title="Conexión a Notion" subtitle="Ultimate Brain" right={<Badge><Database className="inline h-3 w-3 mr-1" /> Notion</Badge>}>
          <DbEditor obj={mapping.db} onSet={set} prefix="db" />
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <button onClick={onSync} className="px-4 py-2 rounded-2xl border border-neutral-300 dark:border-neutral-700 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Probar sincronización
            </button>
            <button onClick={handleSave} className="px-4 py-2 rounded-2xl border border-neutral-300 dark:border-neutral-700 flex items-center gap-2" disabled={saving}>
              {saving ? "Guardando…" : "Guardar mapping"}
            </button>
            {savedAt && <Badge>Guardado: {new Date(savedAt).toLocaleString("es-CL", { timeZone: CL_TZ })}</Badge>}
          </div>
        </Card>
        <Card title="Mapeo de propiedades" subtitle="Ajusta a los nombres exactos en tu UB">
          {Object.entries(mapping.props).map(([dbKey, props]) => (
            <div key={dbKey} className="rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 p-3 mb-4">
              <div className="text-sm font-medium mb-2">{dbKey}</div>
              <PropsEditor obj={props} onSet={set} path={`props.${dbKey}`} />
            </div>
          ))}
        </Card>
      </div>
    );
  }

  function render() {
    switch (page) {
      case "today":
        return <TodayPage tasks={tasks} calendar={calendar} />;
      case "tasks":
        return (
          <TasksPage
            tasks={tasks}
            onCreate={() => openModal("tasks", "create")}
            onEdit={(row) => openModal("tasks", "edit", row)}
            onDelete={(row) => handleDelete("tasks", row)}
          />
        );
      case "projects":
        return (
          <ProjectsPage
            projects={projects}
            onCreate={() => openModal("projects", "create")}
            onEdit={(row) => openModal("projects", "edit", row)}
            onDelete={(row) => handleDelete("projects", row)}
          />
        );
      case "areas":
        return (
          <AreasPage
            areas={areas}
            onCreate={() => openModal("areas", "create")}
            onEdit={(row) => openModal("areas", "edit", row)}
            onDelete={(row) => handleDelete("areas", row)}
          />
        );
      case "content":
        return <ContentPage entries={notes} />;
      case "notes":
        return (
          <NotesPage
            notes={notes}
            onCreate={() => openModal("notes", "create")}
            onEdit={(row) => openModal("notes", "edit", row)}
            onDelete={(row) => handleDelete("notes", row)}
          />
        );
      case "goals":
        return (
          <GoalsPage
            goals={goals}
            onCreate={() => openModal("goals", "create")}
            onEdit={(row) => openModal("goals", "edit", row)}
            onDelete={(row) => handleDelete("goals", row)}
          />
        );
      case "habits":
        return (
          <HabitsPage
            habits={habits}
            onCreate={() => openModal("habits", "create")}
            onEdit={(row) => openModal("habits", "edit", row)}
            onDelete={(row) => handleDelete("habits", row)}
          />
        );
      case "reviews":
        return (
          <ReviewsPage
            reviews={reviews}
            onCreate={() => openModal("reviews", "create")}
            onEdit={(row) => openModal("reviews", "edit", row)}
            onDelete={(row) => handleDelete("reviews", row)}
          />
        );
      case "calendar":
        return (
          <CalendarPage
            calendar={calendar}
            onCreate={() => openModal("calendar", "create")}
            onEdit={(row) => openModal("calendar", "edit", row)}
            onDelete={(row) => handleDelete("calendar", row)}
          />
        );
      case "studies":
        return (
          <StudiesPage
            courses={courses}
            readings={readings}
            studyNotes={studyNotes}
            resources={resources}
            exams={exams}
            flashcards={flashcards}
            sessions={sessions}
            onCreate={(collection) => openModal(`studies.${collection}`, "create")}
            onEdit={(collection, row) => openModal(`studies.${collection}`, "edit", row)}
            onDelete={(collection, row) => handleDelete(`studies.${collection}`, row)}
          />
        );
      case "settings":return <SettingsPage mapping={mapping} setMapping={setMapping} onSync={syncAll} />;
      default: return null;
    }
  }

  const activeSchema = modal ? formSchemas[modal.entity] : null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900 text-neutral-900 dark:text-neutral-100">
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-950/40 border-b border-neutral-200/60 dark:border-neutral-800/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-neutral-900 dark:bg-white" />
            <div>
              <div className="text-lg font-semibold">Ultimate Brain – Control Center</div>
              <div className="text-xs text-neutral-500">Suite nativa para tu Notion (UB)</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60">
              <Search className="h-4 w-4" />
              <input placeholder="Buscar…" className="bg-transparent outline-none" value={globalQuery} onChange={(e)=> setGlobalQuery(e.target.value)} />
            </div>
            <Badge><Database className="inline h-3 w-3 mr-1" /> Notion</Badge>
            <Badge>Última sync: {new Date(lastSyncISO).toLocaleString("es-CL", { timeZone: CL_TZ })}</Badge>
            <button aria-label="toggle theme" onClick={() => setThemeDark((v) => !v)} className="h-9 w-9 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">🌓</button>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 py-6 grid lg:grid-cols-[220px_1fr] gap-6">
        <aside className="lg:sticky lg:top-[84px] h-max">
          <nav className="space-y-1">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => setPage(n.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-sm mb-1 transition-colors ${page === n.id
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white"
                  : "bg-white/70 dark:bg-neutral-900/70 border-neutral-200/60 dark:border-neutral-800/60"}`}>
                {n.icon}<span>{n.label}</span>
              </button>
            ))}
          </nav>
          <button onClick={syncAll} className="mt-3 w-full px-3 py-2 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-center gap-2 text-sm">
            <RefreshCw className="h-4 w-4" /> Sincronizar todo
          </button>
        </aside>
        <main className="min-h-[60vh]">{render()}</main>
      </div>
      <footer className="max-w-7xl mx-auto px-6 pb-10 text-xs text-neutral-500">
        Esta UI usa endpoints <code className="px-1 rounded bg-neutral-200/60 dark:bg-neutral-800/60">/api/ub/*</code> y un <em>mapping</em> de propiedades (persistible) para calzar al 100% con tu Ultimate Brain.
      </footer>
      {modal && (
        <EntityModal
          modal={modal}
          schema={activeSchema}
          values={modalForm}
          onChange={updateModalField}
          onSubmit={submitModal}
          onClose={closeModal}
          onDelete={() => handleDelete(modal.entity, modal.record)}
          error={modalError}
          loading={modalLoading}
        />
      )}
    </div>
  );
}
