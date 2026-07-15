const fs = require('fs');
let c = fs.readFileSync('src/features/portals/participant/Learn.tsx', 'utf8');

// After loading quizzes, fetch participant's existing attempts and lock done quizzes
c = c.replace(
  "api(qUrl).then((q: any) => { console.log('[Learn] quizzes:', q); setQuizzes(Array.isArray(q) ? q : []); }).catch(() => {});",
  `api(qUrl).then(async (q: any) => {
          console.log('[Learn] quizzes:', q);
          const list = Array.isArray(q) ? q : [];
          setQuizzes(list);
          // Check which quizzes participant already attempted
          if (me?.id && list.length > 0) {
            const doneIds = new Set<string>();
            await Promise.all(list.map(async (quiz: any) => {
              try {
                const attempts = await api('/quiz/' + quiz.id + '/attempts').catch(() => []);
                const arr = Array.isArray(attempts) ? attempts : [];
                if (arr.some((a: any) => a.participantId === me.id)) {
                  doneIds.add(quiz.id);
                }
              } catch {}
            }));
            setDoneQuizIds(doneIds);
          }
        }).catch(() => {});`
);

fs.writeFileSync('src/features/portals/participant/Learn.tsx', c, 'utf8');
console.log('DONE');
