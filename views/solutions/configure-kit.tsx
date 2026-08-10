"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { LocaleLink } from "@/i18n/LocaleLink";
import { T } from "@tolgee/react";
import { useState, type FormEvent } from "react";

export default function ConfigureKitPage() {
  const { t, tArray } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const previewItems = tArray("solutionsConfigureKit.preview.items");
  const partsList = tArray("solutionsConfigureKit.form.parts");
  const addOnsList = tArray("solutionsConfigureKit.form.addOns");

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
                {t("solutionsConfigureKit.breadcrumb.solutions")}
              </LocaleLink>
              <span className="text-gray-600">/</span>
              <LocaleLink
                href="/solutions#parts"
                className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-gold transition"
              >
                {t("solutionsConfigureKit.breadcrumb.partsKit")}
              </LocaleLink>
              <span className="text-gray-600">/</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                {t("solutionsConfigureKit.breadcrumb.configure")}
              </span>
            </div>
            <h1
              className="sh mb-6"
              style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
            >
              <T keyName="solutionsConfigureKit.heading" params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" /> }} />
            </h1>
            <p className="text-xl text-gray-400 font-light italic border-l-2 border-accent/30 pl-6 leading-relaxed max-w-2xl">
              {t("solutionsConfigureKit.description")}
            </p>
          </div>
        </div>
      </section>

      <main className="py-12 bg-b relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            {/* Kit Preview Sidebar */}
            <aside className="lg:col-span-5 order-2 lg:order-1">
              <div className="sticky top-[120px]">
                <div className="glass rounded-[2rem] p-8 md:p-10 border-theme/20">
                  <div className="text-[10px] font-black tracking-widest uppercase text-theme mb-6">
                    {t("solutionsConfigureKit.preview.title")}
                  </div>
                  <div className="space-y-4 mb-8">
                    {previewItems.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between border-b border-white/5 pb-2"
                      >
                        <span className="text-sm text-gray-400 font-light">
                          {item.name}
                        </span>
                        <div className="flex gap-4 items-center">
                          <span className="text-xs font-black text-theme">
                            {item.qty}
                          </span>
                          <span className="text-xs text-gray-500 w-14 text-right">
                            {item.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black uppercase tracking-widest text-white">
                        {t("solutionsConfigureKit.preview.estimatedTotal")}
                      </span>
                      <div className="text-right">
                        <div className="text-xl font-black text-theme">
                          $714
                        </div>
                        <span className="text-[9px] text-gray-500">
                          {t("solutionsConfigureKit.preview.perVehicleKit")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-accent text-xs font-black">!</span>
                      </div>
                      <p className="text-xs text-gray-400 font-light leading-relaxed">
                        {t("solutionsConfigureKit.preview.notice")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Configuration Form */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="glass rounded-[2rem] p-8 md:p-12">
                <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-2">
                  {t("solutionsConfigureKit.form.title")}
                </h2>
                <p className="text-gray-400 text-xs font-light mb-10">
                  {t("solutionsConfigureKit.form.description")}
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
                          phone: data.get("phone"),
                          message: data.get("message"),
                        }),
                      });
                      if (!response.ok) throw new Error("contact submission failed");
                      setSubmitted(true);
                      form.reset();
                    } catch {
                      setError(t("solutionsConfigureKit.form.submissionError"));
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {/* Vehicle Selection */}
                  <div className="border-b border-white/5 pb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-5">
                      {t("solutionsConfigureKit.form.selectVehicles")}
                    </h4>
                    <div className="grid gap-3">
                      {[
                        { brand: "BYD", model: "Seagull Flying", qty: 2 },
                        { brand: "GAC Motor", model: "Aion Y Plus", qty: 1 },
                      ].map((v, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5"
                        >
                          <div className="flex-1">
                            <div className="text-xs font-black uppercase text-white">
                              {v.brand}
                            </div>
                            <div className="text-xs text-gray-400 font-light">
                              {v.model}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase text-gray-500">
                              {t("solutionsConfigureKit.form.qtyLabel")}
                            </span>
                            <input
                              type="number"
                              defaultValue={v.qty}
                              min={1}
                              max={20}
                              className="w-16 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-center focus:border-gold outline-none transition-colors"
                            />
                          </div>
                          <button
                            type="button"
                            className="text-gray-600 hover:text-red-400 transition-colors text-lg"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="mt-3 text-[10px] font-black uppercase tracking-widest text-gold hover:text-white transition-colors flex items-center gap-1"
                    >
                      {t("solutionsConfigureKit.form.addVehicle")}
                    </button>
                  </div>

                  {/* Parts Selection */}
                  <div className="border-b border-white/5 pb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-5">
                      {t("solutionsConfigureKit.form.maintenanceParts")}
                    </h4>
                    <div className="space-y-3">
                      {partsList.map((part, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 cursor-pointer hover:border-gold/30 transition-all"
                        >
                          <input
                            type="checkbox"
                            className="hidden peer"
                            defaultChecked={
                              part.name !== "Charging Cable (Type 2, 7.4 kW)" &&
                              part.name !== "充电线（Type 2，7.4 kW）"
                            }
                          />
                          <span className="w-5 h-5 border-2 border-white/20 rounded flex items-center justify-center flex-shrink-0 transition-all peer-checked:bg-gold peer-checked:border-gold">
                            <span className="text-black text-[10px] font-black opacity-0 peer-checked:opacity-100 transition-opacity">
                              ✓
                            </span>
                          </span>
                          <div className="flex-1">
                            <div className="text-sm text-white font-semibold">
                              {part.name}
                            </div>
                            <div className="text-xs text-gray-500 font-light">
                              {part.desc}
                            </div>
                          </div>
                          <span className="text-sm font-black text-theme w-16 text-right">
                            {part.price}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Optional Add-Ons */}
                  <div className="border-b border-white/5 pb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-5">
                      {t("solutionsConfigureKit.form.optionalAddOns")}
                    </h4>
                    <div className="space-y-3">
                      {addOnsList.map((addon, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 cursor-pointer hover:border-gold/30 transition-all"
                        >
                          <input
                            type="checkbox"
                            className="hidden peer"
                          />
                          <span className="w-5 h-5 border-2 border-white/20 rounded flex items-center justify-center flex-shrink-0 transition-all peer-checked:bg-gold peer-checked:border-gold">
                            <span className="text-black text-[10px] font-black opacity-0 peer-checked:opacity-100 transition-opacity">
                              ✓
                            </span>
                          </span>
                          <div className="flex-1">
                            <div className="text-sm text-gray-300">
                              {addon.name}
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-400 w-16 text-right">
                            {addon.price}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-5">
                      {t("solutionsConfigureKit.form.contactDetails")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                          {t("solutionsConfigureKit.form.fullName")}
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
                          {t("solutionsConfigureKit.form.company")}
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
                          {t("solutionsConfigureKit.form.email")}
                        </label>
                        <input
                          type="email"
                          required
                          name="email"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                          placeholder="john@company.com"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                          {t("solutionsConfigureKit.form.whatsapp")}
                        </label>
                        <input
                          type="tel"
                          required
                          name="phone"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                          placeholder="+254 700 000 000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                      {t("solutionsConfigureKit.form.specialRequirements")}
                    </label>
                    <textarea
                      rows={3}
                      name="message"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors resize-none"
                      placeholder={t("solutionsConfigureKit.form.specialRequirementsPlaceholder") as string}
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
                    {submitting ? t("solutionsConfigureKit.form.submitting") : t("solutionsConfigureKit.form.submitButton")}
                  </button>
                  {submitted && (
                    <p role="status" className="text-center text-sm text-green">
                      {t("solutionsConfigureKit.form.submissionSuccess")}
                    </p>
                  )}
                  {error && (
                    <p role="alert" className="text-center text-sm text-red-400">
                      {error}
                    </p>
                  )}
                  <p className="text-center text-[9px] font-black uppercase tracking-widest text-gray-600 mt-3">
                    {t("solutionsConfigureKit.form.submitNote")}
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
            src="/pic/page/photo-1520038410233-7141be7e6f97.webp"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.28) grayscale(20%)" }}
            alt="Logistics"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="label label-gold justify-center mb-4">
              {t("solutionsConfigureKit.cta.badge")}
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic mb-4">
              {t("solutionsConfigureKit.cta.heading")}
            </h3>
            <p className="text-gray-400 text-sm font-light mb-8">
              {t("solutionsConfigureKit.cta.description")}
            </p>
            <LocaleLink
              href="/contact"
              className="btn-outline px-9 py-4 rounded text-xs font-black tracking-widest uppercase italic"
            >
              {t("solutionsConfigureKit.cta.button")}
            </LocaleLink>
          </div>
        </div>
      </section>
    </>
  );
}
