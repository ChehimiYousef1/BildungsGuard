export function IconButton({ children, label, onClick }: { children: React.ReactNode; label?: string; onClick?: () => void }) {
  return <button className="icon-btn" aria-label={label} onClick={onClick}>{children}</button>;
}
