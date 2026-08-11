import type { PortalRole } from "./users";

export function canCreateVehicleQuotation(role: PortalRole): boolean {
  return role === "admin" || role === "sales";
}
