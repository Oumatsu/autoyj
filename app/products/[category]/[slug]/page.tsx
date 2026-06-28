"use client";

import { use, useEffect, useState } from "react";
import VehicleDetail from "../../_VehicleDetail";

export default function DynamicVehiclePage({ params }: any) {
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

  if (error) return <div className="text-center py-20 text-gray-500">Model Not Found</div>;
  if (!data) return <div className="text-center py-20 text-gray-500">Loading Specifications...</div>;

  return <VehicleDetail data={data} />;
}
