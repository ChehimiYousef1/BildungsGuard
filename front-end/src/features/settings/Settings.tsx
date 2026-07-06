import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { LayoutDashboard, BookOpen, ClipboardCheck, Users, GraduationCap, ShieldCheck, FolderCheck, Library, FileCheck2, CalendarClock, Award, Bell, ChevronRight, Play, CheckCircle2, Circle, TrendingUp, Plus, AlertTriangle, Download, X, Check, ArrowLeft, Building2, BadgeCheck, FileText, Sparkles, Send, Globe, Zap, Wand2, ListTodo, Compass, ArrowRight, UserCheck, ChevronUp, ChevronDown, Settings, LogOut, Lock, Trash2, Megaphone, Mail, MessageSquare, Smartphone, Linkedin, Contact, Eye, Tags } from 'lucide-react';
import { C, GRAD, AURORA, TONE, TLC } from '../../theme/tokens';
import { ST } from '../../i18n/status';
import { TITLES } from '../../i18n/titles';
import { useApp } from '../../context/AppContext';
import { NAV } from '../../config/nav';
import { PERSON } from '../../config/person';
import { ACCENTS } from '../../config/accents';
import { WIDGETS } from '../../config/widgets';
import { AUTOM } from '../../config/automations';
import { CAT_GROUPS } from '../../config/categories';
import { Stat } from '../../components/Stat';
import { Bar2 } from '../../components/Bar';
import { TL } from '../../components/TrafficLight';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { TRAEGER, ATT_TREND, MASSNAHMEN, CURRICULUM, CHANGELOG, INIT_PART, DOZENTEN, SESSIONS, ATT_PEOPLE, KPIS, QM_DOCS, PROC_EV, INIT_COMPLAINTS, INT_AUDITS, AUDIT_HIST, INIT_ALUMNI, CHANNELS, INIT_CAMPAIGNS, INIT_CATEGORIES, PART_DOCS, COURSE_DOCS, TEMPLATE_SESSIONS } from '../../data';
import AzavDates from './AzavDates';
import OrgName from './OrgName';
import LogoUpload from './LogoUpload';

export default function SettingsView() {
  const { t, role, accent, setAccent, modules, toggleModule, widgets, toggleWidget, signOut, resetCustom, lang } = useApp();
  const toggleable = NAV[role].filter(([id]) => id !== 'home' && id !== 'settings');
  return (
    <div className="set-grid">
      {role === 'verwaltung' && <OrgName />}
      {role === 'verwaltung' && <LogoUpload />}
      {role === 'verwaltung' && <AzavDates />}

      <div className="card">
        <div className="set-section-t">{t('set_appearance')}</div>
        <div className="set-section-s">{t('set_appearance_s')}</div>
        <div className="acc-row">{ACCENTS.map(a => (
          <button key={a.id} className={'acc' + (accent.id === a.id ? ' on' : '')} style={{ background: `linear-gradient(135deg, ${a.a1}, ${a.a2})` }} onClick={() => setAccent(a)} aria-label={a.id} />))}
        </div>
      </div>

      <div className="card">
        <div className="set-section-t">{t('set_modules')}</div>
        <div className="set-section-s">{t('set_modules_s')}</div>
        {toggleable.map(([id, lk, Icon]) => {
          const on = modules[role].includes(id);
          return (<div key={id} className="tg-row"><div className="tg-ic"><Icon size={16} /></div>
            <div className="tg-name">{t(lk)}</div>
            <button className={'sw' + (on ? ' on' : '')} onClick={() => toggleModule(role, id)} aria-label={t(lk)} /></div>);
        })}
      </div>

      {role === 'verwaltung' && <div className="card">
        <div className="set-section-t">{t('set_widgets')}</div>
        <div className="set-section-s">{t('set_widgets_s')}</div>
        {WIDGETS.map(([id, lk]) => (<div key={id} className="tg-row"><div className="tg-ic"><LayoutDashboard size={16} /></div>
          <div className="tg-name">{t(lk)}</div>
          <button className={'sw' + (widgets[id] ? ' on' : '')} onClick={() => toggleWidget(id)} aria-label={t(lk)} /></div>))}
      </div>}

      <div className="card">
        <div className="set-section-t">{t('set_account')}</div>
        <div className="set-section-s">{lang === 'de' ? 'Sitzung und Anpassungen verwalten' : 'Manage your session and customisation'}</div>
        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }} onClick={resetCustom}><Trash2 size={15} /> {t('reset_def')}</button>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={signOut}><LogOut size={15} /> {t('sign_out')}</button>
      </div>
    </div>
  );
}