const fs = require('fs');
let c = fs.readFileSync('src/config/nav.ts', 'utf8');

c = c.replace(
  "verwaltung: [['home', 'n_overview', LayoutDashboard], ['participants', 'n_part', Users], ['measures', 'n_meas', BookOpen], ['trainers', 'n_train', GraduationCap], ['attendance', 'n_att', ClipboardCheck], ['qm', 'n_qm', ShieldCheck], ['audit', 'n_audit', FolderCheck], ['content', 'n_content', Library], ['docs', 'n_docs', FileText], ['alumni', 'n_alumni', Contact], ['comms', 'n_comms', Megaphone], ['categories', 'n_categories', Tags], ['automations', 'n_autom', Zap], ['settings', 'n_settings', Settings]]",
  "verwaltung: [['home', 'n_overview', LayoutDashboard], ['participants', 'n_part', Users], ['trainers', 'n_train', GraduationCap], ['measures', 'n_meas', BookOpen], ['content', 'n_content', Library], ['attendance', 'n_att', ClipboardCheck], ['docs', 'n_docs', FileText], ['alumni', 'n_alumni', Contact], ['comms', 'n_comms', Megaphone], ['categories', 'n_categories', Tags], ['qm', 'n_qm', ShieldCheck], ['audit', 'n_audit', FolderCheck], ['automations', 'n_autom', Zap], ['settings', 'n_settings', Settings]]"
);

fs.writeFileSync('src/config/nav.ts', c, 'utf8');
console.log('DONE');
