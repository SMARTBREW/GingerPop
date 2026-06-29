export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="spinner" role="status" aria-label={label} />
      <p className="text-base text-gray-500">{label}</p>
    </div>
  );
}
