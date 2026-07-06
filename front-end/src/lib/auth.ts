export type Role = 'verwaltung' | 'dozent' | 'teilnehmer';

/** Placeholder RBAC helpers — wire to your real auth/session in the backend step. */
export const ROLE_LABEL: Record<Role, { de: string; en: string }> = {
  verwaltung: { de: 'Verwaltung', en: 'Administration' },
  dozent: { de: 'Dozent', en: 'Trainer' },
  teilnehmer: { de: 'Teilnehmer', en: 'Participant' },
};

export const can = (role: Role, module: string) => {
  if (role === 'verwaltung') return true;
  if (role === 'dozent') return ['home', 'attendance', 'grade', 'file', 'settings'].includes(module);
  return ['home', 'learn', 'progress', 'docs', 'certs', 'settings'].includes(module);
};
