# Observe

진행 계획만 적어 둔 틀이다. 내용은 소제목을 하나씩 볼 때마다 아래에 채운다.

## 1. Tracing

원문: https://mastra.ai/docs/observability/tracing/overview

| 소제목 | 처리 |
|---|---|
| Usage, When to use tracing, Get started | 다룸 (1-1) |
| What gets traced | 다룸 (1-1). 8·9회차에서 만든 것이 span으로 어떻게 보이는지 |
| Sampling strategies | 다룸 (1-2). 운영 비용과 직결된다 |
| Adding custom metadata, Retrieving trace IDs | 다룸 (1-3) |
| Span filtering, Serialization options | 다룸 (1-4). 민감 정보를 빼는 자리다 |
| Creating child spans, Span formatting | 건너뜀. 필요할 때 레퍼런스로 찾는다 |
| Integrating with external tracing systems | 건너뜀. exporter 목록은 레퍼런스다 |

## 2. Logging

원문: https://mastra.ai/docs/observability/logging

| 소제목 | 처리 |
|---|---|
| 로거 등록과 레벨, PinoLogger | 다룸 (2-1) |
| 도구·프로세서 안에서 로그 남기기 | 다룸 (2-1) |

## 3. Metrics

원문: https://mastra.ai/docs/observability/metrics/overview

| 소제목 | 처리 |
|---|---|
| When to use metrics, Storage support | 다룸 (3-1) |
| Set up local metrics, View and query metrics | 다룸 (3-1) |
| Feedback | 건너뜀. 별도 페이지이고 사용자 피드백 수집용이다 |

## 4. Evals

원문: https://mastra.ai/docs/evals/overview

| 페이지 | 처리 |
|---|---|
| Overview (Types of scorers, Live evaluations, Score persistence) | 다룸 (4-1) |
| Built-in Scorers | 다룸 (4-2, 표만). 무엇이 있는지만 본다 |
| Custom Scorers | 다룸 (4-3). 네 단계 파이프라인 |
| Quick Checks | 다룸 (4-4). LLM 없이 도는 검사다 |
| Gates and Verdicts | 다룸 (4-5). CI에서 막는 기준 |
| Datasets | 다룸 (4-6) |
| Experiments | 다룸 (4-7) |
| Running in CI, Vitest Integration | 다룸 (4-8, 개념만) |
| Multi-turn Evals | 건너뜀. 분량을 보고 정한다 |
| Evals with Memory | 건너뜀. 분량을 보고 정한다 |
