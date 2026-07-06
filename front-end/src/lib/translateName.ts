const DE: Record<string, string> = {
  'web':                       'Web-Entwicklung',
  'web design':                'Web-Design',
  'sql':                       'SQL-Grundlagen',
  'python':                    'Python',
  'excel':                     'Excel',
  'office':                    'MS Office',
  'it':                        'IT-Grundlagen',
  'linux':                     'Linux',
  'windows':                   'Windows',
  'networking':                'Netzwerktechnik',

  'security':                  'Sicherheit',
  'cybersecurity':             'Cybersicherheit',
  'it security':               'IT-Sicherheit',
  'data analytics':            'Datenanalyse',
  'data analysis':             'Datenanalyse',
  'data eng bootcamp':         'Datentechnik-Bootcamp',
  'data eng':                  'Datentechnik',
  'data engineering bootcamp': 'Datentechnik-Bootcamp',
  'data engineering':          'Datentechnik',
  'data science':              'Datenwissenschaft',
  'data management':           'Datenmanagement',
  'software eng':              'Softwareentwicklung',
  'software engineering':      'Softwareentwicklung',
  'software development':      'Softwareentwicklung',
  'software dev':              'Softwareentwicklung',
  'web development':          'Webentwicklung',
  'web':                       'Web-Entwicklung',
  'web dev':                   'Webentwicklung',
  'frontend development':      'Frontend-Entwicklung',
  'frontend dev':              'Frontend-Entwicklung',
  'backend development':       'Backend-Entwicklung',
  'backend dev':               'Backend-Entwicklung',
  'full stack development':    'Full-Stack-Entwicklung',
  'full-stack development':    'Full-Stack-Entwicklung',
  'full stack':                'Full-Stack',
  'mobile development':        'Mobile-Entwicklung',
  'mobile dev':                'Mobile-Entwicklung',
  'machine learning':          'Maschinelles Lernen',
  'artificial intelligence':   'Künstliche Intelligenz',
  'ai bootcamp':               'KI-Bootcamp',
  'cloud computing':           'Cloud-Computing',
  'devops':                    'DevOps',
  'networking':                'Netzwerktechnik',
  'network engineering':       'Netzwerktechnik',
  'blockchain':                'Blockchain',
  'ui/ux design':              'UI/UX-Design',
  'ui ux design':              'UI/UX-Design',
  'product management':        'Produktmanagement',
  'digital marketing':         'Digitales Marketing',
  'project management':        'Projektmanagement',
  'business intelligence':     'Business Intelligence',
  'database':                  'Datenbank',
  'programming':               'Programmierung',
  'python programming':        'Python-Programmierung',
  'java programming':          'Java-Programmierung',
  'bootcamp':                  'Bootcamp',
};

const _cache: Record<string, string> = {};

export function translateText(text: string, targetLang: 'de' | 'en'): string {
  if (!text?.trim()) return text ?? '';

  const cacheKey = `${targetLang}::${text}`;
  if (_cache[cacheKey]) return _cache[cacheKey];

  const lower = text.toLowerCase().trim();

  if (targetLang === 'de') {
    // exact
    if (DE[lower]) { _cache[cacheKey] = DE[lower]; return DE[lower]; }
    // starts with
    for (const [k, v] of Object.entries(DE)) {
      if (lower.startsWith(k)) {
        const r = v + text.slice(k.length);
        _cache[cacheKey] = r; return r;
      }
    }
    // contains
    for (const [k, v] of Object.entries(DE)) {
      if (lower.includes(k)) {
        const r = text.replace(new RegExp(k, 'gi'), v);
        _cache[cacheKey] = r; return r;
      }
    }
  }

  if (targetLang === 'en') {
    // reverse: find DE value → return EN key
    for (const [en, de] of Object.entries(DE)) {
      if (de.toLowerCase() === lower) {
        const r = en.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        _cache[cacheKey] = r; return r;
      }
    }
  }

  _cache[cacheKey] = text;
  return text;
}


