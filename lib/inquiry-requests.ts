export type InquiryRequest = {
  id: string; inquiryNo: string; requesterUserId: string; vehicleId: string; vehicleLabel: string;
  quantity: number; fobUnitUsd: number; fobTotalUsd: number; contactName: string; company: string;
  country: string; email: string; phonePrefix: string; phone: string; requirements: string;
  createdAt: string;
};
