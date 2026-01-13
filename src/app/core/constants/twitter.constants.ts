export const TWITTER_CONSTANTS = {
  MAX_TWEET_LENGTH: 280,
  MAX_THREAD_PARTS: 25,
  URL_LENGTH: 23, // Twitter shortens all URLs to 23 characters
  MENTION_PATTERN: /^@\w+/,
  HASHTAG_PATTERN: /#\w+/g,
  URL_PATTERN: /https?:\/\/[^\s]+/g,
} as const;
