# Memory

진행 계획만 적어 둔 틀이다. 내용은 소제목을 하나씩 볼 때마다 아래에 채운다.

## 1. Overview

원문: https://mastra.ai/docs/memory/overview

| 소제목 | 처리 |
|---|---|
| When to use memory, Quickstart, Message history | 다룸 (1-1) |
| What the model sees | 다룸 (1-2, 개념만) |
| Observational Memory | 건너뜀. 3에서 본다 |
| Memory in multi-agent systems | 건너뜀. Supervisor agents 문서 범위다 |
| Observability | 건너뜀. 10회차 Observe에서 트레이스로 본다 |
| Switch memory per request | 건너뜀. `RequestContext`는 9회차 Server에서 본다 |

## 2. Message History

원문: https://mastra.ai/docs/memory/message-history

| 소제목 | 처리 |
|---|---|
| Threads and resources, Getting started | 건너뜀. 1-1과 겹친다 |
| Thread title generation | 다룸 (2-1) |
| Accessing memory, Querying (Threads, Messages) | 다룸 (2-2) |
| UI format | 건너뜀. 프론트엔드 변환 함수라 레퍼런스로 충분하다 |
| Thread cloning, Deleting messages | 건너뜀. 필요할 때 레퍼런스로 찾는다 |

## 3. Observational Memory

원문: https://mastra.ai/docs/memory/observational-memory

문서가 Recommended로 표시한 층이다. 소제목이 스물몇 개라 실무에서 먼저 정해야 하는 것만 고른다.

| 소제목 | 처리 |
|---|---|
| Quickstart, How it works (Observations, Reflections) | 다룸 (3-1) |
| How context changes over time, Benefits | 다룸 (3-1) |
| Models, Token-tiered model selection | 다룸 (3-2). 비용과 직결된다 |
| Scopes (thread, resource) | 다룸 (3-2) |
| Token budgets | 다룸 (3-2, 개념만) |
| Comparing OM with other memory features | 다룸 (3-3, 개념만) |
| Studio | 실습에서 확인한다 |
| Extractors, Working memory updates, Retrieval mode | 건너뜀. 기본 동작을 먼저 본다 |
| Early activation, Temporal gap markers, Async buffering | 건너뜀. 튜닝 옵션이다 |
| Observer Context Optimization, Token counting cache | 건너뜀. 튜닝 옵션이다 |
| Caller-supplied token estimates, Migrating existing threads | 건너뜀. 운영 이관용이다 |

## 4. Working Memory

원문: https://mastra.ai/docs/memory/working-memory

| 소제목 | 처리 |
|---|---|
| Quickstart, How it works | 다룸 (4-1) |
| Memory persistence scopes (resource, thread) | 다룸 (4-1) |
| Custom templates, Designing effective templates | 다룸 (4-1) |
| Structured working memory, Choosing between template and schema | 다룸 (4-2) |
| Storage adapter support | 다룸 (4-2, 한 줄) |
| Setting initial working memory, Updating programmatically | 다룸 (4-3, 개념만) |
| Personal info, Preferences, Session state, Multi-step retention | 건너뜀. 템플릿 예시 나열이다 |
| Read-only working memory, Opt in to state signals | 건너뜀. 실험 기능이다 |
| Examples | 건너뜀 |

## 5. Semantic Recall

원문: https://mastra.ai/docs/memory/semantic-recall

| 소제목 | 처리 |
|---|---|
| How semantic recall works, Quickstart | 다룸 (5-1) |
| Storage configuration, Embedder configuration (Model Router) | 다룸 (5-1) |
| Recall configuration (topK, messageRange, scope) | 다룸 (5-2) |
| Metadata filtering | 다룸 (5-2, 개념만) |
| Viewing recalled messages, Disable semantic recall | 실습에서 확인한다 |
| Using the `recall()` method | 건너뜀. 2-2와 겹친다 |
| Using AI SDK Packages, Using FastEmbed (local) | 건너뜀. Model Router만 쓴다 |
| PostgreSQL index optimization | 건너뜀. 운영 튜닝이다 |

## 6. Memory Processors

원문: https://mastra.ai/docs/memory/memory-processors

7회차 Processors 절에서 미뤄 둔 `TokenLimiter`와 `ToolCallFilter`가 여기서 의미를 가진다.

| 소제목 | 처리 |
|---|---|
| Built-in memory processors (MessageHistory, SemanticRecall, WorkingMemory) | 다룸 (6-1) |
| Processor execution order (Input, Output) | 다룸 (6-1) |
| Guardrails and memory | 다룸 (6-2). 7회차 Guardrails와 이어진다 |
| Manual control and deduplication | 건너뜀. 필요할 때 레퍼런스로 찾는다 |
| Handling large attachments | 건너뜀. 첨부 파일을 쓰지 않는다 |

## 7. Multi-user Threads

원문: https://mastra.ai/docs/memory/multi-user-threads

한 스레드를 여러 사용자가 공유하는 경우를 다룬다. 분량을 보고 개념만 볼지 통째로 건너뛸지 6까지 끝낸 뒤 정한다.
