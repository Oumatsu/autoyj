"use client";

import { useState, type FormEvent } from "react";
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InquiryVehiclePicker, type InquiryVehicleTarget, type VehiclePickerItem } from "./InquiryVehiclePickerField";
import type { InquiryRequest } from "@/lib/inquiry-requests";
import { calculateInquiryRequestPreview } from "@/lib/inquiry-request-pricing";
import type { LocalUser } from "@/lib/users";

const COUNTRIES = ["Kenya", "Tanzania", "Uganda", "Nigeria", "Ghana", "Ethiopia", "Rwanda", "Other"];
const CALLING_CODES = [
  ["China", "+86"], ["Ethiopia", "+251"], ["Afghanistan", "+93"], ["Albania", "+355"], ["Algeria", "+213"], ["Angola", "+244"], ["Argentina", "+54"], ["Australia", "+61"], ["Austria", "+43"], ["Bangladesh", "+880"], ["Belgium", "+32"], ["Brazil", "+55"], ["Cambodia", "+855"], ["Cameroon", "+237"], ["Canada", "+1"], ["Chile", "+56"], ["Colombia", "+57"], ["Côte d’Ivoire", "+225"], ["Czechia", "+420"], ["Denmark", "+45"], ["Egypt", "+20"], ["Finland", "+358"], ["France", "+33"], ["Germany", "+49"], ["Ghana", "+233"], ["Greece", "+30"], ["Hong Kong", "+852"], ["Hungary", "+36"], ["India", "+91"], ["Indonesia", "+62"], ["Iran", "+98"], ["Iraq", "+964"], ["Ireland", "+353"], ["Israel", "+972"], ["Italy", "+39"], ["Japan", "+81"], ["Jordan", "+962"], ["Kenya", "+254"], ["Malaysia", "+60"], ["Mexico", "+52"], ["Morocco", "+212"], ["Myanmar", "+95"], ["Netherlands", "+31"], ["New Zealand", "+64"], ["Nigeria", "+234"], ["Norway", "+47"], ["Pakistan", "+92"], ["Peru", "+51"], ["Philippines", "+63"], ["Poland", "+48"], ["Portugal", "+351"], ["Qatar", "+974"], ["Romania", "+40"], ["Rwanda", "+250"], ["Saudi Arabia", "+966"], ["Senegal", "+221"], ["Singapore", "+65"], ["South Africa", "+27"], ["South Korea", "+82"], ["Spain", "+34"], ["Sri Lanka", "+94"], ["Sweden", "+46"], ["Switzerland", "+41"], ["Tanzania", "+255"], ["Thailand", "+66"], ["Tunisia", "+216"], ["Türkiye", "+90"], ["Uganda", "+256"], ["Ukraine", "+380"], ["United Arab Emirates", "+971"], ["United Kingdom", "+44"], ["United States", "+1"], ["Vietnam", "+84"], ["Zambia", "+260"], ["Zimbabwe", "+263"],
] as const;
type ContactForm = { name: string; company: string; country: string; countryOther: string; email: string; phonePrefix: string; phone: string; requirements: string };
type InquiryRequestPanelProps = { inquiryNo: string; title: string; initialVehicleId?: string; vehicles: VehiclePickerItem[]; requests: InquiryRequest[]; user: Pick<LocalUser, "userId" | "role" | "name" | "company" | "email">; onRefresh: () => Promise<void> };

function formatUsd(value: number) { return `USD ${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`; }
function inputClassName() { return "h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-theme/70 focus:ring-2 focus:ring-theme/15"; }
function FieldLabel({ htmlFor, children, optional = false }: { htmlFor: string; children: string; optional?: boolean }) {
  return <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-bold text-slate-200">{children}{optional ? <span className="ml-1 font-medium text-slate-500">Optional</span> : <span className="ml-1 text-theme">*</span>}</label>;
}
function CallingCodeSelect({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  const isCustom = Boolean(value) && !CALLING_CODES.some(([, code]) => code === value);
  const selectedValue = isCustom ? "custom" : value;
  return <div><select aria-label={`${label} prefix choices`} className={inputClassName()} value={selectedValue} onChange={(event) => onChange(event.target.value === "custom" ? "+" : event.target.value)}><option value="">Code</option>{CALLING_CODES.map(([country, code]) => <option key={`${country}-${code}`} value={code} data-country>{country} ({code})</option>)}<option value="custom">Custom +xx</option></select>{isCustom && <input aria-label={`${label} custom prefix`} className={`${inputClassName()} mt-2`} placeholder="+xx" value={value} onChange={(event) => onChange(event.target.value)} />}</div>;
}

export function InquiryRequestPanel({ inquiryNo, title, initialVehicleId, vehicles, requests, user, onRefresh }: InquiryRequestPanelProps) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<InquiryRequest | null>(null);
  const [target, setTarget] = useState<InquiryVehicleTarget>({ vehicleId: "", vehicleModel: "" });
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [contact, setContact] = useState<ContactForm>({ name: user.name, company: user.company, country: "", countryOther: "", email: user.email, phonePrefix: "", phone: "", requirements: "" });
  const eligible = user.role === "partner" || user.role === "customer";
  const visibleRequests = requests.filter((request) => request.inquiryNo === inquiryNo);
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === target.vehicleId);
  const detailVehicle = detail ? vehicles.find((vehicle) => vehicle.id === detail.vehicleId) : undefined;
  const detailVehicleLabel = detail?.vehicleLabel || [detailVehicle?.brand, detailVehicle?.model, detailVehicle?.variant || detailVehicle?.trim, detailVehicle?.configuration, detailVehicle?.color || detailVehicle?.exteriorColor, detailVehicle?.interiorColor].filter(Boolean).join(" ") || "Vehicle details are unavailable.";
  const pricePreview = calculateInquiryRequestPreview(selectedVehicle?.fobUsd, quantity);
  const setContactField = <Key extends keyof ContactForm>(key: Key, value: ContactForm[Key]) => setContact((current) => ({ ...current, [key]: value }));
  const selectInquiryVehicle = () => {
    const vehicle = vehicles.find((candidate) => candidate.id === initialVehicleId);
    setTarget(vehicle ? { vehicleId: vehicle.id, vehicleModel: `${vehicle.brand} ${vehicle.model}`.trim() } : { vehicleId: "", vehicleModel: "" });
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!target.vehicleId) { setError("Choose a complete vehicle configuration before applying."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/portal/inquiries/${encodeURIComponent(inquiryNo)}/requests`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ vehicleId: target.vehicleId, quantity, contactName: contact.name, company: contact.company, country: contact.country === "Other" ? contact.countryOther.trim() : contact.country, email: contact.email, phonePrefix: contact.phonePrefix, phone: contact.phone, requirements: contact.requirements }) });
      if (!response.ok) {
        const failure = await response.json().catch(() => null) as { error?: unknown } | null;
        throw new Error(typeof failure?.error === "string" ? failure.error : "Could not submit the quotation application. Please try again.");
      }
      setOpen(false); await onRefresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not submit the quotation application. Please try again."); }
    finally { setBusy(false); }
  }
  async function deleteRequest(request: InquiryRequest) {
    if (!confirm("Delete this quotation application? This cannot be undone.")) return;
    setBusy(true);
    try { const response = await fetch(`/api/portal/inquiries/${encodeURIComponent(inquiryNo)}/requests/${encodeURIComponent(request.id)}`, { method: "DELETE" }); if (!response.ok) throw new Error(); await onRefresh(); }
    finally { setBusy(false); }
  }

  return <section className="my-5 overflow-hidden rounded-xl border border-theme/25 bg-theme/[0.045]" aria-label="Inquiry requests">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-black/10 px-5 py-4">
      <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-theme">Quotation applications</p><h3 className="mt-1 text-sm font-black text-white">Requests for this inquiry</h3><p className="mt-1 text-xs text-slate-400">{title}</p></div>
      {eligible && <button type="button" className="btn-primary rounded-lg px-4 py-2 text-xs font-black" onClick={() => { setError(""); selectInquiryVehicle(); setOpen(true); }}>Apply quotation</button>}
    </div>
    {visibleRequests.length === 0 ? <p className="px-5 py-5 text-sm text-slate-400">No quotation applications have been submitted for this inquiry.</p> : <div className="grid divide-y divide-white/10">{visibleRequests.map((request) => <article key={request.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div><p className="font-bold text-white">{request.vehicleLabel}</p><p className="mt-1 text-xs text-slate-400">{request.quantity} units · FOB {formatUsd(request.fobUnitUsd)} / unit</p></div><div className="flex flex-wrap items-center gap-3 sm:justify-end"><p className="text-sm font-black text-theme">{formatUsd(request.fobTotalUsd)}</p><button type="button" className="text-xs font-bold text-slate-300 hover:text-white" onClick={() => setDetail(request)}>View details</button>{request.requesterUserId === user.userId && <button type="button" disabled={busy} className="text-xs font-bold text-red-300 hover:text-red-200 disabled:opacity-50" onClick={() => void deleteRequest(request)}>Delete</button>}</div></article>)}</div>}
    <Dialog open={open} onOpenChange={setOpen} className="max-w-3xl overflow-hidden p-0">
      <DialogHeader className="mb-0 border-b border-white/10 bg-white/[0.025] px-6 py-5"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-theme">Quotation application</p><DialogTitle className="mt-1 text-lg">Apply quotation</DialogTitle><DialogDescription className="mt-1">Choose one vehicle configuration. Your account’s FOB price is calculated securely when you submit.</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="max-h-[calc(100vh-12rem)] space-y-5 overflow-y-auto p-6">
        <fieldset className="rounded-xl border border-white/10 bg-black/15 p-4"><legend className="px-1 text-sm font-black text-white">Vehicle selection</legend><p className="mb-4 text-xs text-slate-400">Select the exact brand, model, trim, and colour configuration.</p><InquiryVehiclePicker vehicles={vehicles} value={target} onChange={setTarget} /></fieldset>
        <fieldset className="rounded-xl border border-white/10 bg-black/15 p-4"><legend className="px-1 text-sm font-black text-white">Order details</legend><div className="mt-3 grid gap-4 sm:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)] sm:items-end"><div><FieldLabel htmlFor="inquiry-request-quantity">Quantity</FieldLabel><div className="relative"><input id="inquiry-request-quantity" aria-label="Quantity" className={inputClassName()} type="number" min="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} /><span className="pointer-events-none absolute right-3 top-2.5 text-xs text-slate-500">units</span></div></div><output aria-live="polite" className="rounded-lg border border-theme/60 bg-theme/15 px-4 py-3 text-left"><span className="block text-[10px] font-black uppercase tracking-[0.16em] text-theme">Estimated FOB quotation</span>{pricePreview ? <><span className="mt-1 block text-lg font-black text-amber-300">{formatUsd(pricePreview.totalUsd)}</span><span className="mt-1 block text-xs text-amber-100/70">{formatUsd(pricePreview.unitUsd)} / unit × {quantity}</span></> : <span className="mt-1 block text-xs text-amber-100/70">Complete vehicle selection to view your FOB price.</span>}</output></div></fieldset>
        <fieldset className="rounded-xl border border-white/10 bg-black/15 p-4"><legend className="px-1 text-sm font-black text-white">Your contact information</legend><p className="mb-4 text-xs text-slate-400">We prefilled your account details. You can replace or clear any value.</p><div className="grid gap-4 sm:grid-cols-2">
          <div><FieldLabel htmlFor="inquiry-request-name">Name</FieldLabel><input id="inquiry-request-name" aria-label="Name" required className={inputClassName()} value={contact.name} onChange={(event) => setContactField("name", event.target.value)} /></div>
          <div><FieldLabel htmlFor="inquiry-request-company" optional>Company</FieldLabel><input id="inquiry-request-company" aria-label="Company" className={inputClassName()} value={contact.company} onChange={(event) => setContactField("company", event.target.value)} /></div>
          <div><FieldLabel htmlFor="inquiry-request-country">Country / market</FieldLabel><select id="inquiry-request-country" aria-label="Country or market" required className={inputClassName()} value={contact.country} onChange={(event) => setContactField("country", event.target.value)}><option value="">Select destination</option>{COUNTRIES.map((country) => <option key={country} value={country}>{country}</option>)}</select>{contact.country === "Other" && <input id="inquiry-request-country-other" aria-label="Custom country or market" required className={`${inputClassName()} mt-2`} placeholder="Enter country or market" value={contact.countryOther} onChange={(event) => setContactField("countryOther", event.target.value)} />}</div>
          <div><FieldLabel htmlFor="inquiry-request-email">Email</FieldLabel><input id="inquiry-request-email" aria-label="Email" required className={inputClassName()} type="email" value={contact.email} onChange={(event) => setContactField("email", event.target.value)} /></div>
          <div><FieldLabel htmlFor="inquiry-request-phone" optional>Phone number</FieldLabel><div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2"><CallingCodeSelect label="Phone" value={contact.phonePrefix} onChange={(value) => setContactField("phonePrefix", value)} /><input id="inquiry-request-phone" aria-label="Phone" className={inputClassName()} placeholder="Phone number" value={contact.phone} onChange={(event) => setContactField("phone", event.target.value)} /></div></div>
        </div><div className="mt-4"><FieldLabel htmlFor="inquiry-request-requirements" optional>Additional requirements</FieldLabel><textarea id="inquiry-request-requirements" aria-label="Additional requirements" className="min-h-24 w-full resize-y rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-theme/70 focus:ring-2 focus:ring-theme/15" placeholder="Tell us anything else we should know." value={contact.requirements} onChange={(event) => setContactField("requirements", event.target.value)} /></div></fieldset>
        {error && <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</p>}
        <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-slate-500">Submitting creates a request only. A Sales/Admin quotation is handled separately.</p><button type="submit" disabled={busy || !pricePreview} className="btn-primary shrink-0 rounded-lg px-5 py-2.5 text-sm font-black disabled:opacity-50">{busy ? "Submitting…" : "Apply quotation"}</button></div>
      </form>
    </Dialog>
    <Dialog open={detail !== null} onOpenChange={(isOpen) => { if (!isOpen) setDetail(null); }} className="max-w-xl"><DialogHeader><p className="text-[10px] font-black uppercase tracking-[0.18em] text-theme">Quotation application</p><DialogTitle>Request details</DialogTitle></DialogHeader>{detail && <div className="grid gap-4 text-sm"><div className="rounded-lg border border-white/10 bg-black/15 p-4"><p className="text-xs font-bold text-slate-500">Requested vehicle</p><p className="mt-1 font-bold text-white">{detailVehicleLabel}</p><dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs"><dt className="text-slate-500">Quantity</dt><dd className="text-right text-slate-200">{detail.quantity} units</dd><dt className="text-slate-500">FOB / unit</dt><dd className="text-right text-slate-200">{formatUsd(detail.fobUnitUsd)}</dd><dt className="text-slate-500">FOB total</dt><dd className="text-right font-bold text-theme">{formatUsd(detail.fobTotalUsd)}</dd></dl></div><div className="rounded-lg border border-white/10 p-4 text-xs text-slate-300"><p className="font-bold text-white">Contact</p><p className="mt-2">{detail.contactName}{detail.company ? ` · ${detail.company}` : ""}</p><p>{detail.country} · {detail.email}</p>{detail.phone && <p>{detail.phonePrefix} {detail.phone}</p>}{detail.requirements && <p className="mt-3 whitespace-pre-wrap border-t border-white/10 pt-3 text-slate-400">{detail.requirements}</p>}</div></div>}</Dialog>
  </section>;
}
