export type TonePreset = 'professional' | 'casual' | 'viral' | 'concise' | 'humorous';

export interface ToneConfig {
  id: TonePreset;
  label: string;
  description: string;
  icon: string;
  systemPrompt: string;
}
