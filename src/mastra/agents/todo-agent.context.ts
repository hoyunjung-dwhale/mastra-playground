import { z } from 'zod';
import { OWNER_ID_CONTEXT_KEY, TONE_CONTEXT_KEY } from '../constants';

// 에이전트와 도구가 같은 스키마를 공유한다. 미들웨어·스크립트가 넣는 값과 읽는 쪽의 기대를
// 한곳에 적어 두어야 계약이 코드로 검증된다.
export const todoAgentRequestContextSchema = z.object({
  [OWNER_ID_CONTEXT_KEY]: z.string().min(1),
  [TONE_CONTEXT_KEY]: z.enum(['formal', 'casual']).optional(),
});

export type TodoAgentTone = z.infer<typeof todoAgentRequestContextSchema>['tone'];

type RequestContextLike = { get(key: string): unknown };

// 스키마 검증이 execute 전에 돌지만 타입은 unknown이라 좁혀서 꺼낸다.
export function ownerIdOf(context: { requestContext?: RequestContextLike } | undefined): string {
  const ownerId = context?.requestContext?.get(OWNER_ID_CONTEXT_KEY);
  if (typeof ownerId !== 'string' || ownerId.length === 0) {
    throw new Error(`requestContext에 ${OWNER_ID_CONTEXT_KEY}가 없다.`);
  }
  return ownerId;
}
