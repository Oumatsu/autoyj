import { describe, expect, test } from "bun:test";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import {
  InquiryVehiclePickerField,
  type VehiclePickerItem,
} from "../../components/portal/InquiryVehiclePickerField";

describe("Inquiry Vehicle Picker Component", () => {
  const VEHICLES: VehiclePickerItem[] = [
    { id: "V-1", brand: "BYD", model: "Seal", variant: "Premium", color: "White" },
    { id: "V-2", brand: "BYD", model: "Han", variant: "Flagship", color: "Black" },
    { id: "V-3", brand: "Changan", model: "Deepal SL03", variant: "Standard", color: "Grey" },
  ];

  test("renders brand options from vehicle list", () => {
    const html = renderToString(
      <InquiryVehiclePickerField
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
      <InquiryVehiclePickerField
        vehicles={VEHICLES}
        value={{ vehicleId: "", vehicleModel: "" }}
        onChange={() => {}}
      />
    );
    expect(html).toContain("Select Brand");
  });

  test("dispatches change event and invokes onChange callback when brand is selected", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    let changedValue: { vehicleId: string; vehicleModel: string } | null = null;

    await act(async () => {
      root.render(
        <InquiryVehiclePickerField
          vehicles={VEHICLES}
          value={{ vehicleId: "", vehicleModel: "" }}
          onChange={(val) => {
            changedValue = val;
          }}
        />
      );
    });

    const select = container.querySelector('[data-testid="brand-select"]') as HTMLSelectElement;
    expect(select).not.toBeNull();

    select.value = "Changan";
    await act(async () => {
      select.dispatchEvent(new window.Event("change", { bubbles: true }));
    });

    expect(changedValue).toEqual({ vehicleId: "V-3", vehicleModel: "Changan Deepal SL03" });

    // Test clearing selection
    select.value = "";
    await act(async () => {
      select.dispatchEvent(new window.Event("change", { bubbles: true }));
    });
    expect(changedValue).toEqual({ vehicleId: "", vehicleModel: "" });

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
