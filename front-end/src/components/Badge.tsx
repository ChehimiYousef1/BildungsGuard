import { useApp } from '../context/AppContext';
import { ST } from '../i18n/status';
import { TONE } from '../theme/tokens';

export function Badge({ s }: any) {
  const { lang } = useApp(); const row = ST[s]; if (!row) return null;
  const color = TONE[row[2]];
  return <span className="badge" style={{ background: color + '22', color }}>{lang === 'de' ? row[0] : row[1]}</span>;
}
