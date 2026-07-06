interface SegmentedProps { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void; }
export function Segmented({ options, value, onChange }: SegmentedProps) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button key={o.id} className={value === o.id ? 'on' : ''} onClick={() => onChange(o.id)}>{o.label}</button>
      ))}
    </div>
  );
}
