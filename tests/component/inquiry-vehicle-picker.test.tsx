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
    expect(html).toContain("Select Model");
    expect(html).toContain(">Seal<");
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

    let changedValue: { vehicleId: string; vehicleModel: string } = { vehicleId: "", vehicleModel: "" };
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

    const select = container.querySelector('[data-testid="brand-select"]') as unknown as HTMLSelectElement;
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

  test("lets a user select any model available under the selected brand", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    let changedValue: { vehicleId: string; vehicleModel: string } = { vehicleId: "", vehicleModel: "" };

    await act(async () => {
      root.render(
        <InquiryVehiclePickerField
          vehicles={VEHICLES}
          value={{ vehicleId: "", vehicleModel: "" }}
          onChange={(value) => { changedValue = value; }}
        />,
      );
    });

    const brandSelect = container.querySelector('[data-testid="brand-select"]') as HTMLSelectElement;
    brandSelect.value = "BYD";
    await act(async () => brandSelect.dispatchEvent(new window.Event("change", { bubbles: true })));
    await act(async () => {
      root.render(
        <InquiryVehiclePickerField vehicles={VEHICLES} value={changedValue} onChange={(value) => { changedValue = value; }} />,
      );
    });

    const modelSelect = container.querySelector('[data-testid="model-select"]') as HTMLSelectElement;
    expect(modelSelect).not.toBeNull();
    modelSelect.value = "V-2";
    await act(async () => modelSelect.dispatchEvent(new window.Event("change", { bubbles: true })));

    expect(changedValue).toEqual({ vehicleId: "V-2", vehicleModel: "BYD Han" });

    await act(async () => root.unmount());
    container.remove();
  });

  test("requires configuration and color configuration beneath the selected model", async () => {
    const resources = [
      { id: "seal-dynamic", brand: "BYD", model: "Seal", variant: "Dynamic", color: "White", configuration: "510 km", interiorColor: "Black" },
      { id: "seal-flagship", brand: "BYD", model: "Seal", variant: "Flagship", color: "Blue", configuration: "650 km", interiorColor: "Grey" },
      { id: "han", brand: "BYD", model: "Han", variant: "Premium", color: "Black", configuration: "610 km", interiorColor: "Brown" },
    ] as unknown as VehiclePickerItem[];
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    let selected = { vehicleId: "", vehicleModel: "" };
    const render = async () => act(async () => {
      root.render(<InquiryVehiclePickerField vehicles={resources} value={selected} onChange={(value) => { selected = value; }} />);
    });

    await render();
    const brandSelect = container.querySelector('[data-testid="brand-select"]') as HTMLSelectElement;
    brandSelect.value = "BYD";
    await act(async () => brandSelect.dispatchEvent(new window.Event("change", { bubbles: true })));
    await render();

    const modelSelect = container.querySelector('[data-testid="model-select"]') as HTMLSelectElement;
    modelSelect.value = "seal-dynamic";
    await act(async () => modelSelect.dispatchEvent(new window.Event("change", { bubbles: true })));
    await render();

    const configurationSelect = container.querySelector('[data-testid="configuration-select"]') as HTMLSelectElement;
    const colorSelect = container.querySelector('[data-testid="color-select"]') as HTMLSelectElement;
    expect(configurationSelect).not.toBeNull();
    expect(colorSelect).not.toBeNull();
    expect(configurationSelect.textContent).toContain("Dynamic / 510 km");

    configurationSelect.value = "seal-flagship";
    await act(async () => configurationSelect.dispatchEvent(new window.Event("change", { bubbles: true })));
    await render();

    const updatedColorSelect = container.querySelector('[data-testid="color-select"]') as HTMLSelectElement;
    expect(updatedColorSelect.textContent).toContain("Blue / Grey");
    expect(selected).toEqual({ vehicleId: "seal-flagship", vehicleModel: "BYD Seal" });

    await act(async () => root.unmount());
    container.remove();
  });
});
