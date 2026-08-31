import { describe, expect, test } from "bun:test";
import { canTransitionOrderStatus } from "../../../lib/order-workflow";

describe("Order Workflow Domain", () => {
  test("allows sequential forward progress from Draft to Delivered", () => {
    expect(canTransitionOrderStatus("Draft", "Confirmed")).toBe(true);
    expect(canTransitionOrderStatus("Confirmed", "Deposit Paid")).toBe(true);
    expect(canTransitionOrderStatus("Deposit Paid", "In Production")).toBe(true);
    expect(canTransitionOrderStatus("In Production", "Shipped")).toBe(true);
    expect(canTransitionOrderStatus("Shipped", "Customs Cleared")).toBe(true);
    expect(canTransitionOrderStatus("Customs Cleared", "Delivered")).toBe(true);
  });

  test("allows cancellation before final delivery", () => {
    expect(canTransitionOrderStatus("Draft", "Cancelled")).toBe(true);
    expect(canTransitionOrderStatus("Confirmed", "Cancelled")).toBe(true);
    expect(canTransitionOrderStatus("Deposit Paid", "Cancelled")).toBe(true);
    expect(canTransitionOrderStatus("In Production", "Cancelled")).toBe(true);
  });

  test("blocks invalid backward transitions", () => {
    expect(canTransitionOrderStatus("Delivered", "Draft")).toBe(false);
    expect(canTransitionOrderStatus("Shipped", "Draft")).toBe(false);
    expect(canTransitionOrderStatus("In Production", "Confirmed")).toBe(false);
    expect(canTransitionOrderStatus("Cancelled", "Confirmed")).toBe(false);
  });
});
