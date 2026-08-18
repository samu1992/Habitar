/** Fila "+ Nuevo proyecto" para la vista "Por etapa": vive como primera fila de Onboarding, ahí es donde cae todo proyecto nuevo. */
export default function AddProjectRow({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-obra-line py-4 text-sm font-semibold text-muted active:bg-obra-raised"
    >
      <span className="text-lg leading-none">+</span> Nuevo proyecto
    </button>
  );
}
