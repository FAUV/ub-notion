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

const CL_TZ = "America/Santiago";

const DEFAULT_MAPPING = {
  db: {
    tasks: "",
    projects: "",
    areas: "",
    notes: "",
    goals: "",
    habits: "",
    reviews: "",
    calendar: "",
    studies: {
      courses: "",
      modules: "",
      lessons: "",
      readings: "",
      study_notes: "",
      resources: "",
      exams: "",
      flashcards: "",
      sessions: "",
    },
  },
  props: {
    tasks: {
      title: "Tarea",
      status: "Estado",
      project: "Proyecto",
      area: "Área",
      priority: "Prioridad",
      due: "Fecha límite",
      scheduled: "Programado",
      energy: "Energía",
      effort: "Esfuerzo",
      tags: "Tags",
      created: "Creado",
      updated: "Actualizado",
    },
    projects: {
      title: "Proyecto",
      status: "Estado",
      area: "Área",
      due: "Fecha objetivo",
      progress: "Progreso",
      lead: "Responsable",
      tags: "Tags",
    },
    areas: {
      title: "Área",
      owner: "Responsable",
      mission: "Misión",
      tags: "Tags",
    },
    notes: {
      title: "Título",
      type: "Tipo",
      area: "Área",
      project: "Proyecto",
      tags: "Tags",
      updated: "Actualizado",
    },
    goals: {
      title: "Objetivo",
      horizon: "Horizonte",
      progress: "Progreso",
      area: "Área",
      tags: "Tags",
    },
    habits: {
      title: "Hábito",
      streak: "Racha",
      last: "Última vez",
      cadence: "Cadencia",
    },
    reviews: {
      title: "Revisión",
      period: "Periodo",
      mood: "Estado",
      highlights: "Highlights",
      next: "Siguientes",
    },
    calendar: {
      title: "Evento",
      start: "Inicio",
      end: "Fin",
      related: "Relacionado",
    },
    studies: {
      courses: {
        title: "Curso",
        status: "Estado",
        area: "Área",
        progress: "Progreso",
        provider: "Proveedor",
        id_class: "ID Class",
        tags: "Tags",
      },
      modules: {
        title: "Módulo",
        status: "Estado",
        course: "Curso",
        order: "Orden",
      },
      readings: {
        title: "Lectura",
        type: "Tipo",
        course: "Curso",
        status: "Estado",
        source: "Fuente",
        tags: "Tags",
        due: "Para",
      },
      lessons: {
        title: "Lección",
        module: "Módulo",
        course: "Curso",
        status: "Estado",
        order: "Orden",
      },
      study_notes: {
        title: "Nota",
        course: "Curso",
        reading: "Lectura",
        concepts: "Conceptos",
        tags: "Tags",
        updated: "Actualizado",
      },
      resources: {
        title: "Recurso",
        type: "Tipo",
        link: "Enlace",
        course: "Curso",
        tags: "Tags",
      },
      exams: {
        title: "Evaluación",
        course: "Curso",
        date: "Fecha",
        weight: "Ponderación",
        status: "Estado",
        tags: "Tags",
      },
      flashcards: {
        front: "Frente",
        back: "Reverso",
        deck: "Baraja",
        ease: "Facilidad",
        interval: "Intervalo",
        due: "Revisión",
      },
      sessions: {
        date: "Fecha",
        duration: "Duración(min)",
        course: "Curso",
        topic: "Tema",
        notes: "Notas",
      },
    },
  },
};

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

function TasksPage({ tasks }) {
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
      <Card title="Lista" subtitle="Vista de tareas" right={<Badge>{filtered.length}</Badge>}>
        <DataTable columns={cols} rows={filtered} />
      </Card>
    </div>
  );
}

function ProjectsPage({ projects }) {
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
  ];
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Stat label="Activos" value={projects.filter((p) => p.status === "Activo").length} />
        <Stat label="En espera" value={projects.filter((p) => p.status === "En espera").length} />
        <Stat label="Hechos" value={projects.filter((p) => p.status === "Hecho").length} />
        <Stat label="Progreso medio" value={Math.round(projects.reduce((s, p) => s + p.progress, 0) / (projects.length || 1))} percent />
      </div>
      <Card title="Proyectos" subtitle="Estado y avance" right={<Badge>{projects.length}</Badge>}>
        <DataTable columns={cols} rows={projects} />
      </Card>
    </div>
  );
}

function AreasPage({ areas }) {
  const cols = [
    { key: "title", title: "Área" },
    { key: "owner", title: "Responsable" },
    { key: "mission", title: "Misión", render: (v) => v || "" },
    { key: "tags", title: "Tags", render: (v) => (v || []).join(", ") },
  ];
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Total de áreas" value={areas.length} />
        <Stat label="Con responsable" value={areas.filter((a) => a.owner).length} />
        <Stat label="Sin misión" value={areas.filter((a) => !a.mission).length} />
      </div>
      <Card title="Áreas" subtitle="Responsables y propósito" right={<Badge>{areas.length}</Badge>}>
        <DataTable columns={cols} rows={areas} />
      </Card>
    </div>
  );
}

function NotesPage({ notes }) {
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
  ];
  return (
    <div className="space-y-6">
      <Card
        title="Notas y Recursos"
        subtitle="Inbox y clasificaciones"
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

function GoalsPage({ goals }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {goals.map((g) => (
          <Card key={g.id} title={g.title} subtitle={`${g.horizon} · ${g.area}`} right={<Badge>{g.progress}%</Badge>}>
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

function HabitsPage({ habits }) {
  const cols = [
    { key: "title", title: "Hábito" },
    { key: "streak", title: "Racha" },
    { key: "last", title: "Última vez" },
    { key: "cadence", title: "Cadencia" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Racha más alta" value={Math.max(0, ...habits.map((h) => h.streak))} />
        <Stat label="Hábitos activos" value={habits.length} />
        <Stat label="Hoy completados" value={habits.filter((h) => h.last === todayISO).length} />
      </div>
      <Card title="Hábitos" subtitle="Seguimiento">
        <DataTable columns={cols} rows={habits} />
      </Card>
    </div>
  );
}

function ReviewsPage({ reviews }) {
  const cols = [
    { key: "title", title: "Revisión" },
    { key: "period", title: "Periodo" },
    { key: "mood", title: "Estado" },
    { key: "highlights", title: "Highlights" },
    { key: "next", title: "Siguientes" },
  ];
  return (
    <div className="space-y-6">
      <Card title="Revisiones" subtitle="Weekly/Monthly">
        <DataTable columns={cols} rows={reviews} />
      </Card>
    </div>
  );
}

function CalendarPage({ calendar }) {
  const cols = [
    { key: "title", title: "Evento" },
    { key: "start", title: "Inicio", render: (v) => formatDateCL(v) + " " + formatTimeCL(v) },
    { key: "end", title: "Fin", render: (v) => formatDateCL(v) + " " + formatTimeCL(v) },
    { key: "related", title: "Relacionado" },
  ];
  return (
    <div className="space-y-6">
      <Card title="Calendario" subtitle="Eventos sincronizados" right={<Badge>{calendar.length}</Badge>}>
        <DataTable columns={cols} rows={calendar} />
      </Card>
    </div>
  );
}

function StudiesPage({ courses, modules, lessons, readings, studyNotes, resources, exams, flashcards, sessions }) {
  const tz = CL_TZ;

  const activeCourses = courses.filter((c) => (c.status ?? "Activo") !== "Completado");
  const upcomingExams = exams
    .filter((e) => e.date && new Date(e.date) >= new Date(new Date().toISOString().slice(0, 10)))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .slice(0, 6);

  const activeModules = modules.filter((m) => (m.status ?? "Activo") !== "Completado");
  const pendingLessons = lessons.filter((l) => (l.status ?? "Activo") !== "Completado");

  const minutesLast14d = sessions
    .filter((s) => s.date)
    .filter((s) => new Date().getTime() - new Date(s.date).getTime() <= 14 * 86400000)
    .reduce((acc, s) => acc + (Number(s.duration) || 0), 0);

  const colsCourses = [
    { key: "title", title: "Curso" },
    { key: "id_class", title: "ID Class" },
    { key: "status", title: "Estado" },
    { key: "progress", title: "Progreso", render: (v) => `${Math.round(v || 0)}%` },
    { key: "area", title: "Área" },
    { key: "provider", title: "Proveedor" },
    { key: "tags", title: "Tags", render: (v) => (v || []).join(", ") },
  ];
  const colsReadings = [
    { key: "title", title: "Lectura" },
    { key: "course", title: "Curso" },
    { key: "type", title: "Tipo" },
    { key: "status", title: "Estado" },
    { key: "due", title: "Para", render: (v) => (v ? formatDateCL(v) : "") },
    { key: "tags", title: "Tags", render: (v) => (v || []).join(", ") },
  ];
  const colsSessions = [
    { key: "date", title: "Fecha", render: (v) => (v ? new Date(v).toLocaleString("es-CL", { timeZone: tz }) : "") },
    { key: "duration", title: "Duración (min)" },
    { key: "course", title: "Curso" },
    { key: "topic", title: "Tema" },
    { key: "notes", title: "Notas" },
  ];
  const colsModules = [
    { key: "title", title: "Módulo" },
    { key: "course", title: "Curso" },
    { key: "status", title: "Estado" },
    { key: "order", title: "Orden" },
  ];
  const colsLessons = [
    { key: "title", title: "Lección" },
    { key: "module", title: "Módulo" },
    { key: "course", title: "Curso" },
    { key: "status", title: "Estado" },
    { key: "order", title: "Orden" },
  ];
  const colsNotes = [
    { key: "title", title: "Nota" },
    { key: "course", title: "Curso" },
    { key: "reading", title: "Lectura" },
    { key: "concepts", title: "Conceptos", render: (v) => (v || []).join(", ") },
    { key: "tags", title: "Tags", render: (v) => (v || []).join(", ") },
    { key: "updated", title: "Actualizado", render: (v) => (v ? new Date(v).toLocaleString("es-CL", { timeZone: tz }) : "") },
  ];
  const colsResources = [
    { key: "title", title: "Recurso" },
    { key: "type", title: "Tipo" },
    { key: "course", title: "Curso" },
    { key: "link", title: "Enlace" },
    { key: "tags", title: "Tags", render: (v) => (v || []).join(", ") },
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Stat label="Cursos activos" value={activeCourses.length} />
        <Stat label="Lecturas en progreso" value={readings.filter((r) => r.status !== "Completado").length} />
        <Stat label="Min últimos 14 días" value={minutesLast14d} />
        <Stat label="Exámenes próximos" value={upcomingExams.length} />
        <Stat label="Módulos activos" value={activeModules.length} />
        <Stat label="Lecciones pendientes" value={pendingLessons.length} />
      </div>

      <Card title="Cursos" subtitle="Resumen general" right={<Badge>{courses.length}</Badge>}>
        <DataTable columns={colsCourses} rows={courses} />
      </Card>

      <Card title="Progreso por curso" subtitle="% completado">
        <div className="grid md:grid-cols-2 gap-4">
          {activeCourses.map((c) => (
            <div key={c.id} className="rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 p-3">
              <div className="flex justify-between text-sm font-medium">
                <span className="truncate">{c.title}</span>
                <span>{Math.round(c.progress || 0)}%</span>
              </div>
              {c.id_class && <div className="text-xs mt-1 text-neutral-500">{c.id_class}</div>}
              <div className="mt-2 h-2 rounded bg-neutral-200/60 dark:bg-neutral-800/60">
                <div className="h-2 rounded bg-neutral-900 dark:bg-white" style={{ width: `${Math.min(100, Math.max(0, c.progress || 0))}%` }} />
              </div>
              <div className="text-xs mt-2 text-neutral-500">{c.provider || c.area || ""}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Módulos" subtitle="Orden y estado">
          <DataTable columns={colsModules} rows={[...modules].sort((a,b)=> Number(a.order??0) - Number(b.order??0))} />
        </Card>
        <Card title="Lecciones" subtitle="Progreso detallado">
          <DataTable columns={colsLessons} rows={[...lessons].sort((a,b)=> Number(a.order??0) - Number(b.order??0))} />
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Próximas evaluaciones" subtitle="6 siguientes">
          <ul className="space-y-2 text-sm">
            {upcomingExams.map((e) => (
              <li key={e.id} className="flex items-center justify-between">
                <span className="truncate">{e.title} — {e.course}</span>
                <span className="tabular-nums">{e.date ? formatDateCL(e.date) : ""}</span>
              </li>
            ))}
            {upcomingExams.length===0 && <div className="text-xs text-neutral-500">Sin evaluaciones próximas</div>}
          </ul>
        </Card>
        <Card title="Flashcards pendientes (hoy)">
          <ul className="space-y-2 text-sm">
            {flashcards.filter((f)=> f.due && f.due <= new Date().toISOString().slice(0,10)).slice(0,10).map((f)=>(
              <li key={f.id} className="flex items-center justify-between">
                <span className="truncate">{f.front}</span>
              </li>
            ))}
            {flashcards.length===0 && <div className="text-xs text-neutral-500">Sin tarjetas pendientes</div>}
          </ul>
        </Card>
      </div>

      <Card title="Lecturas en progreso">
        <DataTable columns={colsReadings} rows={readings} />
      </Card>

      <Card title="Sesiones de estudio (recientes)">
        <DataTable columns={colsSessions} rows={sessions.sort((a,b)=> String(b.date||"").localeCompare(String(a.date||""))).slice(0,20)} />
      </Card>

      <Card title="Notas de estudio (últimas)">
        <DataTable columns={colsNotes} rows={studyNotes.sort((a,b)=> String(b.updated||"").localeCompare(String(a.updated||""))).slice(0,20)} />
      </Card>

      <Card title="Recursos">
        <DataTable columns={colsResources} rows={resources} />
      </Card>
    </div>
  );
}

const MOCK = {
  tasks: [], projects: [], areas: [], notes: [], goals: [], habits: [], reviews: [], calendar: [],
  studies: {
    courses: [
      { id: "mock-course-1", title: "Curso demo de enfoque", status: "Activo", area: "Productividad", progress: 60, provider: "Coursera", id_class: "EDU-101", tags: ["Hábitos"] },
      { id: "mock-course-2", title: "Introducción a IA", status: "Completado", area: "Tecnología", progress: 100, provider: "Platzi", id_class: "AI-201", tags: ["IA", "Tech"] },
    ],
    modules: [], lessons: [], readings: [], study_notes: [], resources: [], exams: [], flashcards: [], sessions: [],
  }
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
  const [modules, setModules] = useState(MOCK.studies.modules);
  const [lessons, setLessons] = useState(MOCK.studies.lessons);
  const [readings, setReadings] = useState(MOCK.studies.readings);
  const [studyNotes, setStudyNotes] = useState(MOCK.studies.study_notes);
  const [resources, setResources] = useState(MOCK.studies.resources);
  const [exams, setExams] = useState(MOCK.studies.exams);
  const [flashcards, setFlashcards] = useState(MOCK.studies.flashcards);
  const [sessions, setSessions] = useState(MOCK.studies.sessions);

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
      ubGet("/api/ub/studies",   { q: globalQuery }, { courses: [], modules: [], lessons: [], readings: [], study_notes: [], resources: [], exams: [], flashcards: [], sessions: [] }),
    ]);
    setTasks(t); setProjects(p); setAreas(a); setNotes(n); setGoals(g); setHabits(h); setReviews(r); setCalendar(c);
    setMapping(mp);
    setCourses(st.courses || []); setModules(st.modules || []); setLessons(st.lessons || []);
    setReadings(st.readings || []); setStudyNotes(st.study_notes || []);
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
      case "today":   return <TodayPage tasks={tasks} calendar={calendar} />;
      case "tasks":   return <TasksPage tasks={tasks} />;
      case "projects":return <ProjectsPage projects={projects} />;
      case "areas":   return <AreasPage areas={areas} />;
      case "content": return <ContentPage entries={notes} />;
      case "notes":   return <NotesPage notes={notes} />;
      case "goals":   return <GoalsPage goals={goals} />;
      case "habits":  return <HabitsPage habits={habits} />;
      case "reviews": return <ReviewsPage reviews={reviews} />;
      case "calendar":return <CalendarPage calendar={calendar} />;
      case "studies": return <StudiesPage
                              courses={courses} modules={modules} lessons={lessons}
                              readings={readings} studyNotes={studyNotes}
                              resources={resources} exams={exams} flashcards={flashcards} sessions={sessions} />;
      case "settings":return <SettingsPage mapping={mapping} setMapping={setMapping} onSync={syncAll} />;
      default: return null;
    }
  }

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
    </div>
  );
}
