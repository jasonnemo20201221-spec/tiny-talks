export enum CategoryType {
  Nature = 'Nature',
  Imagination = 'Imagination',
  DailyLife = 'DailyLife',
  Emotions = 'Emotions',
  Animals = 'Animals',
  Space = 'Space',
  Food = 'Food'
}

export type AgeGroup = 3 | 4 | 5;
export type GenderTheme = 'boy' | 'girl';

export interface TopicCardData {
  id: number;
  title: string;
  questions: string[]; // Array of questions (1 for 3-4yo, 1-2 for 5yo)
  guidance: string[]; // Array of progressive tips (max 3)
  category: CategoryType;
  emoji: string;
  colorTheme: 'yellow' | 'red' | 'blue' | 'green' | 'purple' | 'orange';
  genderTheme: GenderTheme; // Specific theme for this card
}

export interface GeminiResponse {
  topics: TopicCardData[];
}

export interface UserSettings {
  age: AgeGroup;
}