"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { LocaleLink } from "@/i18n/LocaleLink";
import { useState, type FormEvent } from "react";

export default function RequestQuotePage() {
  const { t, tArray, tObject } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const serviceTiers = tObject("solutionsRequestQuote.tiers");
  const whatsIncludedItems = tArray("solutionsRequestQuote.included.items");
  const tierOptions = tArray("solutionsRequestQuote.form.tierOptions");
  const sizeOptions = tArray("solutionsRequestQuote.form.sizeOptions");
  const volumeOptions = tArray("solutionsRequestQuote.form.volumeOptions");
  const powerOptions = tArray("solutionsRequestQuote.form.powerOptions");
  const technicianOptions = tArray("solutionsRequestQuote.form.technicianOptions");
  const equipmentList = tArray("solutionsRequestQuote.form.equipment");
  const countryOptions = tArray("solutionsRequestQuote.form.countryOptions");

  const tierData = [
    {
      tier: serviceTiers.essential?.name || "Essential",
      price: serviceTiers.essential?.price || "$12,000 – $18,000",
      desc: serviceTiers.essential?.desc || "",
      color: "text-accent",
    },
    {
      tier: serviceTiers.professional?.name || "Professional",
      price: serviceTiers.professional?.price || "$25,000 – $40,000",
      desc: serviceTiers.professional?.desc || "",
      color: "text-theme",
    },
    {
      tier: serviceTiers.master?.name || "Master",
      price: serviceTiers.master?.price || "$55,000+",
      desc: serviceTiers.master?.desc || "",
      color: "text-gold",
    },
  ];

  return (
    <>
      <section className="pt-32 pb-20 relative z-10 overflow-hidden min-h-[50vh] flex items-center bg-a">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <LocaleLink
                href="/solutions"
                className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-gold transition"
              >
                {t("solutionsRequestQuote.breadcrumb.solutions")}
              </LocaleLink>
              <span className="text-gray-600">/</span>
              <LocaleLink
                href="/solutions#service"
                className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-gold transition"
              >
                {t("solutionsRequestQuote.breadcrumb.serviceCentre")}
              </LocaleLink>
              <span className="text-gray-600">/</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                {t("solutionsRequestQuote.breadcrumb.quote")}
              </span>
            </div>
            <h1
              className="sh mb-6"
              style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
            >
              {t("solutionsRequestQuote.heading")}{" "}
              <span className="text-theme">{t("solutionsRequestQuote.headingAccent")}</span>{" "}
              {t("solutionsRequestQuote.headingSuffix")}
            </h1>
            <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 leading-relaxed max-w-2xl">
              {t("solutionsRequestQuote.description")}
            </p>
          </div>
        </div>
      </section>

      <main className="py-12 bg-b relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            {/* Equipment Preview */}
            <aside className="lg:col-span-5 order-2 lg:order-1">
              <div className="sticky top-[120px] space-y-6">
                {/* Tier Reference */}
                <div className="glass rounded-[2rem] p-8 md:p-10 border-theme/20">
                  <div className="text-[10px] font-black tracking-widest uppercase text-theme mb-6">
                    {t("solutionsRequestQuote.tiers.title")}
                  </div>
                  <div className="space-y-5">
                    {tierData.map((tier, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-black/20 border border-white/5"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span
                            className={`text-xs font-black uppercase tracking-widest ${tier.color}`}
                          >
                            {tier.tier}
                          </span>
                          <span className="text-xs font-bold text-white">
                            {tier.price}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-light leading-relaxed">
                          {tier.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What's Included */}
                <div className="glass rounded-[2rem] p-8 md:p-10 border-accent/10">
                  <div className="text-[10px] font-black tracking-widest uppercase text-accent mb-6">
                    {t("solutionsRequestQuote.included.title")}
                  </div>
                  <div className="space-y-3">
                    {whatsIncludedItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-accent text-[10px] font-black">
                            ✓
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 font-light">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Quote Form */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="glass rounded-[2rem] p-8 md:p-12">
                <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-2">
                  {t("solutionsRequestQuote.form.title")}
                </h2>
                <p className="text-gray-400 text-xs font-light mb-10">
                  {t("solutionsRequestQuote.form.description")}
                </p>

                <form
                  className="space-y-6"
                  onSubmit={async (e: FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    setSubmitting(true);
                    setSubmitted(false);
                    setError("");
                    const form = e.currentTarget;
                    const data = new FormData(form);
                    try {
                      const response = await fetch("/api/portal/public/contact", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: data.get("name"),
                          company: data.get("company"),
                          email: data.get("email"),
                          message: data.get("message"),
                        }),
                      });
                      if (!response.ok) throw new Error("contact submission failed");
                      setSubmitted(true);
                      form.reset();
                    } catch {
                      setError(t("solutionsRequestQuote.form.submissionError"));
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {/* Service Tier */}
                  <div className="border-b border-white/5 pb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-5">
                      {t("solutionsRequestQuote.form.targetTier")}
                    </h4>
                    <div className="grid gap-3">
                      {[
                        {
                          value: "essential",
                          label: tierOptions[0]?.label || "Essential — 1-Bay Workshop",
                          desc: tierOptions[0]?.desc || "Basic diagnostics and maintenance",
                        },
                        {
                          value: "professional",
                          label: tierOptions[1]?.label || "Professional — 3-Bay Workshop",
                          desc: tierOptions[1]?.desc || "Full diagnostics, alignment, HV tools",
                        },
                        {
                          value: "master",
                          label: tierOptions[2]?.label || "Master — 5+ Bay Facility",
                          desc: tierOptions[2]?.desc || "Complete EV service centre with battery station",
                        },
                      ].map((tier, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 cursor-pointer hover:border-gold/30 transition-all"
                        >
                          <input
                            type="radio"
                            name="tier"
                            value={tier.value}
                            className="hidden peer"
                            defaultChecked={i === 1}
                          />
                          <span className="w-5 h-5 rounded-full border-2 border-white/20 flex items-center justify-center flex-shrink-0 transition-all peer-checked:border-gold">
                            <span className="w-2.5 h-2.5 rounded-full bg-gold opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </span>
                          <div>
                            <div className="text-sm text-white font-semibold">
                              {tier.label}
                            </div>
                            <div className="text-xs text-gray-500 font-light">
                              {tier.desc}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Facility Details */}
                  <div className="border-b border-white/5 pb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-5">
                      {t("solutionsRequestQuote.form.facilityDetails")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                          {t("solutionsRequestQuote.form.workshopSize")}
                        </label>
                        <select
                          required
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            {t("solutionsRequestQuote.form.sizePlaceholder")}
                          </option>
                          <option value="under-100">{sizeOptions[0]}</option>
                          <option value="100-200">{sizeOptions[1]}</option>
                          <option value="200-500">{sizeOptions[2]}</option>
                          <option value="500-plus">{sizeOptions[3]}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                          {t("solutionsRequestQuote.form.monthlyVehicles")}
                        </label>
                        <select
                          required
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            {t("solutionsRequestQuote.form.volumePlaceholder")}
                          </option>
                          <option value="1-10">{volumeOptions[0]}</option>
                          <option value="10-30">{volumeOptions[1]}</option>
                          <option value="30-100">{volumeOptions[2]}</option>
                          <option value="100-plus">{volumeOptions[3]}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                          {t("solutionsRequestQuote.form.powerSupply")}
                        </label>
                        <select
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            {t("solutionsRequestQuote.form.powerPlaceholder")}
                          </option>
                          <option value="3phase-available">{powerOptions[0]}</option>
                          <option value="single-phase">{powerOptions[1]}</option>
                          <option value="unknown">{powerOptions[2]}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                          {t("solutionsRequestQuote.form.technicianCount")}
                        </label>
                        <select
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            {t("solutionsRequestQuote.form.technicianPlaceholder")}
                          </option>
                          <option value="0">{technicianOptions[0]}</option>
                          <option value="1-3">{technicianOptions[1]}</option>
                          <option value="4-10">{technicianOptions[2]}</option>
                          <option value="10-plus">{technicianOptions[3]}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Equipment Preferences */}
                  <div className="border-b border-white/5 pb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-5">
                      {t("solutionsRequestQuote.form.equipmentPreferences")}
                    </h4>
                    <div className="space-y-3">
                      {equipmentList.map((equip, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 cursor-pointer hover:border-gold/30 transition-all"
                        >
                          <input
                            type="checkbox"
                            className="hidden peer"
                            defaultChecked={i < 4}
                          />
                          <span className="w-5 h-5 border-2 border-white/20 rounded flex items-center justify-center flex-shrink-0 transition-all peer-checked:bg-gold peer-checked:border-gold">
                            <span className="text-black text-[10px] font-black opacity-0 peer-checked:opacity-100 transition-opacity">
                              ✓
                            </span>
                          </span>
                          <div className="flex-1">
                            <div className="text-sm text-white font-semibold">
                              {equip.name}
                            </div>
                            <div className="text-xs text-gray-500 font-light">
                              {equip.desc}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-theme w-24 text-right">
                            {equip.price}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-5">
                      {t("solutionsRequestQuote.form.contactDetails")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                          {t("solutionsRequestQuote.form.fullName")}
                        </label>
                        <input
                          type="text"
                          required
                          name="name"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                          {t("solutionsRequestQuote.form.company")}
                        </label>
                        <input
                          type="text"
                          required
                          name="company"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                          placeholder="Autos Africa Ltd."
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                          {t("solutionsRequestQuote.form.country")}
                        </label>
                        <select
                          required
                          name="country"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            {t("solutionsRequestQuote.form.countryPlaceholder")}
                          </option>
                          <option value="kenya">{countryOptions[0]}</option>
                          <option value="tanzania">{countryOptions[1]}</option>
                          <option value="uganda">{countryOptions[2]}</option>
                          <option value="nigeria">{countryOptions[3]}</option>
                          <option value="ghana">{countryOptions[4]}</option>
                          <option value="ethiopia">{countryOptions[5]}</option>
                          <option value="rwanda">{countryOptions[6]}</option>
                          <option value="other">{countryOptions[7]}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                          {t("solutionsRequestQuote.form.email")}
                        </label>
                        <input
                          type="email"
                          required
                          name="email"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                          placeholder="john@company.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                      {t("solutionsRequestQuote.form.additionalRequirements")}
                    </label>
                    <textarea
                      rows={3}
                      name="message"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors resize-none"
                      placeholder={t("solutionsRequestQuote.form.additionalRequirementsPlaceholder") as string}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-primary py-5 rounded-xl text-sm font-black tracking-widest uppercase italic"
                    style={{
                      boxShadow: "0 0 40px -10px rgba(197,160,89,0.5)",
                    }}
                  >
                    {submitting ? t("solutionsRequestQuote.form.submitting") : t("solutionsRequestQuote.form.submitButton")}
                  </button>
                  {submitted && (
                    <p role="status" className="text-center text-sm text-green">
                      {t("solutionsRequestQuote.form.submissionSuccess")}
                    </p>
                  )}
                  {error && (
                    <p role="alert" className="text-center text-sm text-red-400">
                      {error}
                    </p>
                  )}
                  <p className="text-center text-[9px] font-black uppercase tracking-widest text-gray-600 mt-3">
                    {t("solutionsRequestQuote.form.submitNote")}
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CTA Banner */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/pic/hero/photo-1521791136064-7986c2920216.webp"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.28) grayscale(20%)" }}
            alt="Workshop"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="label label-gold justify-center mb-4">
              {t("solutionsRequestQuote.cta.badge")}
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic mb-4">
              {t("solutionsRequestQuote.cta.heading")}
            </h3>
            <p className="text-gray-400 text-sm font-light mb-8">
              {t("solutionsRequestQuote.cta.description")}
            </p>
            <LocaleLink
              href="/contact"
              className="btn-outline px-9 py-4 rounded text-xs font-black tracking-widest uppercase italic"
            >
              {t("solutionsRequestQuote.cta.button")}
            </LocaleLink>
          </div>
        </div>
      </section>
    </>
  );
}
