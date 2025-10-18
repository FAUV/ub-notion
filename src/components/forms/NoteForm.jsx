"use client";
import React from "react";
import BaseEntityForm from "./BaseEntityForm";

const fields = [
  { name: "title", label: "Título", type: "text", required: true },
  { name: "type", label: "Tipo", type: "text" },
  { name: "area", label: "Área", type: "text" },
  { name: "project", label: "IDs de proyecto", type: "relation", helper: "IDs separados por coma" },
  { name: "tags", label: "Tags", type: "multi", helper: "Separa con comas" },
];

export default function NoteForm(props) {
  return <BaseEntityForm entity="notes" fields={fields} {...props} />;
}
