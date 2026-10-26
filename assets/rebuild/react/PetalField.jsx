import "./petal-field.css";

const PETALS = Array.from({ length: 12 }, (_, index) => ({
  id: index,
  x: 4 + ((index * 29) % 92),
  drift: -64 + ((index * 37) % 128),
  duration: 24 + (index % 7),
  delay: -(3 + ((index * 5) % 29)),
  sway: 5 + (index % 3),
  scale: 0.65 + ((index * 11) % 45) / 100,
}));

function Petal() {
  return (
    <svg viewBox="0 0 32 24" aria-hidden="true">
      <path d="M3 12C8 2 23 1 29 5c-2 9-12 17-26 7Z" />
      <path d="M6 12c7-2 13-4 20-6" className="petal-field__vein" />
    </svg>
  );
}

export default function PetalField({ className = "" }) {
  return (
    <div className={`petal-field ${className}`} aria-hidden="true">
      {PETALS.map((petal) => (
        <span
          className="petal-field__fall"
          key={petal.id}
          style={{
            "--petal-x": `${petal.x}%`,
            "--petal-drift": `${petal.drift}px`,
            "--petal-duration": `${petal.duration}s`,
            "--petal-delay": `${petal.delay}s`,
            "--petal-sway": `${petal.sway}s`,
            "--petal-scale": petal.scale,
          }}
        >
          <span className="petal-field__sway"><Petal /></span>
        </span>
      ))}
    </div>
  );
}
