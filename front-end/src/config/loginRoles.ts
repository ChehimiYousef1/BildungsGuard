import { LayoutDashboard, BookOpen, ClipboardCheck, Users, GraduationCap, ShieldCheck, FolderCheck, Library, FileCheck2, CalendarClock, Award, Bell, ChevronRight, Play, CheckCircle2, Circle, TrendingUp, Plus, AlertTriangle, Download, X, Check, ArrowLeft, Building2, BadgeCheck, FileText, Sparkles, Send, Globe, Zap, Wand2, ListTodo, Compass, ArrowRight, UserCheck, ChevronUp, ChevronDown, Settings, LogOut, Lock, Trash2, Megaphone, Mail, MessageSquare, Smartphone, Linkedin, Contact, Eye, Tags } from 'lucide-react';

export const LOGIN_ROLES = [
  { id: 'verwaltung', ic: Building2, col: '#6D5DF6', email: '', dynamic: true, signInOnly: true, lk: 'r_admin', dk: 'login_admin_d' },
  { id: 'dozent', ic: GraduationCap, col: '#F59E0B', email: '', dynamic: true, signInOnly: true, lk: 'r_trainer', dk: 'login_trainer_d' },
  { id: 'teilnehmer', ic: Contact, col: '#0FB6A0', email: '', dynamic: true, signInOnly: true, lk: 'r_part', dk: 'login_part_d' },
];
