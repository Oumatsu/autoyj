"use client";

import { use, useEffect, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import VehicleDetail from "../../../app/products/_VehicleDetail";
import Loading from "@/components/Loading";

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
        return res.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, [slug]);

  if (error) return <div className="text-center py-20 text-gray-500">{t("productsDetail.modelNotFound")}</div>;
  if (!data) return <Loading text={t("productsDetail.loading")} />;

  return <VehicleDetail data={data} />;
}
