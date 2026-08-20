"use client";

import React from "react";

export type VehiclePickerItem = {
  id: string;
  brand: string;
  model: string;
  variant?: string;
  color?: string;
  trim?: string;
  configuration?: string;
  exteriorColor?: string;
  interiorColor?: string;
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

function configurationLabel(vehicle: VehiclePickerItem) {
  return [vehicle.variant || vehicle.trim, vehicle.configuration].filter(Boolean).join(" / ") || "Standard configuration";
}

function colorLabel(vehicle: VehiclePickerItem) {
  return [vehicle.color || vehicle.exteriorColor, vehicle.interiorColor].filter(Boolean).join(" / ") || "Unspecified color";
}

function uniqueVehiclesBy(vehicles: VehiclePickerItem[], keyFor: (vehicle: VehiclePickerItem) => string) {
  const seen = new Set<string>();
  return vehicles.filter((vehicle) => {
    const key = keyFor(vehicle);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function InquiryVehiclePickerField({
  vehicles,
  value,
  onChange,
}: InquiryVehiclePickerFieldProps) {
  const brands = Array.from(new Set(vehicles.map((v) => v.brand).filter(Boolean)));
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === value.vehicleId);
  const selectedBrand = selectedVehicle?.brand || "";
  const modelOptions = uniqueVehiclesBy(
    vehicles.filter((vehicle) => vehicle.brand === selectedBrand),
    (vehicle) => `${vehicle.brand}::${vehicle.model}`.toLowerCase(),
  );
  const selectedModel = selectedVehicle?.model || "";
  const configurationOptions = uniqueVehiclesBy(
    vehicles.filter((vehicle) => vehicle.brand === selectedBrand && vehicle.model === selectedModel),
    configurationLabel,
  );
  const selectedConfiguration = selectedVehicle ? configurationLabel(selectedVehicle) : "";
  const colorOptions = uniqueVehiclesBy(
    vehicles.filter((vehicle) => vehicle.brand === selectedBrand && vehicle.model === selectedModel && configurationLabel(vehicle) === selectedConfiguration),
    colorLabel,
  );
  const selectedModelId = modelOptions.find((vehicle) => vehicle.model === selectedModel)?.id || "";
  const selectedConfigurationId = configurationOptions.find((vehicle) => configurationLabel(vehicle) === selectedConfiguration)?.id || "";
  const selectedColorId = colorOptions.find((vehicle) => colorLabel(vehicle) === (selectedVehicle ? colorLabel(selectedVehicle) : ""))?.id || "";

  const selectVehicle = (vehicle?: VehiclePickerItem) => onChange(
    vehicle
      ? { vehicleId: vehicle.id, vehicleModel: `${vehicle.brand} ${vehicle.model}`.trim() }
      : { vehicleId: "", vehicleModel: "" },
  );

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brand = e.target.value;
    const first = vehicles.find((v) => v.brand === brand);
    selectVehicle(first);
  };

  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => selectVehicle(modelOptions.find((vehicle) => vehicle.id === event.target.value));
  const handleConfigurationChange = (event: React.ChangeEvent<HTMLSelectElement>) => selectVehicle(configurationOptions.find((vehicle) => vehicle.id === event.target.value));
  const handleColorChange = (event: React.ChangeEvent<HTMLSelectElement>) => selectVehicle(colorOptions.find((vehicle) => vehicle.id === event.target.value));

  return (
    <div data-testid="vehicle-picker" className="grid gap-2">
      <select
        data-testid="brand-select"
        aria-label="Select Brand"
        value={selectedBrand}
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
      <select
        data-testid="model-select"
        aria-label="Select Model"
        value={selectedModelId}
        onChange={handleModelChange}
        disabled={!selectedBrand}
        className="rounded border border-white/10 bg-black/10 p-2 text-sm text-slate-300"
      >
        <option value="">Select Model</option>
        {modelOptions.map((vehicle) => (
          <option key={vehicle.id} value={vehicle.id}>
            {vehicle.model}
          </option>
        ))}
      </select>
      <select
        data-testid="configuration-select"
        aria-label="Select Configuration"
        value={selectedConfigurationId}
        onChange={handleConfigurationChange}
        disabled={!selectedModel}
        className="rounded border border-white/10 bg-black/10 p-2 text-sm text-slate-300"
      >
        <option value="">Select Configuration</option>
        {configurationOptions.map((vehicle) => (
          <option key={vehicle.id} value={vehicle.id}>
            {configurationLabel(vehicle)}
          </option>
        ))}
      </select>
      <select
        data-testid="color-select"
        aria-label="Select Color Configuration"
        value={selectedColorId}
        onChange={handleColorChange}
        disabled={!selectedConfiguration}
        className="rounded border border-white/10 bg-black/10 p-2 text-sm text-slate-300"
      >
        <option value="">Select Color Configuration</option>
        {colorOptions.map((vehicle) => (
          <option key={vehicle.id} value={vehicle.id}>
            {colorLabel(vehicle)}
          </option>
        ))}
      </select>
    </div>
  );
}

export { InquiryVehiclePickerField as InquiryVehiclePicker };
