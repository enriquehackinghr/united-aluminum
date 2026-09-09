"use client";

import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
  ariaLabel = "Quantity",
  size = "md",
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  ariaLabel?: string;
  size?: "sm" | "md";
}) {
  const compact = size === "sm";
  const buttonClass = compact
    ? "grid h-8 w-8 place-items-center text-navy-800 hover:bg-sand-100 disabled:opacity-40"
    : "grid h-10 w-10 place-items-center text-navy-800 hover:bg-sand-100 disabled:opacity-40";
  const inputClass = compact
    ? "h-8 w-12 border-x border-sand-200 bg-white text-center text-sm font-semibold text-navy-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    : "h-10 w-14 border-x border-sand-200 bg-white text-center text-sm font-semibold text-navy-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

  function clamp(next: number) {
    const floored = Number.isFinite(next) ? Math.floor(next) : min;
    const withMin = Math.max(min, floored);
    return max == null ? withMin : Math.min(max, withMin);
  }

  return (
    <div
      className={`inline-flex items-center overflow-hidden rounded-lg border ${
        disabled ? "border-sand-200 bg-sand-100 opacity-50" : "border-sand-200 bg-white"
      }`}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
        className={buttonClass}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => onChange(clamp(Number(event.target.value)))}
        className={`${inputClass} ${disabled ? "bg-sand-100 text-navy-400" : ""}`}
      />
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || (max != null && value >= max)}
        onClick={() => onChange(clamp(value + 1))}
        className={buttonClass}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
