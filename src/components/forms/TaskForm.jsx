"use client";
import React from "react";
import BaseEntityForm from "./BaseEntityForm";

const fields = [
  { name: "title", label: "Título", type: "text", required: true, placeholder: "Escribe un título" },
  { name: "status", label: "Estado", type: "text", placeholder: "Por hacer" },
  { name: "priority", label: "Prioridad", type: "text", placeholder: "Alta/Media/Baja" },
  { name: "area", label: "Área", type: "text" },
  { name: "due", label: "Fecha límite", type: "date" },
  { name: "scheduled", label: "Programado", type: "date" },
  { name: "project", label: "IDs de proyecto", type: "relation", helper: "Introduce los IDs separados por coma" },
  { name: "tags", label: "Tags", type: "multi", helper: "Separa cada tag con coma" },
  { name: "energy", label: "Energía", type: "text" },
  { name: "effort", label: "Esfuerzo", type: "text" },
];

export default function TaskForm(props) {
  return <BaseEntityForm entity="tasks" fields={fields} {...props} />;
}
