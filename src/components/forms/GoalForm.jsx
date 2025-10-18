"use client";
import React from "react";
import BaseEntityForm from "./BaseEntityForm";

const fields = [
  { name: "title", label: "Objetivo", type: "text", required: true },
  { name: "horizon", label: "Horizonte", type: "text" },
  { name: "progress", label: "Progreso", type: "number", helper: "Porcentaje 0-100" },
  { name: "area", label: "Área", type: "text" },
  { name: "due", label: "Fecha objetivo", type: "date" },
  { name: "tags", label: "Tags", type: "multi", helper: "Separa con comas" },
];

export default function GoalForm(props) {
  return <BaseEntityForm entity="goals" fields={fields} {...props} />;
}
