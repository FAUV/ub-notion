"use client";
import React from "react";
import BaseEntityForm from "./BaseEntityForm";

const fields = [
  { name: "title", label: "Evento", type: "text", required: true },
  { name: "start", label: "Inicio", type: "datetime" },
  { name: "end", label: "Fin", type: "datetime" },
  { name: "related", label: "IDs relacionados", type: "relation", helper: "IDs de páginas separados por coma" },
];

export default function CalendarForm(props) {
  return <BaseEntityForm entity="calendar" fields={fields} {...props} />;
}
