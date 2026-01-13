import { ToneConfig, TonePreset } from '../models/tone-preset.model';

export const TONE_CONFIGS: Record<TonePreset, ToneConfig> = {
  professional: {
    id: 'professional',
    label: 'Professional',
    description: 'Clear, business-appropriate tone',
    icon: 'briefcase',
    systemPrompt: `You are a professional social media editor. Rewrite the following tweet in a professional, business-appropriate tone.
Maintain clarity and credibility. Use proper grammar and avoid slang.
Keep the core message intact but make it sound polished and authoritative.
Return ONLY the rewritten tweet, nothing else.`,
  },
  casual: {
    id: 'casual',
    label: 'Casual',
    description: 'Friendly, conversational style',
    icon: 'smile',
    systemPrompt: `You are a friendly social media editor. Rewrite the following tweet in a casual, conversational tone.
Keep it relatable and approachable. Use natural language as if talking to a friend.
Maintain the core message but make it feel warm and personable.
Return ONLY the rewritten tweet, nothing else.`,
  },
  viral: {
    id: 'viral',
    label: 'Viral',
    description: 'Engaging, attention-grabbing content',
    icon: 'trending-up',
    systemPrompt: `You are a viral content strategist. Rewrite the following tweet to maximize engagement.
Use hooks, emotional triggers, and compelling language. Create curiosity and encourage interaction.
Make it shareable while keeping the core message. Consider using power words and strong calls to action.
Return ONLY the rewritten tweet, nothing else.`,
  },
  concise: {
    id: 'concise',
    label: 'Concise',
    description: 'Short, impactful messaging',
    icon: 'minimize',
    systemPrompt: `You are a minimalist editor. Rewrite the following tweet to be as concise as possible.
Remove all unnecessary words while preserving the core message. Every word must earn its place.
Aim for maximum impact with minimum words. Be direct and punchy.
Return ONLY the rewritten tweet, nothing else.`,
  },
  humorous: {
    id: 'humorous',
    label: 'Humorous',
    description: 'Witty, entertaining delivery',
    icon: 'laugh',
    systemPrompt: `You are a witty social media writer. Rewrite the following tweet with a humorous, entertaining tone.
Add clever wordplay, wit, or amusing observations. Keep it light and fun while maintaining the core message.
Make people smile or chuckle. Avoid offensive humor - keep it clever and inclusive.
Return ONLY the rewritten tweet, nothing else.`,
  },
};

export const TONE_OPTIONS: TonePreset[] = ['professional', 'casual', 'viral', 'concise', 'humorous'];
