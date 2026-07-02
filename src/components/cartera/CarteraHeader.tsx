"use client";

import { useState, useRef, useEffect } from "react";

const monthOptions = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const yearOptions = ["2023", "2024", "2025"];
const sexOptions = ["Masculino", "Femenino"];
const creditTypeOptions = ["Consumo", "Hipotecario", "Vehicular", "Libre inversión"];
const cityOptions = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena"];

interface MultiSelectProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}

function MultiSelect({ label, options, value, onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allSelected = value.length === options.length && options.length > 0;

  const toggleAll = () => {
    onChange(allSelected ? [] : [...options]);
  };

  const toggleOne = (opt: string) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  };

  const displayText =
    value.length === 0
      ? "Seleccionar..."
      : allSelected
        ? "Todos"
        : `${value.length} seleccionado${value.length > 1 ? "s" : ""}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: 110, position: "relative" }} ref={ref}>
      <label style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>{label}</label>
      <button
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem",
          width: "100%", padding: "0.5rem 0.625rem", background: "var(--color-surface)",
          border: "1px solid var(--color-border)", borderRadius: 8, fontSize: "0.8125rem",
          color: "var(--color-text-main)", cursor: "pointer", fontWeight: 500, height: 36, fontFamily: "inherit",
        }}
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayText}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, minWidth: 180, maxHeight: 260,
          overflowY: "auto", background: "var(--color-surface)", border: "1px solid var(--color-border)",
          borderRadius: 10, boxShadow: "var(--shadow-soft)", zIndex: 20, padding: "0.5rem 0",
        }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", fontSize: "0.8125rem", color: "var(--color-text-main)", cursor: "pointer" }}>
            <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ width: 14, height: 14, accentColor: "var(--color-primary)", cursor: "pointer", flexShrink: 0 }} />
            <span>Todos</span>
          </label>
          <div style={{ height: 1, background: "var(--color-border)", margin: "0.375rem 0.75rem" }} />
          {options.map((opt) => (
            <label key={opt} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", fontSize: "0.8125rem", color: "var(--color-text-main)", cursor: "pointer" }}>
              <input type="checkbox" checked={value.includes(opt)} onChange={() => toggleOne(opt)} style={{ width: 14, height: 14, accentColor: "var(--color-primary)", cursor: "pointer", flexShrink: 0 }} />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export interface CarteraFilters {
  date: string;
  month: string[];
  year: string[];
  sex: string[];
  creditType: string[];
  city: string[];
}

interface CarteraHeaderProps {
  onFiltersChange?: (filters: CarteraFilters) => void;
}

export default function CarteraHeader({ onFiltersChange }: CarteraHeaderProps) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [month, setMonth] = useState<string[]>([]);
  const [year, setYear] = useState<string[]>([]);
  const [sex, setSex] = useState<string[]>([]);
  const [creditType, setCreditType] = useState<string[]>([]);
  const [city, setCity] = useState<string[]>([]);

  useEffect(() => {
    onFiltersChange?.({ date, month, year, sex, creditType, city });
  }, [date, month, year, sex, creditType, city]);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "1rem 2rem", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)",
      gap: "1rem", flexWrap: "wrap",
    }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-main)", whiteSpace: "nowrap" }}>
        Cartera
      </h1>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem", flexWrap: "wrap" }}>
        <MultiSelect label="Mes" options={monthOptions} value={month} onChange={setMonth} />
        <MultiSelect label="Año" options={yearOptions} value={year} onChange={setYear} />
        <MultiSelect label="Sexo" options={sexOptions} value={sex} onChange={setSex} />
        <MultiSelect label="Tipo de crédito" options={creditTypeOptions} value={creditType} onChange={setCreditType} />
        <MultiSelect label="Ciudad" options={cityOptions} value={city} onChange={setCity} />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: 110 }}>
          <label style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Fecha</label>
          <input
            type="date"
            style={{
              padding: "0.5rem 0.625rem", background: "var(--color-surface)", border: "1px solid var(--color-border)",
              borderRadius: 8, fontSize: "0.8125rem", color: "var(--color-text-main)", fontWeight: 500, height: 36, fontFamily: "inherit", cursor: "pointer",
            }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
