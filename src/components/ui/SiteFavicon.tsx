"use client";
import { useState } from "react";

export default function SiteFavicon({
  host,
  fallback,
  size = 40,
}: {
  host: string;
  fallback: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const px = `${size}px`;

  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] text-sm font-medium text-white/70"
      style={{ width: px, height: px }}
    >
      {failed ? (
        <span>{fallback}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`}
          alt=""
          width={size - 12}
          height={size - 12}
          onError={() => setFailed(true)}
          className="h-[60%] w-[60%] object-contain"
        />
      )}
    </div>
  );
}
