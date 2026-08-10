"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { T } from "@tolgee/react";

export default function PrivacyPage() {
  const { t, tArray } = useTranslation();
  const sections = tArray("privacy.sections");

  return (
    <main className="pt-32 pb-24 bg-a min-h-screen">
      <div className="container mx-auto px-6 md:px-12 max-w-3xl">
        <div className="label label-gold mb-6">{t("privacy.badge")}</div>
        <h1 className="sh mb-4">
          <T keyName="privacy.title" params={{ theme: <span className="text-theme" /> }} />
        </h1>
        <p className="text-gray-500 text-sm font-light mb-12">
          {t("privacy.lastUpdated")}
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
                  {section.items.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
