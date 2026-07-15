const DE: Record<string, string> = {
  'web': 'Web-Entwicklung',
  'web design': 'Web-Design',
  'web development': 'Webentwicklung',
  'web dev': 'Webentwicklung',

  'sql': 'SQL-Grundlagen',
  'python': 'Python',
  'excel': 'Excel',
  'office': 'MS Office',

  'it': 'IT-Grundlagen',
  'linux': 'Linux',
  'windows': 'Windows',

  'networking': 'Netzwerktechnik',
  'network engineering': 'Netzwerktechnik',

  'security': 'Sicherheit',
  'cybersecurity': 'Cybersicherheit',
  'it security': 'IT-Sicherheit',

  'data analytics': 'Datenanalyse',
  'data analysis': 'Datenanalyse',
  'data eng bootcamp': 'Datentechnik-Bootcamp',
  'data eng': 'Datentechnik',
  'data engineering bootcamp': 'Datentechnik-Bootcamp',
  'data engineering': 'Datentechnik',
  'data science': 'Datenwissenschaft',
  'data management': 'Datenmanagement',

  'software eng': 'Softwareentwicklung',
  'software engineering': 'Softwareentwicklung',
  'software development': 'Softwareentwicklung',
  'software dev': 'Softwareentwicklung',

  'frontend development': 'Frontend-Entwicklung',
  'frontend dev': 'Frontend-Entwicklung',
  'backend development': 'Backend-Entwicklung',
  'backend dev': 'Backend-Entwicklung',
  'full stack development': 'Full-Stack-Entwicklung',
  'full-stack development': 'Full-Stack-Entwicklung',
  'full stack': 'Full-Stack',

  'mobile development': 'Mobile-Entwicklung',
  'mobile dev': 'Mobile-Entwicklung',

  'machine learning': 'Maschinelles Lernen',
  'artificial intelligence': 'Künstliche Intelligenz',
  'ai bootcamp': 'KI-Bootcamp',

  'cloud computing': 'Cloud-Computing',
  'devops': 'DevOps',
  'blockchain': 'Blockchain',

  'ui/ux design': 'UI/UX-Design',
  'ui ux design': 'UI/UX-Design',

  'product management': 'Produktmanagement',
  'digital marketing': 'Digitales Marketing',
  'project management': 'Projektmanagement',
  'business intelligence': 'Business Intelligence',

  'database': 'Datenbank',
  'programming': 'Programmierung',
  'python programming': 'Python-Programmierung',
  'java programming': 'Java-Programmierung',
  'bootcamp': 'Bootcamp',
};

const cache: Record<string, string> = {};

export function translateText(text: string, targetLang: 'de' | 'en'): string {
  if (!text?.trim()) return text ?? '';

  const cacheKey = `${targetLang}::${text}`;
  if (cache[cacheKey]) return cache[cacheKey];

  const lower = text.toLowerCase().trim();

  if (targetLang === 'de') {
    if (DE[lower]) {
      cache[cacheKey] = DE[lower];
      return DE[lower];
    }

    for (const [key, value] of Object.entries(DE)) {
      if (lower.startsWith(key)) {
        const result = value + text.slice(key.length);
        cache[cacheKey] = result;
        return result;
      }
    }

    for (const [key, value] of Object.entries(DE)) {
      if (lower.includes(key)) {
        const result = text.replace(new RegExp(key, 'gi'), value);
        cache[cacheKey] = result;
        return result;
      }
    }
  }

  if (targetLang === 'en') {
    for (const [en, de] of Object.entries(DE)) {
      if (de.toLowerCase() === lower) {
        const result = en
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        cache[cacheKey] = result;
        return result;
      }
    }
  }

  cache[cacheKey] = text;
  return text;
}
