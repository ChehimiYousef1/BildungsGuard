const fs = require('fs');
let c = fs.readFileSync('src/features/trainers/Trainers.tsx', 'utf8');

c = c.replace(
  "  Plus, AlertTriangle, ShieldCheck, X, Pencil, Trash2,\n  Upload, FileCheck2, Eye, Mail, Phone, Award, BookOpen,\n  CheckCircle2, Clock, User, BadgeCheck, Calendar, Download, RefreshCw",
  "  Plus, AlertTriangle, ShieldCheck, X, Pencil, Trash2,\n  Upload, FileCheck2, Eye, EyeOff, Mail, Phone, Award, BookOpen,\n  CheckCircle2, Clock, User, BadgeCheck, Calendar, Download, RefreshCw"
);

fs.writeFileSync('src/features/trainers/Trainers.tsx', c, 'utf8');
console.log('DONE');
