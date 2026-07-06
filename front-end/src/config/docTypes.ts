export const DOC_TYPE_LABELS: Record<string, { de: string; en: string; category: string }> = {
  // Per-participant (#1-#8)
  PARTICIPANT_CONTRACT: { de: 'Teilnahmevertrag',           en: 'Participant contract',        category: 'enrollment' },
  EQUIPMENT_LOAN:       { de: 'Geräteüberlassungsvertrag',  en: 'Equipment loan agreement',    category: 'enrollment' },
  PRIVACY_CONSENT:      { de: 'Datenschutzerklärung',       en: 'Privacy statement',           category: 'enrollment' },
  MEDIA_CONSENT:        { de: 'Einwilligung Medienrechte',  en: 'Media rights consent',        category: 'enrollment' },
  SICK_NOTE:            { de: 'Krankmeldung',               en: 'Sick-leave certificate',      category: 'enrollment' },
  CV:                   { de: 'Lebenslauf',                 en: 'CV / résumé',                 category: 'participant' },
  CERTIFICATE:          { de: 'Zertifikat',                 en: 'Certificate',                 category: 'enrollment' },
  // Legacy / free-form
  OTHER:                { de: 'Sonstiges',                  en: 'Other',                       category: 'other' },
};

export const getDocLabel = (type: string, lang: 'de' | 'en') => {
  const entry = DOC_TYPE_LABELS[type];
  if (entry) return entry[lang];
  // fallback: humanise the raw type string
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

export const OUTCOME_LABELS: Record<string, { de: string; en: string }> = {
  employed:     { de: 'In Beschäftigung',    en: 'Employed' },
  job_seeking:  { de: 'Arbeitssuchend',      en: 'Job-seeking' },
  education:    { de: 'In Ausbildung',       en: 'In education' },
  training:     { de: 'In Weiterbildung',    en: 'In training' },
  other:        { de: 'Sonstiges',           en: 'Other' },
};

export const CONTRACT_LABELS: Record<string, { de: string; en: string }> = {
  permanent:  { de: 'Unbefristet',  en: 'Permanent' },
  temporary:  { de: 'Befristet',    en: 'Temporary' },
  freelance:  { de: 'Freiberuflich', en: 'Freelance' },
};