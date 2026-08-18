/** Tile "+ Nuevo": mismo tamaño que ProjectCard, vive como primera tarjeta de Onboarding — ahí es donde cae todo proyecto nuevo. */
export default function AddProjectTile({ onClick, compact = false }: { onClick: () => void; compact?: boolean }) {
  return (
    <button onClick={onClick} className="block text-left active:opacity-80">
      <span className="flex aspect-square w-full items-center justify-center rounded-2xl border border-dashed border-obra-line text-3xl font-light text-muted active:bg-obra-raised">
        +
      </span>
      <p className="mt-2 truncate text-sm font-semibold text-muted">Nuevo proyecto</p>
      {/* Espaciador: iguala la segunda línea (estado) que muestran las tarjetas compactas, para que las filas alineen. */}
      {compact && <p className="mt-0.5 truncate text-[11px] text-transparent">·</p>}
    </button>
  );
}
