"use client";

import { use, useEffect, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import VehicleDetail from "../../../app/products/_VehicleDetail";
import Loading from "@/components/Loading";
import { sanitizeDisplayData } from "@/lib/display-text";

function normalizeCategory(value: unknown): string {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "revenue" || normalized === "ride-hailing") return "revenue-king";
  if (normalized === "flagship" || normalized === "luxury") return "elite-flagship";
  if (normalized === "utility" || normalized === "commercial") return "utility-pro";
  return normalized;
}

export default function DynamicVehiclePage({ params }: any) {
  const { t } = useTranslation();
  const resolvedParams: any = params && typeof params.then === "function" ? use(params) : params;
  const { category, slug } = resolvedParams || {};
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/portal/public/products/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json().then((payload) => {
          const normalized = sanitizeDisplayData(payload);
          if (!normalized || typeof normalized !== "object") throw new Error();
          if (normalizeCategory((normalized as any).category) !== normalizeCategory(category)) {
            throw new Error();
          }
          return normalized;
        });
      })
      .then(setData)
      .catch(() => setError(true));
  }, [category, slug]);

  if (error) return <div role="alert" data-not-found="true" className="text-center py-20 text-gray-500">{t("productsDetail.modelNotFound")}</div>;
  if (!data) return <Loading text={t("productsDetail.loading")} />;

  return <VehicleDetail data={data} />;
}
