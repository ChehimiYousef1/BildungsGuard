import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';
import { T } from '../i18n';
import { NAV } from '../config/nav';
import { ACCENTS } from '../config/accents';
import { authApi, setToken, clearToken, getToken } from '../lib/api';

import {
  TRAEGER, INIT_PART, INIT_COMPLAINTS, INIT_ALUMNI, INIT_CAMPAIGNS, INIT_CATEGORIES,
} from '../data';

const AppCtx = createContext<any>(null);
export const useApp = () => useContext(AppCtx);

const BACKEND_ROLE: Record<string, string> = {
  admin: 'verwaltung',
  trainer: 'dozent',
  participant: 'teilnehmer',
};

// ===== localStorage helpers =====
const lsGet = (key: string, fallback: any) => {
  try {
    const v = localStorage.getItem(key);
    return v != null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};
const lsSet = (key: string, value: any) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
};

const DEFAULT_MODULES = {
  verwaltung: NAV.verwaltung.map((x: any) => x[0]),
  dozent:     NAV.dozent.map((x: any) => x[0]),
  teilnehmer: NAV.teilnehmer.map((x: any) => x[0]),
};
const DEFAULT_WIDGETS = { stats: true, trend: true, clear: true, compliance: true };

export function AppProvider({ children }: { children: ReactNode }) {

  // ✅ اللغة تُحفظ في localStorage وتُقرأ عند البدء
  const [lang, setLangState] = useState<'de' | 'en'>(
    () => (lsGet('pref_lang', 'de') === 'en' ? 'en' : 'de')
  );
  const setLang = (l: 'de' | 'en') => {
    setLangState(l);
    lsSet('pref_lang', l);
  };

  const [authed, setAuthed]       = useState(false);
  const [role, setRole]           = useState('verwaltung');
  const [view, setView]           = useState('home');
  const [aiOpen, setAiOpen]       = useState(false);
  const [user, setUser]           = useState<any>(null);
  const [participants, setParticipants] = useState(INIT_PART);
  const [complaints, setComplaints]     = useState(INIT_COMPLAINTS);
  const [alumni, setAlumni]             = useState(INIT_ALUMNI);
  const [campaigns, setCampaigns]       = useState(INIT_CAMPAIGNS);
  const [tasks, setTasks]               = useState<string[]>([]);
  const [pendingSample, setPendingSample] = useState<any>(null);

  const [accent, setAccentState] = useState(() => {
    const savedId = lsGet('pref_accent', null);
    return ACCENTS.find((a) => a.id === savedId) ?? ACCENTS[0];
  });
  const [modules, setModulesState] = useState<any>(() => lsGet('pref_modules', DEFAULT_MODULES));
  const [widgets, setWidgetsState] = useState(() => lsGet('pref_widgets', DEFAULT_WIDGETS));

  const [categories, setCategories] = useState<any>(INIT_CATEGORIES);
  const [org, setOrg]               = useState(TRAEGER.name);
  const [logo, setLogoState]        = useState<string | null>(() => lsGet('pref_logo', null));
  const setLogo = (v: string | null) => { setLogoState(v); lsSet('pref_logo', v); };
  const [automations, setAutomations] = useState({
    att: true, login: true, diary: true, cert: true, result: true,
  });

  const setAccent = (a: any) => { setAccentState(a); lsSet('pref_accent', a?.id); };

  const t = (k: string) => ((T[lang] as any)[k] != null ? (T[lang] as any)[k] : k);

  const navigate     = (r: string, v: string) => { setRole(r); setView(v); };
  const completeAkte = (name: string) =>
    setParticipants((ps: any) =>
      ps.map((p: any) =>
        p.name === name || (name && p.name.toLowerCase().includes(String(name).toLowerCase()))
          ? { ...p, akte: 100 }
          : p
      )
    );
  const createCapa = ({ desc, owner, due }: any) =>
    setComplaints((cs: any) => [
      {
        date: new Date().toLocaleDateString('de-DE'),
        src: 'Aino', cat: 'KI',
        desc: desc || '—', descEn: desc || '—',
        owner: owner || '—', due: due || '—', status: 'open',
      },
      ...cs,
    ]);
  const addTask      = (text: string) => setTasks((ts) => [text, ...ts]);
  const drawSample   = (n: number)    => { setPendingSample({ n, id: Date.now() }); navigate('verwaltung', 'audit'); };
  const sendCampaign = (c: any)       => setCampaigns((cs: any) => [c, ...cs]);
  const addCategory    = (g: string, v: string) =>
    setCategories((c: any) => c[g].includes(v) ? c : { ...c, [g]: [...c[g], v] });
  const removeCategory = (g: string, v: string) =>
    setCategories((c: any) => ({ ...c, [g]: c[g].filter((x: string) => x !== v) }));
  const toggleAutomation = (id: string) =>
    setAutomations((a: any) => ({ ...a, [id]: !a[id] }));

  const loadOrgName = () => {
    api<any>('/tenants/me').then((tn) => {
      if (tn?.name) { setOrg(tn.name); lsSet('pref_org', tn.name); }
      setLogo(tn?.logo ?? null);
      lsSet('pref_logo', tn?.logo ?? null);
    }).catch(() => {});
  };

  const login = async (
    roleId: string,
    body: { email?: string; username?: string; password: string },
  ) => {
    const { accessToken, user } = await authApi.login(body);
    const expectedRole = BACKEND_ROLE[user.role];
    if (expectedRole && expectedRole !== roleId) {
      throw new Error(
        lang === 'de'
          ? 'Dieses Konto gehört nicht zu diesem Portal. Bitte die richtige Karte wählen.'
          : 'This account does not belong to this portal. Please choose the correct card.',
      );
    }
    setToken(accessToken);
    setUser(user);
    setRole(expectedRole ?? roleId);
    setView('home');
    setAuthed(true);
    loadOrgName();
  };

  const register = async (
    roleId: string,
    body: { name: string; email: string; password: string; username?: string },
  ) => {
    const { accessToken, user } = await authApi.register(body);
    setToken(accessToken);
    setUser(user);
    setRole(BACKEND_ROLE[user.role] ?? roleId);
    setView('home');
    setAuthed(true);
    loadOrgName();
  };

  const signOut = () => { clearToken(); setUser(null); setAuthed(false); setAiOpen(false); };

  const toggleModule = (r: string, id: string) => {
    setModulesState((m: any) => {
      const next = {
        ...m,
        [r]: m[r].includes(id)
          ? m[r].filter((x: string) => x !== id)
          : [...m[r], id],
      };
      lsSet('pref_modules', next);
      return next;
    });
    if (view === id) setView('home');
  };

  const toggleWidget = (id: string) => {
    setWidgetsState((w: any) => {
      const next = { ...w, [id]: !w[id] };
      lsSet('pref_widgets', next);
      return next;
    });
  };

  const resetCustom = () => {
    setModulesState(DEFAULT_MODULES); lsSet('pref_modules', DEFAULT_MODULES);
    setWidgetsState(DEFAULT_WIDGETS); lsSet('pref_widgets', DEFAULT_WIDGETS);
    setAccentState(ACCENTS[0]);       lsSet('pref_accent', ACCENTS[0].id);
    setCategories(INIT_CATEGORIES);
    setOrg(TRAEGER.name);
    setAutomations({ att: true, login: true, diary: true, cert: true, result: true });
  };

  useEffect(() => {
    if (getToken()) {
      loadOrgName();
    }
  }, []);

  const value = {
    t, lang, setLang,
    role, setRole, view, setView, navigate,
    authed, login, register, signOut,
    aiOpen, setAiOpen, user,
    participants, setParticipants,
    complaints, setComplaints, completeAkte, createCapa,
    tasks, addTask, drawSample, pendingSample, setPendingSample,
    alumni, setAlumni,
    campaigns, sendCampaign,
    categories, addCategory, removeCategory,
    org, setOrg,
    logo, setLogo,
    automations, toggleAutomation,
    accent, setAccent,
    modules, toggleModule,
    widgets, toggleWidget,
    resetCustom,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
