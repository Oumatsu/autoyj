export type InquiryVehicleSelection = {
  vehicleId: string;
  vehicleModel: string;
};

export function requiresInquiryTitle(selection: InquiryVehicleSelection) {
  return !selection.vehicleId;
}
