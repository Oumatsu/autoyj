import { expect, test } from "bun:test";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { InquiryRequestPanel } from "../../components/portal/InquiryRequestPanel";

const base = { inquiryNo: "INQ-1", title: "Fleet", vehicles: [{ id: "V1", brand: "BYD", model: "Seal", trim: "Premium", color: "Black", fobUsd: 23000 }], requests: [{ id: "R1", inquiryNo: "INQ-1", requesterUserId: "P1", vehicleId: "V1", vehicleLabel: "BYD Seal Premium Black", quantity: 4, fobUnitUsd: 23000, fobTotalUsd: 92000, contactName: "A", company: "", country: "Ethiopia", email: "a@example.com", phonePrefix: "+251", phone: "", requirements: "", createdAt: "2026-08-24" }], onRefresh: async () => {} };

test("shows apply and requester delete only to an eligible request submitter", () => {
  const html = renderToString(<InquiryRequestPanel {...base} user={{ userId: "P1", role: "partner", name: "A", company: "", email: "a@example.com" }} />);
  expect(html).toContain("Apply quotation"); expect(html).toContain("View details"); expect(html).toContain("Delete"); expect(html).toContain("23,000");
});

test("does not expose apply or delete controls to sales", () => {
  const html = renderToString(<InquiryRequestPanel {...base} user={{ userId: "S1", role: "sales", name: "Sales", company: "", email: "s@example.com" }} />);
  expect(html).not.toContain("Apply quotation"); expect(html).not.toContain("Delete"); expect(html).toContain("View details");
});

test("groups the application into labelled vehicle, order, and contact sections", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<InquiryRequestPanel {...base} user={{ userId: "P1", role: "partner", name: "A", company: "", email: "a@example.com" }} />);
  });
  const openButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Apply quotation");
  await act(async () => openButton?.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));

  expect(container.querySelector("legend")?.textContent).toBe("Vehicle selection");
  expect(Array.from(container.querySelectorAll("legend")).map((node) => node.textContent)).toEqual([
    "Vehicle selection",
    "Order details",
    "Your contact information",
  ]);
  expect(container.querySelector('label[for="inquiry-request-phone"]')?.textContent).toContain("Phone number");
  expect(container.textContent).not.toContain("WhatsApp");
  expect(container.querySelector('select[aria-label="Phone prefix choices"] option[value="+86"]')).not.toBeNull();
  expect(container.querySelector('select[aria-label="Phone prefix choices"] option[value="+251"]')).not.toBeNull();
  expect(container.querySelector('select[aria-label="Phone prefix choices"] option[value="custom"]')).not.toBeNull();
  expect(container.querySelectorAll('select[aria-label="Phone prefix choices"] option[data-country]').length).toBe(75);
  expect(container.querySelector('select[aria-label="Phone prefix choices"] option[value="+86"]')?.textContent).toBe("China (+86)");
  expect(container.querySelector('select[aria-label="Phone prefix choices"] option[value="+251"]')?.textContent).toBe("Ethiopia (+251)");
  expect(Array.from(container.querySelectorAll('select[aria-label="Phone prefix choices"] option[data-country]')).slice(0, 2).map((option) => option.textContent)).toEqual(["China (+86)", "Ethiopia (+251)"]);
  const applicationButtons = Array.from(container.querySelectorAll("button")).filter((button) => button.textContent === "Apply quotation");
  expect(applicationButtons.at(-1)?.disabled).toBe(true);

  await act(async () => root.unmount());
  container.remove();
});

test("preselects the inquiry vehicle when opening an application", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<InquiryRequestPanel {...base} initialVehicleId="V1" user={{ userId: "P1", role: "partner", name: "A", company: "", email: "a@example.com" }} />);
  });
  const openButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Apply quotation");
  await act(async () => openButton?.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));

  expect((container.querySelector('[data-testid="brand-select"]') as HTMLSelectElement).value).toBe("BYD");
  expect((container.querySelector('[data-testid="model-select"]') as HTMLSelectElement).value).toBe("V1");
  expect((container.querySelector('[data-testid="configuration-select"]') as HTMLSelectElement).value).toBe("V1");
  expect((container.querySelector('[data-testid="color-select"]') as HTMLSelectElement).value).toBe("V1");
  const applicationButtons = Array.from(container.querySelectorAll("button")).filter((button) => button.textContent === "Apply quotation");
  expect(applicationButtons.at(-1)?.disabled).toBe(false);

  await act(async () => root.unmount());
  container.remove();
});

test("shows the requested vehicle in details, including for a legacy request without a saved label", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<InquiryRequestPanel {...base} requests={[{ ...base.requests[0], vehicleLabel: "" }]} user={{ userId: "S1", role: "sales", name: "Sales", company: "", email: "s@example.com" }} />);
  });
  const detailsButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "View details");
  await act(async () => detailsButton?.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));

  expect(container.textContent).toContain("Requested vehicle");
  expect(container.textContent).toContain("BYD Seal Premium Black");

  await act(async () => root.unmount());
  container.remove();
});

test("requires a custom country or market name when Other is selected", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<InquiryRequestPanel {...base} user={{ userId: "P1", role: "partner", name: "A", company: "", email: "a@example.com" }} />);
  });
  const openButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Apply quotation");
  await act(async () => openButton?.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));

  const country = container.querySelector("#inquiry-request-country") as HTMLSelectElement;
  country.value = "Other";
  await act(async () => country.dispatchEvent(new window.Event("change", { bubbles: true })));

  const customCountry = container.querySelector("#inquiry-request-country-other") as HTMLInputElement | null;
  expect(customCountry).not.toBeNull();
  expect(customCountry?.required).toBe(true);
  expect(customCountry?.placeholder).toBe("Enter country or market");

  await act(async () => root.unmount());
  container.remove();
});
