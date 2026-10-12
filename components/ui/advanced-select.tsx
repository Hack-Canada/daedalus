"use client";

import { SingleValue } from "react-select";
import AsyncSelect from "react-select/async";

import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface AdvancedSelectProps {
  name: string;
  value: Option | null;
  onChange: (value: string) => void;
  loadOptions: (inputValue: string) => Promise<Option[]>;
  placeholder?: string;
  isSearchable?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export function AdvancedSelect({
  name,
  value,
  onChange,
  loadOptions,
  placeholder = "Select an option",
  isSearchable = true,
  disabled = false,
  className,
  id,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: AdvancedSelectProps) {
  return (
    <AsyncSelect
      name={name}
      inputId={id}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      value={value}
      onChange={(selected: SingleValue<Option>) =>
        onChange(selected?.value || "")
      }
      loadOptions={loadOptions}
      placeholder={placeholder}
      isSearchable={isSearchable}
      isDisabled={disabled}
      defaultOptions
      cacheOptions
      styles={{
        control: (base, state) => ({
          ...base,
          height: "40px",
          borderRadius: "6px",
          borderColor: state.isFocused ? "rgba(30, 144, 255, 0.5)" : "rgba(255, 255, 255, 0.1)",
          background: "rgba(255, 255, 255, 0.05)",
          boxShadow: state.isFocused ? "0 0 0 2px rgba(30, 144, 255, 0.3)" : "none",
          cursor: "pointer",
          "&:hover": {
            borderColor: "rgba(30, 144, 255, 0.3)",
          },
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: "#12121a",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "8px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
        }),
        menuList: (base) => ({
          ...base,
          padding: "4px",
        }),
        placeholder: (base) => ({
          ...base,
          color: "rgba(255, 255, 255, 0.4)",
        }),
        input: (base) => ({
          ...base,
          color: "#ffffff",
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected 
            ? "rgba(30, 144, 255, 0.3)" 
            : state.isFocused 
              ? "rgba(255, 255, 255, 0.1)" 
              : "transparent",
          color: state.isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.8)",
          cursor: "pointer",
          borderRadius: "4px",
          "&:active": {
            backgroundColor: "rgba(30, 144, 255, 0.4)",
          },
        }),
        singleValue: (base) => ({
          ...base,
          color: "#ffffff",
        }),
        noOptionsMessage: (base) => ({
          ...base,
          color: "rgba(255, 255, 255, 0.5)",
        }),
        loadingMessage: (base) => ({
          ...base,
          color: "rgba(255, 255, 255, 0.5)",
        }),
      }}
      className={cn(
        "focus-visible:outline-hidden",
        className,
      )}
    />
  );
}
