"use client";
import React from "react";
import BaseEntityForm from "./BaseEntityForm";

const fields = [
  { name: "title", label: "Proyecto", type: "text", required: true },
  { name: "status", label: "Estado", type: "text" },
  { name: "area", label: "Área", type: "text" },
  { name: "due", label: "Fecha objetivo", type: "date" },
  { name: "progress", label: "Progreso", type: "number", helper: "Valor numérico 0-100" },
  { name: "lead", label: "Responsable", type: "text" },
  { name: "tags", label: "Tags", type: "multi", helper: "Separa con comas" },
];

export default function ProjectForm(props) {
  return <BaseEntityForm entity="projects" fields={fields} {...props} />;
}
