"use client";

import { useTranslation, T } from "@/i18n/useTranslation";
import { LocaleLink } from "@/i18n/LocaleLink";
import { FormEvent, useState } from "react";

export default function ContactPage() {
  const { t, tArray } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const marketOptions = tArray("contact.form.marketOptions").map(String);
  const volumeOptions = tArray("contact.form.volumeOptions").map(String);
  const interestOptions = tArray("contact.form.interestOptions").map(String);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSubmitted(false);
    setError("");

    const formData = new FormData(e.currentTarget);
    const value = (key: string) => String(formData.get(key) ?? "").trim();
    const requirements = value("message");
    const structuredDetails = [
      `Target market: ${value("targetMarket")}`,
      `Estimated monthly volume: ${value("monthlyVolume")}`,
      `Primary interest: ${value("primaryInterest")}`,
    ].join("\n");
    const body = {
      name: value("name"),
      company: value("company"),
      email: value("email"),
      phone: value("phone"),
      targetMarket: value("targetMarket"),
      monthlyVolume: value("monthlyVolume"),
      primaryInterest: value("primaryInterest"),
      message: [requirements, structuredDetails].filter(Boolean).join("\n\n"),
    };

    try {
      const res = await fetch("/api/portal/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("contact submission failed");

      setSubmitted(true);
    } catch {
      setError(String(t("contact.form.error", "Unable to submit your request. Please try again.")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 sm:py-24 md:py-32 bg-a relative min-h-screen flex items-center">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          {/* Left Column */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full">
            <div>
              <div className="label label-gold mb-6">{t("contact.badge")}</div>
              <h1 className="sh mb-6 leading-tight">
                <T
                  keyName="contact.heading"
                  params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" />, br: <br /> }}
                />
              </h1>
              <p
                className="text-gray-400 text-lg font-light leading-relaxed mb-12 border-l-2 border-theme/30 pl-5"
                style={{ borderColor: "rgba(197,160,89,.3)" }}
              >
                {t("contact.description")}
              </p>

              <div className="space-y-4 mb-16">
                <LocaleLink
                  href="/qr"
                  className="contact-card group flex items-center gap-4 p-6 rounded-2xl border border-white/5 hover:border-gold transition-all duration-300 hover:translate-x-1"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="contact-icon w-12 h-12 rounded-full flex items-center justify-center bg-white/5 text-gold group-hover:bg-green group-hover:text-black transition-all">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-green mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />{" "}
                      {t("contact.whatsapp.label")}
                    </div>
                    <div className="text-white font-bold group-hover:text-green transition-colors">
                      {t("contact.whatsapp.title")}
                    </div>
                    <div className="text-xs text-gray-500 font-light mt-1">
                      {t("contact.whatsapp.response")}
                    </div>
                  </div>
                </LocaleLink>

                <a
                  href="mailto:sales@youguard.net"
                  className="contact-card group flex items-center gap-4 p-6 rounded-2xl border border-white/5 hover:border-gold transition-all duration-300 hover:translate-x-1"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="contact-icon w-12 h-12 rounded-full flex items-center justify-center bg-white/5 text-gold group-hover:bg-gold group-hover:text-black transition-all">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">
                      {t("contact.email.label")}
                    </div>
                    <div className="text-white font-bold">
                      {t("contact.email.title")}
                    </div>
                    <div className="text-xs text-gray-500 font-light mt-1">
                      {t("contact.email.subtitle")}
                    </div>
                  </div>
                </a>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2">
                    {t("contact.headquarters.label")}
                  </div>
                  <div className="text-sm text-gray-300 font-semibold mb-1">
                    {t("contact.headquarters.city")}
                  </div>
                  <div className="text-xs text-gray-500 font-light">
                    {t("contact.headquarters.subtitle")}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2">
                    {t("contact.sla.label")}
                  </div>
                  <div className="text-sm text-theme font-semibold mb-1">
                    {t("contact.sla.terms")}
                  </div>
                  <div className="text-xs text-gray-500 font-light">
                    {t("contact.sla.subtitle")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-7">
            <div className="glass rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

              <div className="mb-10 relative z-10">
                <h3 className="text-2xl font-black italic text-white uppercase tracking-tight mb-2">
                  {t("contact.form.title")}
                </h3>
                <p className="text-gray-400 text-xs font-light">
                  {t("contact.form.description")}
                </p>
                {submitted && (
                  <p role="status" className="mt-4 text-sm text-green">
                    {t("contact.form.success", "Thanks — your request has been received.")}
                  </p>
                )}
                {error && (
                  <p role="alert" className="mt-4 text-sm text-red-400">
                    {error}
                  </p>
                )}
              </div>

              <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                      {t("contact.form.contactName")}
                    </label>
                    <input
                      type="text"
                      required
                      name="name"
                      className="form-input w-full"
                      placeholder={t("contact.form.namePlaceholder", "John Doe") as string}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                      {t("contact.form.company")}
                    </label>
                    <input
                      type="text"
                      required
                      name="company"
                      className="form-input w-full"
                      placeholder={t("contact.form.companyPlaceholder", "Autos Africa Ltd.") as string}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                      {t("contact.form.whatsapp")}
                    </label>
                    <input
                      type="tel"
                      required
                      name="phone"
                      className="form-input w-full"
                      placeholder={t("contact.form.phonePlaceholder", "+254 700 000 000") as string}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                      {t("contact.form.email")}
                    </label>
                    <input
                      type="email"
                      required
                      name="email"
                      className="form-input w-full"
                      placeholder={t("contact.form.emailPlaceholder", "john@company.com") as string}
                    />
                  </div>
                </div>

                <div className="py-2 border-b border-white/5" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="targetMarket" className="block text-[10px] font-black uppercase tracking-widest text-gold mb-2 ml-1">
                      {t("contact.form.targetMarket")}
                    </label>
                    <select id="targetMarket" required name="targetMarket" className="form-input w-full">
                      <option value="" disabled defaultValue="">
                        {t("contact.form.marketPlaceholder")}
                      </option>
                      <option value="east-africa">{marketOptions[0]}</option>
                      <option value="west-africa">{marketOptions[1]}</option>
                      <option value="south-africa">{marketOptions[2]}</option>
                      <option value="north-africa">{marketOptions[3]}</option>
                      <option value="other">{marketOptions[4]}</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="monthlyVolume" className="block text-[10px] font-black uppercase tracking-widest text-gold mb-2 ml-1">
                      {t("contact.form.monthlyVolume")}
                    </label>
                    <select id="monthlyVolume" required name="monthlyVolume" className="form-input w-full">
                      <option value="" disabled defaultValue="">
                        {t("contact.form.volumePlaceholder")}
                      </option>
                      <option value="1-3">{volumeOptions[0]}</option>
                      <option value="4-9">{volumeOptions[1]}</option>
                      <option value="10-20">{volumeOptions[2]}</option>
                      <option value="20+">{volumeOptions[3]}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="primaryInterest" className="block text-[10px] font-black uppercase tracking-widest text-gold mb-2 ml-1">
                    {t("contact.form.primaryInterest")}
                  </label>
                  <select id="primaryInterest" required name="primaryInterest" className="form-input w-full">
                    <option value="" disabled defaultValue="">
                      {t("contact.form.interestPlaceholder")}
                    </option>
                    <option value="revenue-king">{interestOptions[0]}</option>
                    <option value="elite">{interestOptions[1]}</option>
                    <option value="utility">{interestOptions[2]}</option>
                    <option value="parts">{interestOptions[3]}</option>
                    <option value="mixed">{interestOptions[4]}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                    {t("contact.form.specificRequirements")}
                  </label>
                  <textarea
                    rows={4}
                    name="message"
                    className="form-input w-full resize-none"
                    placeholder={t("contact.form.requirementsPlaceholder") as string}
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    aria-busy={loading}
                    className="w-full btn-primary py-5 rounded-xl text-sm font-black tracking-widest uppercase italic"
                    style={{
                      boxShadow: "0 0 40px -10px rgba(197,160,89,0.5)",
                    }}
                  >
                    {loading
                      ? t("contact.form.submitting", "Submitting…")
                      : t("contact.form.submitButton")}
                  </button>
                  <p className="text-center text-[9px] font-black uppercase tracking-widest text-gray-600 mt-4">
                    {t("contact.form.privacyNote")}
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
