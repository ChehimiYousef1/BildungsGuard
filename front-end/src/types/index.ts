/* Shared domain types. Loose for the prototype port; tighten as the API contracts firm up. */
export type Lang = 'de' | 'en';
export type Tone = 'g' | 'a' | 'r' | 'p';

export interface Participant { name: string; m: string; akte: number; [k: string]: any; }
export interface Bootcamp { nr: string; name: string; status: string; enrolled: number; cap: number; ue: number; mode: string; [k: string]: any; }
export interface Trainer { name: string; status: string; [k: string]: any; }
export interface Complaint { date: string; src: string; cat: string; desc: string; descEn?: string; owner: string; due: string; status: string; }
export interface Alumnus { name: string; outcome: string; follow6?: boolean; [k: string]: any; }
export interface Campaign { [k: string]: any; }
export interface Category { [group: string]: string[]; }
