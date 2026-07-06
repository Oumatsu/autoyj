"use client";

import { useTranslation } from "@/i18n/useTranslation";

export default function TermsPage() {
  const { t, tArray } = useTranslation();
  const sections = tArray("terms.sections");

  return (
    <main className="pt-32 pb-24 bg-a min-h-screen">
      <div className="container mx-auto px-6 md:px-12 max-w-3xl">
        <div className="label label-gold mb-6">{t("terms.badge")}</div>
        <h1 className="sh mb-4">
          {t("terms.title")}{" "}
          <span className="text-theme">{t("terms.titleAccent")}</span>
        </h1>
        <p className="text-gray-500 text-sm font-light mb-12">
          {t("terms.lastUpdated")}
        </p>

        <div className="prose prose-invert max-w-none space-y-10">
          {sections.map((section, index) => (
            <section key={index}>
              <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
                {section.heading}
              </h2>
              {section.content && (
                <p className="text-gray-400 font-light leading-relaxed">
                  {section.content}
                </p>
              )}
              {section.intro && (
                <p className="text-gray-400 font-light leading-relaxed mb-4">
                  {section.intro}
                </p>
              )}
              {section.items && (
                <ul className="list-disc list-inside text-gray-400 font-light space-y-2 ml-4">
                  {section.items.map((item: string, i: number) => {
                    const parts = item.split("：");
                    if (parts.length > 1) {
                      return (
                        <li key={i}>
                          <strong className="text-white">{parts[0]}：</strong>
                          {parts.slice(1).join("：")}
                        </li>
                      );
                    }
                    const partsEn = item.split(": ");
                    if (partsEn.length > 1) {
                      return (
                        <li key={i}>
                          <strong className="text-white">{partsEn[0]}: </strong>
                          {partsEn.slice(1).join(": ")}
                        </li>
                      );
                    }
                    return <li key={i}>{item}</li>;
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
