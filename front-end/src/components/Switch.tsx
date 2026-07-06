export function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button className={'sw' + (on ? ' on' : '')} role="switch" aria-checked={on} onClick={onToggle}>
      <span className="sw-knob" />
    </button>
  );
}
