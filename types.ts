
import { Chat } from '@google/genai';

export enum Category {
  DEVOTION = 'Daily Devotion',
  PRAYER = 'Daily Prayer',
  MEDITATION = 'Daily Meditation',
  ACCOUNTABILITY = 'Daily Accountability',
  CHAT = 'Just Chat',
}

export enum Screen {
  WELCOME,
  TOPIC_SELECTION,
  PROGRAM_OVERVIEW,
  DAILY_PROGRAM,
  CHAT,
  DASHBOARD,
}

export interface DevotionContent {
  scripture: string;
  prayer: string;
  declaration: string;
  videoTitle?: string;
}

export interface PrayerContent {
  adoration: string;
  confession: string;
  thanksgiving: string;
  supplication: string;
}

export interface MeditationContent {
  scripture: string;
  prompt1: string;
  prompt2: string;
}

export interface AccountabilityContent {
  scripture: string;
  declaration: string;
  alternativeAction: string;
}

export type ProgramDayContent = DevotionContent | PrayerContent | MeditationContent | AccountabilityContent;

export interface ProgramDay {
  day: number;
  content: ProgramDayContent;
}

export type Program = ProgramDay[];

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface CompletedProgram {
  id: string;
  category: Category;
  topic: string;
  completedDate: string;
}
