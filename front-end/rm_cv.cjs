const fs = require('fs');
let c = fs.readFileSync('src/features/trainers/Trainers.tsx', 'utf8');

// Remove CV state lines
c = c.replace("  // CV upload\n  const [cvFile,    setCvFile]    = useState<File | null>(null);\n  const [uploading, setUploading] = useState<string | null>(null);\n  const cvInputRef   = useRef<HTMLInputElement | null>(null);\n  const rowUploadRef = useRef<Record<string, HTMLInputElement | null>>({});\n\n", "");

// Remove uploadCv function
const fnStart = c.indexOf('  // ===== CV Upload =====');
if (fnStart > -1) {
  const fnEnd = c.indexOf('\n  // =====', fnStart + 1);
  if (fnEnd > -1) c = c.slice(0, fnStart) + c.slice(fnEnd);
}

// Remove CV input and button from form
c = c.replace(/\s*<input ref=\{cvInputRef\}[^>]*\/>\s*/g, '');
c = c.replace(/\s*<label[^>]*>.*?CV.*?<\/label>\s*/gs, '');
c = c.replace(/\s*\{cvFile &&[^}]*\}\s*/g, '');
c = c.replace(/\s*if \(cvFile && trainer\?\.id\)[^\n]+\n/g, '');

// Remove Upload from imports
c = c.replace(", Upload,", ",");
c = c.replace("  Upload, FileCheck2,", "  FileCheck2,");

fs.writeFileSync('src/features/trainers/Trainers.tsx', c, 'utf8');
console.log('DONE');
