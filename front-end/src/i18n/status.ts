export const ST: Record<string, [string, string, string]> = {
  active: ['Aktiv', 'Active', 'mint'], completed: ['Abgeschlossen', 'Completed', 'mint'], dropped: ['Abgebrochen', 'Dropped', 'rose'], enrolled: ['Angemeldet', 'Enrolled', 'amber'],
  running: ['Laufend', 'Running', 'mint'], finishing: ['Abschlussphase', 'Final phase', 'amber'], planned: ['Geplant', 'Planned', 'amber'],
  valid: ['Gültig', 'Valid', 'mint'], inReview: ['In Prüfung', 'In review', 'amber'],
  open: ['Offen', 'Open', 'amber'], closed: ['Geschlossen', 'Closed', 'mint'], overdue: ['Überfällig', 'Overdue', 'rose'], inProgress: ['Läuft', 'In progress', 'amber'],
  passed: ['Bestanden', 'Passed', 'mint'], fixed: ['Behoben', 'Fixed', 'mint'], captured: ['Erfasst', 'Captured', 'mint'], openS: ['Offen', 'Open', 'amber'],
  complete: ['Vollständig', 'Complete', 'mint'], incomplete: ['Unvollständig', 'Incomplete', 'rose'], expiring: ['Läuft ab', 'Expiring', 'amber'],
  employed: ['In Beschäftigung', 'Employed', 'mint'], seeking: ['Auf Jobsuche', 'Job-seeking', 'amber'], training: ['Weiterbildung', 'In training', 'iris'], unknown: ['Unbekannt', 'Unknown', 'muted'],
  sent: ['Versendet', 'Sent', 'mint'], scheduled: ['Geplant', 'Scheduled', 'iris'], draftC: ['Entwurf', 'Draft', 'muted'],
  doc_ready: ['Funktioniert', 'Working', 'mint'], doc_partial: ['Teilweise', 'Partial', 'amber'], doc_manual: ['Manuell', 'Manual', 'amber'], doc_missing: ['Nicht aktiv', 'Not active', 'rose'], doc_review: ['Prüfen', 'To review', 'iris'],
};
