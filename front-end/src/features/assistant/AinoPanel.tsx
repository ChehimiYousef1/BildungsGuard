import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Check, ArrowRight, Send, Compass, UserCheck, ShieldCheck, FileCheck2, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme/tokens';
import { sendToAino } from './useAino';
import { ACT_ICON } from './actionIcons';

export default function AinoPanel() {
  const ctx = useApp();
  const { t, lang, aiOpen: open, setAiOpen: setOpen } = ctx;
  const de = lang === 'de';
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [doneActs, setDoneActs] = useState<any>({});
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading, open]);

  const runAction = (a: any, mi: number, ai: number) => {
    const kdone = mi + '-' + ai;
    if (a.type === 'navigate') ctx.navigate(a.role || 'verwaltung', a.view || 'home');
    else if (a.type === 'complete_akte') ctx.completeAkte(a.name);
    else if (a.type === 'create_capa') ctx.createCapa({ desc: a.desc, owner: a.owner, due: a.due });
    else if (a.type === 'add_task') ctx.addTask(a.text);
    else if (a.type === 'draw_sample') ctx.drawSample(a.n || 5);
    setDoneActs((d: any) => ({ ...d, [kdone]: true }));
  };

  const send = async (text?: string) => {
    const content = (text != null ? text : input).trim();
    if (!content || loading) return;
    const next = [...messages, { role: 'user', content }];
    setMessages(next); setInput(''); setLoading(true);
    try {
      const data = await sendToAino(next.map((m) => ({ role: m.role, content: m.content })), lang);
      const reply = typeof data.reply === 'string' ? data.reply : (de ? 'Dazu habe ich gerade keine Antwort.' : 'I have no answer right now.');
      const actions = Array.isArray(data.actions) ? data.actions.filter((a: any) => a && a.type && a.label) : [];
      setMessages((m) => [...m, { role: 'assistant', content: reply, actions }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: de ? 'Entschuldigung — die Antwort konnte gerade nicht geladen werden.' : 'Sorry — the response could not be loaded.' }]);
    } finally { setLoading(false); }
  };

  const caps = de ? [
    { ic: Compass, col: C.iris, tx: 'Was muss ich vor dem Audit am 12.08. erledigen?', cmd: 'Was muss ich vor dem Audit am 12.08. erledigen?' },
    { ic: UserCheck, col: C.blue, tx: 'Vervollständige die Akte von Noah Williams', cmd: 'Vervollständige die Akte von Noah Williams.' },
    { ic: ShieldCheck, col: C.plum, tx: 'Lege eine CAPA für S. Brandt an', cmd: 'Lege eine CAPA für den fehlenden Nachweis von S. Brandt an.' },
    { ic: FileCheck2, col: C.mint, tx: 'Zieh 5 Akten für ein Probe-Audit', cmd: 'Zieh mir 5 Akten für ein Probe-Audit.' },
  ] : [
    { ic: Compass, col: C.iris, tx: 'What do I need to do before the 12 Aug audit?', cmd: 'What do I need to do before the audit on 12 Aug?' },
    { ic: UserCheck, col: C.blue, tx: 'Complete Noah Williams\u2019 participant file', cmd: 'Complete Noah Williams\u2019 participant file.' },
    { ic: ShieldCheck, col: C.plum, tx: 'Log a CAPA for S. Brandt\u2019s missing proof', cmd: 'Log a CAPA for S. Brandt\u2019s missing proof.' },
    { ic: FileCheck2, col: C.mint, tx: 'Draw 5 files for a mock audit', cmd: 'Draw me 5 files for a mock audit.' },
  ];

  if (!open) return <button className="fab" aria-label="Aino" onClick={() => setOpen(true)}><Sparkles size={26} /></button>;
  return (
    <div className="ai-panel" role="dialog" aria-label="Aino">
      <div className="ai-head">
        <div className="ai-orb-sm"><Sparkles size={21} /></div>
        <div className="ai-htext">
          <div className="ai-name">Aino</div>
          <div className="ai-sub"><span className="ai-live" /> {de ? 'Online · dein KI-Agent' : 'Online · your AI agent'}</div>
        </div>
        <button className="ai-close" aria-label="close" onClick={() => setOpen(false)}><X size={17} /></button>
      </div>
      <div className="ai-msgs">
        {messages.length === 0 && (
          <div className="ai-hero">
            <div className="ai-orb"><Sparkles size={28} /></div>
            <div className="ai-hello">{de ? 'Hallo, ich bin Aino' : 'Hi, I\u2019m Aino'}</div>
            <div className="ai-intro">{t('ai_intro')}</div>
            <div className="ai-caps">
              {caps.map((c, i) => (
                <button key={i} className="ai-cap" onClick={() => send(c.cmd)}>
                  <div className="ai-cap-ic" style={{ background: c.col + '22', color: c.col }}><c.ic size={17} /></div>
                  <span className="ai-cap-tx">{c.tx}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, mi) => m.role === 'user'
          ? <div key={mi} className="ai-bubble user">{m.content}</div>
          : (
            <div key={mi} className="ai-row">
              <div className="ai-av"><Sparkles size={14} /></div>
              <div className="ai-col">
                <div className="ai-bubble bot">{m.content}</div>
                {(m.actions || []).map((a: any, ai: number) => {
                  const done = doneActs[mi + '-' + ai]; const Ic = ACT_ICON[a.type] || Zap;
                  return (
                    <button key={ai} className={'ai-act' + (done ? ' done' : '')} disabled={done} onClick={() => runAction(a, mi, ai)}>
                      <div className="ai-act-ic">{done ? <Check size={16} /> : <Ic size={16} />}</div>
                      <span className="ai-act-tx">{done ? (de ? 'Erledigt: ' : 'Done: ') + a.label : a.label}</span>
                      {!done && <ArrowRight size={15} className="ai-act-go" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        {loading && <div className="ai-row"><div className="ai-av"><Sparkles size={14} /></div><div className="ai-bubble bot ai-dots"><span /><span /><span /></div></div>}
        <div ref={endRef} />
      </div>
      <div className="ai-foot">
        <div className="ai-inputwrap">
          <textarea className="ai-text" rows={1} value={input} placeholder={t('ai_ph')} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
          <button className="ai-send" aria-label="send" disabled={loading || !input.trim()} onClick={() => send()}><Send size={18} /></button>
        </div>
        <div className="ai-hint">{de ? 'Aino führt Aktionen erst nach deiner Bestätigung aus' : 'Aino runs actions only after you confirm'}</div>
      </div>
    </div>
  );
}
