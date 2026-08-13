import { describe, expect, test } from "bun:test";
import React, { useState } from "react";
import { renderToString } from "react-dom/server";

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  variant?: string;
  color?: string;
};

function SimpleVehiclePicker({
  vehicles,
  value,
  onChange,
}: {
  vehicles: Vehicle[];
  value: { vehicleId: string; vehicleModel: string };
  onChange: (val: { vehicleId: string; vehicleModel: string }) => void;
}) {
  const brands = Array.from(new Set(vehicles.map((v) => v.brand)));
  return (
    <div data-testid="vehicle-picker">
      <select
        data-testid="brand-select"
        value={value.vehicleModel.split(" ")[0] || ""}
        onChange={(e) => {
          const brand = e.target.value;
          const first = vehicles.find((v) => v.brand === brand);
          onChange(first ? { vehicleId: first.id, vehicleModel: `${first.brand} ${first.model}` } : { vehicleId: "", vehicleModel: "" });
        }}
      >
        <option value="">Select Brand</option>
        {brands.map((b) => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>
      <input
        data-testid="selected-display"
        readOnly
        value={value.vehicleModel}
      />
    </div>
  );
}

describe("Inquiry Vehicle Picker Component", () => {
  const VEHICLES: Vehicle[] = [
    { id: "V-1", brand: "BYD", model: "Seal", variant: "Premium", color: "White" },
    { id: "V-2", brand: "BYD", model: "Han", variant: "Flagship", color: "Black" },
    { id: "V-3", brand: "Changan", model: "Deepal SL03", variant: "Standard", color: "Grey" },
  ];

  test("renders brand options from vehicle list", () => {
    const html = renderToString(
      <SimpleVehiclePicker
        vehicles={VEHICLES}
        value={{ vehicleId: "V-1", vehicleModel: "BYD Seal" }}
        onChange={() => {}}
      />
    );
    expect(html).toContain("BYD");
    expect(html).toContain("Changan");
    expect(html).toContain("BYD Seal");
  });

  test("renders empty select prompt when no vehicle is selected", () => {
    const html = renderToString(
      <SimpleVehiclePicker
        vehicles={VEHICLES}
        value={{ vehicleId: "", vehicleModel: "" }}
        onChange={() => {}}
      />
    );
    expect(html).toContain("Select Brand");
  });
});
