interface TabsProps { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void; }
export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="tabs">
      {tabs.map((tb) => (
        <button key={tb.id} className={'tab' + (active === tb.id ? ' on' : '')} onClick={() => onChange(tb.id)}>{tb.label}</button>
      ))}
    </div>
  );
}
