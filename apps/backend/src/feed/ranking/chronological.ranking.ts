import { Injectable } from '@nestjs/common';

import { RankingStrategy } from './ranking-strategy.interface';

interface Timestamped {
  createdAt: Date;
  id: number;
}

@Injectable()
export class ChronologicalRanking<
  T extends Timestamped,
> implements RankingStrategy<T> {
  rank(items: T[]): T[] {
    return items.sort((a, b) => {
      const timeDiff = b.createdAt.getTime() - a.createdAt.getTime();
      return timeDiff !== 0 ? timeDiff : b.id - a.id;
    });
  }
}
