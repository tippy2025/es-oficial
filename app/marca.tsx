/** Marca propia: escudo con signo de pregunta — "¿puedo confiar en esto?". */
export function Escudo({
  className = "",
  colorPregunta = "#232d4f",
}: {
  className?: string;
  /** color del signo de pregunta: tiene que contrastar con el del escudo */
  colorPregunta?: string;
}) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path
        d="M24 3.5 8.5 9.2v13.4c0 9.9 6.4 19.2 15.5 22 9.1-2.8 15.5-12.1 15.5-22V9.2L24 3.5Z"
        fill="currentColor"
      />
      <path
        d="M20.1 19.4c0-2.3 1.8-4 4-4s3.9 1.5 3.9 3.6c0 1.7-.9 2.6-2.4 3.6-1.3.9-1.8 1.6-1.8 3v.8h-3v-1.1c0-2.1.8-3.3 2.4-4.3 1.1-.7 1.5-1.2 1.5-2 0-.9-.7-1.5-1.7-1.5s-1.8.7-1.8 1.9h-3.1Zm2.3 12.9c0-1.1.8-1.9 1.9-1.9s1.9.8 1.9 1.9-.8 1.9-1.9 1.9-1.9-.8-1.9-1.9Z"
        fill={colorPregunta}
      />
    </svg>
  );
}

/** Marca completa con el nombre, para el header. */
export function Marca({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Escudo className="h-8 w-8 text-[var(--azul)]" colorPregunta="#ffffff" />
      <span className="text-lg font-bold tracking-tight text-[var(--azul)]">¿Es Oficial?</span>
    </div>
  );
}
