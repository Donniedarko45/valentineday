declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GOOGLE_AI_API_KEY: string;
      INSTAGRAM_ACCESS_TOKEN: string;
      TWITTER_BEARER_TOKEN: string;
    }
  }
}

export {}; 