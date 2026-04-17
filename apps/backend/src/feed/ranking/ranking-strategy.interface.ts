export interface RankingStrategy<T> {
  rank(items: T[]): T[];
}

export const RANKING_STRATEGY = 'RANKING_STRATEGY';
