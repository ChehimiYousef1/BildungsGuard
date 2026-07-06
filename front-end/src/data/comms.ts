import { LayoutDashboard, BookOpen, ClipboardCheck, Users, GraduationCap, ShieldCheck, FolderCheck, Library, FileCheck2, CalendarClock, Award, Bell, ChevronRight, Play, CheckCircle2, Circle, TrendingUp, Plus, AlertTriangle, Download, X, Check, ArrowLeft, Building2, BadgeCheck, FileText, Sparkles, Send, Globe, Zap, Wand2, ListTodo, Compass, ArrowRight, UserCheck, ChevronUp, ChevronDown, Settings, LogOut, Lock, Trash2, Megaphone, Mail, MessageSquare, Smartphone, Linkedin, Contact, Eye, Tags } from 'lucide-react';

export const CHANNELS = [
  { id: 'email', de: 'E-Mail', en: 'Email', ic: Mail, col: '#6D5DF6', reach: 612, on: true },
  { id: 'sms', de: 'SMS', en: 'SMS', ic: Smartphone, col: '#0FB6A0', reach: 540, on: true },
  { id: 'whatsapp', de: 'WhatsApp', en: 'WhatsApp', ic: MessageSquare, col: '#22A565', reach: 388, on: false },
  { id: 'linkedin', de: 'LinkedIn', en: 'LinkedIn', ic: Linkedin, col: '#3B82F6', reach: 470, on: true },
];

export const INIT_CAMPAIGNS = [
  { nde: '6-Monats-Verbleibsbefragung', nen: '6-month outcome survey', aud: 'seg_alumni_emp', chan: 'email', reach: 142, openRate: '64%', sent: '02.06.2026', status: 'sent' },
  { nde: 'Alumni-Newsletter Q2', nen: 'Alumni newsletter Q2', aud: 'seg_all_alumni', chan: 'email', reach: 318, openRate: '52%', sent: '15.05.2026', status: 'sent' },
  { nde: 'Offene Stellen · Partnerfirmen', nen: 'Open roles · partner firms', aud: 'seg_alumni_seek', chan: 'linkedin', reach: 47, openRate: '—', sent: '24.06.2026', status: 'scheduled' },
  { nde: 'Bewertung & Empfehlung anfragen', nen: 'Request review & referral', aud: 'seg_alumni_emp', chan: 'email', reach: 0, openRate: '—', sent: '—', status: 'draftC' },
];
