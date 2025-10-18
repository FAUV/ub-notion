"use client";
import React from "react";
import BaseEntityForm from "./BaseEntityForm";

const fields = [
  { name: "title", label: "Hábito", type: "text", required: true },
  { name: "streak", label: "Racha", type: "number" },
  { name: "last", label: "Última vez", type: "date" },
  { name: "cadence", label: "Cadencia", type: "text", placeholder: "Diario, semanal, etc." },
];

export default function HabitForm(props) {
  return <BaseEntityForm entity="habits" fields={fields} {...props} />;
}
