"use client";

import React from "react";

export type VehiclePickerItem = {
  id: string;
  brand: string;
  model: string;
  variant?: string;
  color?: string;
};

export type InquiryVehicleTarget = {
  vehicleId: string;
  vehicleModel: string;
};

export interface InquiryVehiclePickerFieldProps {
  vehicles: VehiclePickerItem[];
  value: InquiryVehicleTarget;
  onChange: (val: InquiryVehicleTarget) => void;
}

export function InquiryVehiclePickerField({
  vehicles,
  value,
  onChange,
}: InquiryVehiclePickerFieldProps) {
  const brands = Array.from(new Set(vehicles.map((v) => v.brand).filter(Boolean)));

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brand = e.target.value;
    const first = vehicles.find((v) => v.brand === brand);
    onChange(
      first
        ? { vehicleId: first.id, vehicleModel: `${first.brand} ${first.model}`.trim() }
        : { vehicleId: "", vehicleModel: "" }
    );
  };

  return (
    <div data-testid="vehicle-picker" className="grid gap-2">
      <select
        data-testid="brand-select"
        aria-label="Select Brand"
        value={value.vehicleModel ? value.vehicleModel.split(" ")[0] || "" : ""}
        onChange={handleBrandChange}
        className="rounded border border-white/15 bg-black/20 p-2 text-sm text-white"
      >
        <option value="">Select Brand</option>
        {brands.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
      <input
        data-testid="selected-display"
        aria-label="Selected Vehicle"
        readOnly
        value={value.vehicleModel}
        className="rounded border border-white/10 bg-black/10 p-2 text-sm text-slate-300"
      />
    </div>
  );
}

export { InquiryVehiclePickerField as InquiryVehiclePicker };
