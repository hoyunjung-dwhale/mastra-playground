import type { ContextWithMastra, Middleware } from '@mastra/core/server';

// Mastra는 내장 라우트를 끄는 설정을 제공하지 않는다. next()를 부르지 않고 응답을 돌려주면
// 그 그룹이 없는 것처럼 보인다. 와일드카드는 그룹 자체와 하위 경로를 함께 막는다.
const notFound = async (): Promise<Response> => new Response('Not Found', { status: 404 });

// 실습에서 '/api/memory/*'를 넣어 404가 되는 것까지 확인하고 비웠다. Studio의 대화 목록도 같은
// 라우트를 쓰기 때문이다. 사용자 격리는 auth.mapUserToResourceId로 푸는 것이 문서 권고이고,
// 이 차단은 그 방법이 통하지 않는 라우트 그룹에만 쓴다.
const BLOCKED_ROUTE_GROUPS: string[] = [];

const requestLogger: Middleware = {
  path: '*',
  // console 대신 Mastra 로거를 쓴다. 배포 환경에서 로거를 교체하면 이 로그도 함께 따라간다.
  handler: async (context: ContextWithMastra, next) => {
    const startedAt = Date.now();
    await next();
    const { pathname } = new URL(context.req.url);
    context
      .get('mastra')
      .getLogger()
      .info(
        `[요청] ${context.req.method} ${pathname} ${context.res.status} ${Date.now() - startedAt}ms`,
      );
  },
};

// 순서가 곧 실행 순서다. 로거를 먼저 두어야 차단된 요청도 로그에 남는다.
export const serverMiddleware: Middleware[] = [
  requestLogger,
  ...BLOCKED_ROUTE_GROUPS.map((path) => ({ path, handler: notFound })),
];
