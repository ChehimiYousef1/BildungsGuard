const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

// Change useEffect to [] to refresh on mount every time
c = c.replace(
  "  }, []);",
  "  }, []); // refresh on mount"
);

// Add refresh button
c = c.replace(
  "  const addAssignment = () => {",
  "  const refresh = async () => {\n    try {\n      const p2 = await api('/participants').catch(() => []);\n      const pList = Array.isArray(p2) ? p2 : [];\n      const entries = await Promise.all(pList.map(async (p: any) => {\n        try {\n          const s = await api('/surveys?participantId=' + p.id);\n          return { id: p.id, tests: (Array.isArray(s) ? s : []).filter((x: any) => x.type === 'test') };\n        } catch { return { id: p.id, tests: [] }; }\n      }));\n      const map: Record<string, any[]> = {};\n      entries.forEach((e) => { map[e.id] = e.tests; });\n      setGrades(map);\n    } catch {}\n  };\n\n  const addAssignment = () => {"
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');
