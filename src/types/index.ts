export interface Article {
  id: string;
  title: string;
  content: string;
  config: ArticleConfig;
  createdAt: number;
}

export interface ArticleConfig {
  topic: string;
  keywords: string;
  tone: string;
}

export interface User {
  name: string;
  email: string;
}

export interface WordPressConfig {
  siteUrl: string;
  username: string;
  applicationPassword: string;
  isConfigured: boolean;
}
