# Develop / Deploy

진행 계획만 적어 둔 틀이다. 내용은 소제목을 하나씩 볼 때마다 아래에 채운다.

## 1. Storage

원문: https://mastra.ai/docs/storage

8회차에서 대화를 저장하며 storage를 이미 붙였다. 여기서는 도메인 데이터와 운영 설정을 본다.

| 소제목 | 처리 |
|---|---|
| When to configure storage, How storage works | 다룸 (1-1) |
| Choose a backend by data shape | 다룸 (1-1) |
| Get started locally | 건너뜀. 8회차에서 libSQL을 붙였다 |
| Configure for production | 다룸 (1-2) |
| Configuration scope | 다룸 (1-2) |
| Composite storage | 다룸 (1-3, 개념만) |
| Supported providers | 다룸 (1-3, 표만) |
| Retention과 prune | 다룸 (1-4). 대화가 쌓이면 지워야 한다 |

## 2. Develop

원문: https://mastra.ai/docs/develop

| 소제목 | 처리 |
|---|---|
| Run Mastra locally | 다룸 (2-1, 짧게). dev 서버가 어디서 도는지 8회차에서 미뤄 둔 확인을 여기서 끝낸다 |
| Project structure | 다룸 (2-1, 짧게) |
| Build with AI | 건너뜀. 편집기 연동 안내다 |
| File-based agents | 건너뜀. 실험 기능이다 |

## 3. Server

원문: https://mastra.ai/docs/server/server-adapters

| 페이지 | 처리 |
|---|---|
| Server Adapters | 다룸 (3-1). Hono 기본값과 Express·NestJS 선택지 |
| Middleware | 다룸 (3-2). 인증과 요청 로그가 들어가는 자리다 |
| Request Context | 다룸 (3-3). 요청마다 다른 값을 도구까지 내려보내는 통로다 |
| Custom API Routes | 다룸 (3-4). 기본 REST 말고 직접 만든 엔드포인트 |
| Mastra Client | 다룸 (3-5, 개념만). 프론트엔드에서 부르는 SDK다 |
| Custom Adapters | 건너뜀. 어댑터를 직접 만들 일이 없다 |
| PubSub | 건너뜀. 분산 실행용이다 |
