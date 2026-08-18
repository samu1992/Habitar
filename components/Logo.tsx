import Image from 'next/image';

/** Isotipo de marca. El archivo ya viene en crema (#F5F1E2), listo para fondo oscuro. */
export default function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/habitar-full-label-white.svg"
      alt="Habitar"
      width={647}
      height={186}
      priority
      unoptimized
      className={className}
    />
  );
}
