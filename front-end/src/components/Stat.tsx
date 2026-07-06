import { TrendingUp } from 'lucide-react';
import { C } from '../theme/tokens';

export const Stat = ({ icon, num, label, trend, tone = C.mint }: any) => (
  <div className="stat">
    <div className="stat-top"><div className="stat-icon" style={{ background: tone + '22', color: tone }}>{icon}</div>
      {trend && <span className="trend" style={{ color: C.mint }}><TrendingUp size={13} />{trend}</span>}</div>
    <div className="stat-num">{num}</div><div className="stat-label">{label}</div>
  </div>
);
