import { expect, test } from "bun:test";
import { canCreateVehicleQuotation } from "../../lib/quotation-permissions";

test("only admin and sales can create vehicle quotations", () => {
  expect(canCreateVehicleQuotation("admin")).toBe(true);
  expect(canCreateVehicleQuotation("sales")).toBe(true);
  expect(canCreateVehicleQuotation("sourcing")).toBe(false);
  expect(canCreateVehicleQuotation("finance")).toBe(false);
  expect(canCreateVehicleQuotation("partner")).toBe(false);
  expect(canCreateVehicleQuotation("customer")).toBe(false);
});
