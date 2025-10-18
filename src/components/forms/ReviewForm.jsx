"use client";
import React from "react";
import BaseEntityForm from "./BaseEntityForm";

const fields = [
  { name: "title", label: "Título", type: "text", required: true },
  { name: "period", label: "Periodo", type: "text", placeholder: "Semana 32" },
  { name: "mood", label: "Estado", type: "text" },
  { name: "highlights", label: "Highlights", type: "textarea" },
  { name: "next", label: "Siguientes", type: "textarea" },
];

export default function ReviewForm(props) {
  return <BaseEntityForm entity="reviews" fields={fields} {...props} />;
}
