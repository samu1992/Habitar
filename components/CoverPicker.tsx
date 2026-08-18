'use client';

import { useState } from 'react';

/** Selector de foto de portada: input de archivo disfrazado de tarjeta con preview. */
export default function CoverPicker({ currentUrl }: { currentUrl?: string | null }) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);

  return (
    <div>
      <label className="label">Foto de portada</label>
      <label className="relative flex aspect-[4/3] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-obra-line bg-obra-raised">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm text-muted">Tocá para elegir una foto</span>
        )}
        <input
          type="file"
          name="cover"
          accept="image/*"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setPreview(URL.createObjectURL(file));
          }}
        />
      </label>
    </div>
  );
}
