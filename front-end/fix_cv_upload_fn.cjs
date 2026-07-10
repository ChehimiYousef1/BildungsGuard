const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/TrainerFile.tsx', 'utf8');

// Add uploadCv function before return
const returnIdx = c.lastIndexOf('\n  return (');

const fn = `
  const uploadCv = async (file: File) => {
    if (!user?.trainerId && !user?.id) return;
    const trainerId = user?.trainerId ?? user?.id;
    setCvUploading(true);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(API + '/trainers/' + trainerId + '/cv', {
        method: 'POST',
        headers: token ? { Authorization: 'Bearer ' + token } : undefined,
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setCvUrl(data.url ?? file.name);
      } else {
        alert(de ? 'Upload fehlgeschlagen.' : 'Upload failed.');
      }
    } catch (e) {
      console.error('cv upload failed', e);
    } finally {
      setCvUploading(false);
    }
  };
`;

c = c.slice(0, returnIdx) + fn + '\n  return (' + c.slice(returnIdx + '\n  return ('.length);
fs.writeFileSync('src/features/portals/trainer/TrainerFile.tsx', c, 'utf8');
console.log('DONE');
