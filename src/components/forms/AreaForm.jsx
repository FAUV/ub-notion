"use client";
import React from "react";
import BaseEntityForm from "./BaseEntityForm";

const fields = [
  { name: "title", label: "Área", type: "text", required: true },
  { name: "owner", label: "Responsable", type: "text" },
  { name: "mission", label: "Misión", type: "textarea" },
  { name: "tags", label: "Tags", type: "multi", helper: "Separa con comas" },
];

export default function AreaForm(props) {
  return <BaseEntityForm entity="areas" fields={fields} {...props} />;
}
