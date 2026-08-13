export type OrderStatus =
  | "Draft"
  | "Confirmed"
  | "Deposit Paid"
  | "In Production"
  | "Shipped"
  | "Customs Cleared"
  | "Delivered"
  | "Cancelled";

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    "Draft": ["Confirmed", "Cancelled"],
    "Confirmed": ["Deposit Paid", "Cancelled"],
    "Deposit Paid": ["In Production", "Cancelled"],
    "In Production": ["Shipped", "Cancelled"],
    "Shipped": ["Customs Cleared", "Delivered"],
    "Customs Cleared": ["Delivered"],
    "Delivered": [],
    "Cancelled": [],
  };
  return allowedTransitions[from]?.includes(to) ?? false;
}
