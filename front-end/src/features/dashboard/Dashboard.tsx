import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, ShieldCheck, CalendarClock, AlertTriangle, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { Stat } from '../../components/Stat';
import { TL } from '../../components/TrafficLight';
import { api } from '../../lib/api';

export default function Dashboard() {
  const { t, tasks, lang, widgets } = useApp();

  const [stats, setStats] = useState<{ readiness: number; open: number; active: number; days: number | null } | null>(null);
  const [clearItems, setClearItems] = useState<{ label: string; color: string }[]>([]);
  const [Bootcamps, setBootcamps] = useState<any[]>([]);
  const [trend, setTrend] = useState<{ w: string; v: number }[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [trainerQuals, setTrainerQuals] = useState<any[]>([]);
  const [hasOpenCapa, setHasOpenCapa] = useState(false);
  const [integrationRate, setIntegrationRate] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [
          parts, capa, readiness, tenant, allDocs, meas,
          attTrend, tQuals, allRecords, placementStats,
        ] = await Promise.all([
          api<any[]>('/participants').catch(() => []),
          api<any[]>('/capa').catch(() => []),
          api<any>('/audit/readiness').catch(() => ({ readiness: 0 })),
          api<any>('/tenants/me').catch(() => null),
          api<any[]>('/documents').catch(() => []),
          api<any[]>('/measures').catch(() => []),
          api<any[]>('/attendance/trend').catch(() => []),
          api<any[]>('/trainer-qualifications').catch(() => []),
          api<any[]>('/participant-records').catch(() => []),
          api<any>('/placement-follow-up/stats').catch(() => null),
        ]);

        let days: number | null = null;
        const na = tenant?.nextAudit;
        if (na && /\d{2}\.\d{2}\.\d{4}/.test(na)) {
          const [d, m, y] = na.split('.').map(Number);
          const diff = Math.ceil((new Date(y, m - 1, d).getTime() - Date.now()) / 86400000);
          if (!isNaN(diff)) days = diff;
        }

        const openCapa = (capa || []).filter((c: any) => c.status && c.status !== 'closed');
        setStats({
          readiness: readiness?.readiness ?? 0,
          open: openCapa.length,
          active: (parts || []).length,
          days,
        });

        const items: { label: string; color: string }[] = [];
        const missingDocs = (allDocs || []).filter((d: any) => d.status === 'doc_missing').length;
        const incompleteParts = (parts || []).filter((p: any) => (p.fileCompleteness ?? 0) < 100).length;

        if (openCapa.length > 0) items.push({ label: lang === 'de' ? `${openCapa.length} offene CAPA` : `${openCapa.length} open CAPA`, color: C.rose });
        if (missingDocs > 0) items.push({ label: lang === 'de' ? `${missingDocs} fehlende Dokumente` : `${missingDocs} missing documents`, color: C.rose });
        if (incompleteParts > 0) items.push({ label: lang === 'de' ? `${incompleteParts} unvollständige Teilnehmerakten` : `${incompleteParts} incomplete participant files`, color: C.amber });
        setClearItems(items);

        setBootcamps(meas || []);
        setTrend(Array.isArray(attTrend) ? attTrend : []);
        setDocs(Array.isArray(allDocs) ? allDocs : []);
        setParticipants(Array.isArray(parts) ? parts : []);
        setRecords(Array.isArray(allRecords) ? allRecords : []);
        setTrainerQuals(Array.isArray(tQuals) ? tQuals : []);
        setHasOpenCapa(openCapa.length > 0);
        setIntegrationRate(placementStats?.integrationRate ?? null);
      } catch (e) {
        console.error('dashboard stats failed', e);
      }
    })();
  }, [lang]);

  const avgAtt = trend.length > 0 ? Math.round(trend.reduce((s, x) => s + x.v, 0) / trend.length) : null;

  const isComplete = (d: any) => d.status && d.status !== 'doc_missing';
  const isCert = (d: any) => /cert|zeugnis|zertifikat/i.test(d.type || '');

  const isValidDate = (s?: string | null) => {
    if (!s || !/\d{2}\.\d{2}\.\d{4}/.test(s)) return false;
    const [d, m, y] = s.split('.').map(Number);
    return new Date(y, m - 1, d).getTime() >= Date.now();
  };

  const trainerStatus: 'g' | 'a' | 'r' =
    trainerQuals.length === 0 ? 'r'
      : trainerQuals.some((q) => isValidDate(q.validUntil)) ? 'g'
      : 'a';

  const complaintsStatus: 'g' | 'r' = hasOpenCapa ? 'r' : 'g';

  const compliance = (m: any) => {
    const mParts = participants.filter((p) => p.measureId === m.id);
    const partIds = new Set(mParts.map((p) => p.id));

    let sig: 'g' | 'a' | 'r';
    if (mParts.length === 0) {
      sig = 'r';
    } else {
      const signedPartIds = new Set(
        records.filter((r) => r.signed === true && partIds.has(r.participantId)).map((r) => r.participantId)
      );
      const n = signedPartIds.size;
      sig = n === 0 ? 'r' : n === mParts.length ? 'g' : 'a';
    }

    const certs = docs.filter((d) => d.measureId === m.id && isCert(d));
    const cert =
      certs.length === 0 ? 'r'
        : certs.every(isComplete) ? 'g'
        : certs.some(isComplete) ? 'a'
        : 'r';

    return { sig, trainer: trainerStatus, cert, complaints: complaintsStatus };
  };

  return (
    <>
      {/* ===== STATS ===== */}
      {widgets.stats && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: 18 }}>
          <Stat icon={<ShieldCheck size={18} />} num={stats ? `${stats.readiness}%` : '…'} label={t('readiness')} tone={C.mint} />
          <Stat icon={<AlertTriangle size={18} />} num={stats ? String(stats.open) : '…'} label={t('open_pts')} tone={C.rose} />
          <Stat icon={<Users size={18} />} num={stats ? String(stats.active) : '…'} label={t('active_part')} tone={C.iris} />
          <Stat icon={<CalendarClock size={18} />} num={stats && stats.days != null ? stats.days + ' ' + (lang === 'de' ? 'T' : 'd') : '…'} label={t('to_audit')} tone={C.blue} />
          <Stat
            icon={<TrendingUp size={18} />}
            num={integrationRate !== null ? `${integrationRate}%` : '—'}
            label={lang === 'de' ? 'Eingliederungsquote' : 'Integration rate'}
            tone={integrationRate !== null && integrationRate >= 70 ? C.mint : C.amber}
          />
        </div>
      )}

      {/* ===== TREND + CLEAR ===== */}
      {(widgets.trend || widgets.clear) && (
        <div className="grid" style={{ gridTemplateColumns: widgets.trend && widgets.clear ? '1.5fr 1fr' : '1fr', marginBottom: 15 }}>
          {widgets.trend && (
            <div className="card">
              <div className="card-head">
                <div className="card-title">{t('att_trend')}</div>
                {avgAtt != null && <span className="badge" style={{ background: C.mint + '22', color: C.mint }}>Ø {avgAtt}%</span>}
              </div>
              {trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={208}>
                  <AreaChart data={trend} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.iris} stopOpacity={0.32} />
                        <stop offset="100%" stopColor={C.iris} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
                    <XAxis dataKey="w" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: C.muted }} axisLine={false} tickLine={false} />
                    <YAxis domain={[80, 100]} tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: C.muted }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12, fontFamily: 'JetBrains Mono' }} />
                    <Area type="monotone" dataKey="v" stroke={C.iris} strokeWidth={2.5} fill="url(#g1)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 208, display: 'grid', placeItems: 'center', color: C.muted, fontSize: 13, textAlign: 'center', padding: 20 }}>
                  {lang === 'de'
                    ? 'Noch keine Anwesenheitsdaten.'
                    : 'No attendance data yet.'}
                </div>
              )}
            </div>
          )}

          {widgets.clear && (
            <div className="card">
              <div className="card-head"><div className="card-title">{t('to_clear')}</div></div>
              {tasks.map((task: string, i: number) => (
                <div key={'t' + i} style={{ display: 'flex', gap: 11, alignItems: 'center', padding: '11px 0', borderTop: i ? `1px solid ${C.lineSoft}` : 'none' }}>
                  <Sparkles size={15} color={C.iris} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, fontWeight: 600, fontSize: 12.5 }}>{task}</div>
                </div>
              ))}
              {clearItems.length === 0 && tasks.length === 0 && (
                <div style={{ padding: '14px 0', fontSize: 12.5, color: C.muted }}>
                  {lang === 'de' ? 'Nichts offen — alles bereit.' : 'Nothing open — all clear.'}
                </div>
              )}
              {clearItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'center', padding: '11px 0', borderTop: (i || tasks.length) ? `1px solid ${C.lineSoft}` : 'none' }}>
                  <div style={{ width: 9, height: 9, borderRadius: 50, background: item.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, fontWeight: 600, fontSize: 12.5 }}>{item.label}</div>
                  <ChevronRight size={15} color={C.muted} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== INTEGRATION RATE BAR ===== */}
      {integrationRate !== null && widgets.stats && (
        <div className="card" style={{ marginBottom: 15, padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={14} color={C.mint} />
              {lang === 'de' ? 'Eingliederungsquote (AZAV)' : 'Integration rate (AZAV)'}
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, color: integrationRate >= 70 ? C.mint : C.amber }}>
              {integrationRate}%
            </span>
          </div>
          <div style={{ height: 10, borderRadius: 99, background: C.line, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99, transition: 'width .5s',
              width: `${integrationRate}%`,
              background: integrationRate >= 70 ? C.mint : C.amber,
            }} />
          </div>
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 6 }}>
            {lang === 'de'
              ? `AZAV-Zielwert: ≥ 70% · aktuell: ${integrationRate}%`
              : `AZAV target: ≥ 70% · current: ${integrationRate}%`}
          </div>
        </div>
      )}

      {/* ===== COMPLIANCE TABLE ===== */}
      {widgets.compliance && (
        <div className="card" style={{ padding: '19px 8px 8px' }}>
          <div className="card-head" style={{ padding: '0 13px' }}>
            <div className="card-title">{t('compl_by_meas')}</div>
            <span style={{ fontSize: 11.5, color: C.muted, display: 'flex', gap: 13 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><TL s="g" /> {t('legend_ok')}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><TL s="a" /> {t('legend_check')}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><TL s="r" /> {t('legend_crit')}</span>
            </span>
          </div>
          <div className="scroll-x">
            <table>
              <thead>
                <tr>
                  <th>{t('col_meas')}</th>
                  <th className="hide-mobile">Nr.</th>
                  <th style={{ textAlign: 'center' }}>{t('c_sign')}</th>
                  <th style={{ textAlign: 'center' }}>{t('c_train')}</th>
                  <th style={{ textAlign: 'center' }}>{t('c_cert')}</th>
                  <th style={{ textAlign: 'center' }}>{t('c_compl')}</th>
                </tr>
              </thead>
              <tbody>
                {Bootcamps.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 16, color: C.muted, fontSize: 13 }}>
                      {lang === 'de' ? 'Keine Maßnahmen' : 'No Bootcamps'}
                    </td>
                  </tr>
                )}
                {Bootcamps.map((m, i) => {
                  const c = compliance(m);
                  return (
                    <tr key={m.id ?? i}>
                      <td className="cell-name">{m.name}</td>
                      <td className="hide-mobile mono" style={{ color: C.muted }}>{m.number ?? m.nr ?? '—'}</td>
                      <td style={{ textAlign: 'center' }}><TL s={c.sig} /></td>
                      <td style={{ textAlign: 'center' }}><TL s={c.trainer} /></td>
                      <td style={{ textAlign: 'center' }}><TL s={c.cert} /></td>
                      <td style={{ textAlign: 'center' }}><TL s={c.complaints} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}