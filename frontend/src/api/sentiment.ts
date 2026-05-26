import { api } from './client';

export interface SentimentResponse {
  total_events: number;
  positive: number;
  negative: number;
  neutral: number;
  avg_sentiment: number;
  trend: string;
  by_source: Record<string, number>;
}

export function fetchSentiment() {
  return api.get<SentimentResponse>('/sentiment');
}
