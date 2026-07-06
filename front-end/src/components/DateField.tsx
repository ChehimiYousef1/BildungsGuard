import React from 'react';
import { C } from '../theme/tokens';

// يحوّل DD/MM/YYYY → YYYY-MM-DD (لقيمة input type=date)
function toIso(ddmmyyyy?: string): string {
  if (!ddmmyyyy) return '';
  const m = ddmmyyyy.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return '';
  return `${m[3]}-${m[2]}-${m[1]}`;
}

// يحوّل YYYY-MM-DD → DD/MM/YYYY (للتخزين/العرض)
function toDisplay(iso?: string): string {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  return `${m[3]}/${m[2]}/${m[1]}`;
}

/**
 * حقل تاريخ يعرض ويخزّن بصيغة DD/MM/YYYY.
 * value و onChange يتعاملان دائمًا بصيغة DD/MM/YYYY.
 */
export function DateField({ value, onChange, style }: { value: string; onChange: (v: string) => void; style?: React.CSSProperties }) {
  return (
    <input
      type="date"
      value={toIso(value)}
      onChange={(e) => onChange(toDisplay(e.target.value))}
      style={{ width: '100%', marginTop: 5, padding: '8px 11px', borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 13, outline: 'none', ...style }}
    />
  );
}