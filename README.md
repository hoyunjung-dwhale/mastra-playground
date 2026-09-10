# mastra-playground

[Mastra](https://mastra.ai/docs) 공식 문서를 절 단위로 읽고 실습하는 학습용 프로젝트다. 문서 한 페이지를 읽을 때마다 같은 에이전트(할 일 관리 에이전트) 하나에 기능을 붙여 가며, 정리한 내용은 `docs/` 아래에 남긴다.

## 준비

| 항목 | 값 |
|---|---|
| Node.js | 22.13 이상 (`node -v`로 확인) |
| 패키지 관리자 | npm |
| LLM API 키 | 아래 provider 중 하나 |

| provider | 발급 위치 | 환경 변수 | 비고 |
|---|---|---|---|
| Google Gemini | https://aistudio.google.com/apikey | `GOOGLE_API_KEY` | Flash 계열은 무료 티어가 있다. ([요금](https://ai.google.dev/gemini-api/docs/pricing)) 한도는 프로젝트 단위이며 [AI Studio](https://aistudio.google.com/rate-limit)에서 확인한다. |
| Anthropic Claude | https://platform.claude.com/settings/keys | `ANTHROPIC_API_KEY` | 유료. claude.ai 구독과는 [별도 결제](https://support.claude.com/en/articles/9876003)다. |
| OpenAI | https://platform.openai.com/api-keys | `OPENAI_API_KEY` | 유료 |

## 실행

```bash
git clone https://github.com/hoyunjung-dwhale/mastra-playground.git
cd mastra-playground
npm install
cp .env.example .env
```

`.env`에 발급받은 키를 넣는다. 쓰지 않는 항목은 비워 둔다.

```bash
npm run dev        # 개발 서버 + Studio (http://localhost:4111)
npm run call       # 스크립트로 에이전트 호출 (scripts/call-todo-agent.ts)
npm run check      # biome (서식·린트). 자동 수정은 npm run check:fix
npm run typecheck  # tsc
```

Studio는 등록된 에이전트와 대화하고 도구 호출 과정을 보는 화면이다. 파일을 고치면 서버가 자동으로 다시 읽는다.

다른 provider를 쓰려면 `src/mastra/models.ts`의 모델 문자열만 바꾼다. 지원 모델 목록은 https://mastra.ai/models 에 있다.

## 구조

```
src/mastra/
  index.ts              Mastra 인스턴스. 에이전트를 여기에 등록한다
  constants.ts          에이전트 id·등록 키
  models.ts             모델 문자열 상수 (타입으로 오타 방지)
  agents/
    todo-agent.ts       할 일 관리 에이전트
    todo-agent.prompt.ts  system prompt
  tools/                도구. 파일 하나에 하나씩, id는 kebab-case
  todo/                 할 일 스키마(zod)와 메모리 저장소
scripts/
  call-todo-agent.ts    generate·stream 호출 예제
docs/
  agents.md             Agents 절 정리 (저장소 작성자)
notes/                  클론한 학습자가 자기 정리를 쓰는 곳
CLAUDE.md               Claude Code로 함께 공부할 때 쓰는 진행 규칙
```

코드 관례는 운영 프로젝트 기준을 따른다. 식별자와 모델 문자열은 상수로, system prompt는 `*.prompt.ts`로 분리하고, 제약은 주석이 아니라 타입으로 강제한다. 서식과 린트는 biome이 검사한다.

## 진행 방식

문서 절 하나를 한 회차로 잡고, 회차마다 `docs/` 아래에 정리 파일을 하나씩 둔다.

| 회차 | 문서 절 | 정리 파일 | 상태 |
|---|---|---|---|
| 1 | Build / Agents | `docs/agents.md` | 진행 중 |
| 2 | Build / Memory | `docs/memory.md` | 예정 |
| 3 | Develop, Deploy / Storage, Server | `docs/develop-deploy.md` | 예정 |
| 4 | Observe / Trace, Metrics, Evals | `docs/observe.md` | 예정 |

한 절 안에서는 문서의 소제목 하나를 세 단계로 본다.

1. **개념**: 문서 원문이 말하는 것과, Mastra가 그것을 어떻게 구현했는지. 일반 개념(에이전트 루프, tool calling 등)은 리마인드 수준으로만 짚는다.
2. **실습**: 같은 에이전트에 그 기능을 붙이고 Studio나 스크립트로 동작을 확인한다.
3. **실제 프로젝트 비교**: 운영 중인 Mastra 프로젝트에서 같은 기능이 어떻게 쓰였는지 코드 위치를 찾아 본다.

문서의 모든 소제목을 다루지는 않는다. 페이지마다 다룰 것과 건너뛸 것을 아래 표에 적어 둔다.

## 따라 하기

커밋은 "골격"과 "완성"으로 나뉘어 있다. 골격 커밋은 import·구조·주석만 있고 판단이 들어가는 자리(프롬프트 문장, 도구 설명, 스키마 설명)가 `// TODO`로 비어 있다. 완성 커밋이 그 자리를 채운 것이다.

직접 실습하려면 이렇게 한다.

1. `git log --oneline`에서 하고 싶은 소제목의 **골격** 커밋을 찾아 자기 브랜치를 만든다.
   ```bash
   git switch -c study/<이름> <골격 커밋>
   ```
2. `docs/`의 해당 절을 읽으면서 `TODO`를 채우고 `npm run check`, `npm run typecheck`, Studio로 확인한다.
3. 다음 **완성** 커밋의 코드와 비교한다. (`git diff <완성 커밋> -- src`)
4. 자기 정리는 `notes/`에 쓴다. `docs/`는 저장소 작성자의 정리이므로 고치지 않는다. 그래야 이후 회차를 `git pull`로 받을 때 충돌이 나지 않는다.

절이 끝난 시점에는 태그가 있다. `git tag`로 목록을 본다.

| 태그 | 시점 |
|---|---|
| `agents/1-overview` | Agents 절 Overview 페이지 끝 |
| `agents/2-tools` | Agents 절 Tools 페이지 끝 |
| `agents/3-structured-output` | Agents 절 Structured Output 페이지 끝 |
| `agents/4-processors` | Agents 절 Processors 페이지 끝 |

## 공식 문서에서 다룬 것과 건너뛴 것

### Agents / Overview

| 소제목 | 처리 | 이유 |
|---|---|---|
| 에이전트 정의, When to use agents | 다룸 (1-1) | 에이전트 루프와 workflow와의 구분 |
| Quickstart | 다룸 (1-2) | `Agent` 생성자와 등록 |
| Use your agent | 다룸 (1-3) | `generate`, `stream` |
| Expand your agent | 건너뜀 | 다른 페이지 링크 표 |
| Multi-agent systems | 건너뜀 | 별도 가이드 문서 |

### Agents / Tools

| 소제목 | 처리 | 이유 |
|---|---|---|
| Quickstart, Multiple tools, Control toolName | 다룸 (2-1) | 도구 정의·연결의 핵심. 도구 이름은 id가 아니라 객체 키 |
| Define schemas | 다룸 (2-2) | description·describe 작성 지침, `outputSchema` union |
| Shape output for the model, Transform tool payloads | 다룸 (2-3, 개념만) | 도구 결과가 컨텍스트를 차지하는 문제 |
| When to use tools | 건너뜀 | 자명함 |
| Valibot, ArkType | 건너뜀 | zod만 씀 |
| Agents as tools, Workflows as tools | 건너뜀 | 별도 문서(Supervisor agents) 범위 |
| Share tools, Streaming, Control tool selection, Built-in tools | 건너뜀 | 필요할 때 레퍼런스로 충분 |
| Run logic around tool calls (hooks) | 건너뜀 | 차단·검사는 Guardrails에서 |

### Agents / Structured Output

| 소제목 | 처리 | 이유 |
|---|---|---|
| Define schemas (zod), When to use | 다룸 (3-1) | `structuredOutput` 옵션과 `response.object` |
| Combine tools and structured output, `jsonPromptInjection`, separate structuring model | 다룸 (3-2) | 도구와 함께 쓸 때의 모델 제약 |
| Handle errors | 다룸 (3-3) | `errorStrategy` |
| Valibot, ArkType, JSON Schema | 건너뜀 | zod만 씀 |
| Stream structured output, `useAgent`, `prepareStep` | 건너뜀 | 필요할 때 레퍼런스로 충분 |

### Agents / Processors

| 소제목 | 처리 | 이유 |
|---|---|---|
| 개념, Execution order, Attach processors | 다룸 (4-1) | 훅 시점과 순서, Memory 프로세서와의 관계 |
| Create custom processors (processInput, processOutputStream, processOutputResult, abort) | 다룸 (4-1, 4-2) | 실무 프로세서는 대부분 커스텀 |
| Built-in utility processors (TokenLimiter, ToolCallFilter) | 다룸 (4-3, 개념만) | Memory가 있을 때 의미. 실습은 Memory 회차로 |
| processInputStep, processLLMRequest/Response, prepareStep | 건너뜀 | 단계별 모델 교체 같은 고급 용도 |
| Response caching | 건너뜀 | beta |
| Advanced patterns, API error handling, ProviderHistoryCompat, ToolSearchProcessor | 건너뜀 | 필요할 때 레퍼런스로 |
| Violation callbacks | Guardrails에서 | 가드레일과 한 묶음 |

나머지 페이지(Guardrails, Human-in-the-Loop, Code Mode)는 진행하며 채운다.

아래 회차들의 표는 준비 단계에서 미리 적은 것(예정)이다. 진행하며 고친다.

### Memory / Overview

| 소제목 | 처리 | 이유 |
|---|---|---|
| 도입, When to use memory, Quickstart, Message history | 다룸 (1-1) | storage·`Memory`·resource/thread 세 가지가 켜는 방법의 전부 |
| What the model sees | 다룸 (1-2, 개념만) | 각 층이 컨텍스트 어디에 들어가는지 |
| Observational Memory | 건너뜀 | 3에서 다룸 |
| Memory in multi-agent systems | 건너뜀 | Supervisor agents 문서 범위 |
| Observability | 건너뜀 | 10회차 Observe |
| Switch memory per request | 건너뜀 | `RequestContext`는 9회차 Server |

### Memory / Message History

| 소제목 | 처리 | 이유 |
|---|---|---|
| Threads and resources, Getting started | 건너뜀 | 1-1에서 다룸 |
| Thread title generation | 다룸 (2-1) | 채팅 UI의 스레드 목록에 필요. `generateTitle` 모델·지침 |
| Accessing memory, Querying | 다룸 (2-2) | `listThreads`, `getThreadById`, `recall`. 접근 제어는 앱 몫 |
| UI format, Thread cloning, Deleting messages | 건너뜀 | 필요할 때 레퍼런스로 충분 |

### Memory / Observational Memory

| 소제목 | 처리 | 이유 |
|---|---|---|
| Quickstart, Benefits, How it works | 다룸 (3-1) | 관찰·반추가 도는 원리와 기본 모델 문제 |
| Models, Scopes, Token budgets, Async buffering, Comparing OM | 다룸 (3-2, 개념만) | 운영에서 정하는 값과 다른 층과의 선택 |
| Temporal gap markers, Early activation, Buffer on idle | 건너뜀 | 프롬프트 캐시·유휴 최적화 |
| Extractors, Working memory updates, Retrieval mode | 건너뜀 | 부가 기능 |
| Token-tiered model selection, Token counting cache, Caller-supplied token estimates, Observer Context Optimization, Hooks, Migrating, Studio | 건너뜀 | 세부 사항 |

### Memory / Working Memory

| 소제목 | 처리 | 이유 |
|---|---|---|
| Quickstart, How it works, Memory persistence scopes, Custom templates, Designing effective templates | 다룸 (4-1) | 켜는 방법, scope, 템플릿 지침. clap-agent가 끈 이유 |
| Structured working memory, Choosing between template and schema | 다룸 (4-2, 개념만) | 대체와 병합의 차이 |
| Storage adapter support, Example: Multi-step retention | 건너뜀 | 표 확인, 실습에서 직접 봄 |
| Setting initial working memory, Read-only working memory, Opt in to state signals, Examples | 건너뜀 | 레퍼런스로 충분, experimental |

### Memory / Semantic Recall

| 소제목 | 처리 | 이유 |
|---|---|---|
| How it works, Quickstart (LibSQL), Recall configuration | 다룸 (5-1) | `vector`·`embedder`와 `topK`·`messageRange`·`scope` |
| Embedder configuration (Model Router), Disable semantic recall | 다룸 (5-2, 개념만) | 임베딩 모델 선택과 켜지 않을 때의 판단 |
| Quickstart (MongoDB), 벡터 저장소 목록, PostgreSQL index optimization | 건너뜀 | libSQL만 씀 |
| Using the `recall()` method | 건너뜀 | 2-2에서 다룸 |
| Metadata filtering, AI SDK Packages, FastEmbed, Viewing recalled messages | 건너뜀 | 레퍼런스로 충분, 10회차 Observe |

### Memory / Memory Processors

| 소제목 | 처리 | 이유 |
|---|---|---|
| Built-in memory processors, Processor execution order, Guardrails and memory | 다룸 (6-1, 개념만) | 내 프로세서와 메모리의 순서가 저장 여부를 정한다 |
| Manual control and deduplication | 건너뜀 | 메모리 프로세서를 직접 배치하는 경우는 드묾 |
| Handling large attachments | 건너뜀 | 첨부 파일을 쓰지 않음 |

### Memory / Multi-User Threads

| 소제목 | 처리 | 이유 |
|---|---|---|
| When to use, Share one resourceId, Tag each user message, Security | 다룸 (7-1, 개념만) | 스레드 소유자 모델의 한계와 우회 방법 |
| Combining with memory layers | 건너뜀 | 3·4의 선택 기준을 다인 스레드에 적용한 것 |

### Storage / Storage

| 소제목 | 처리 | 이유 |
|---|---|---|
| 개요, When to configure storage, How storage works, Choose a backend | 다룸 (1-1) | 도메인 개념과 DB 선택 기준 |
| Get started locally | 다룸 (1-2) | libSQL 연결 |
| Configure for production, Configuration scope | 다룸 (1-3) | retention·`prune()`, 인스턴스·에이전트 단위 storage |
| Composite storage | 건너뜀 | 관측 데이터 분리는 Observe 절에서 |
| Supported providers | 건너뜀 | 목록 |

### Server / Overview

| 소제목 | 처리 | 이유 |
|---|---|---|
| Configuration, Server architecture, REST API | 다룸 (2-1) | `server` 옵션과 자동 생성 엔드포인트 |
| Server features, Deploy your server | 건너뜀 | 링크 목록, 배포 대상별 페이지 |
| OpenAI Responses API, Stream data redaction, TypeScript configuration | 건너뜀 | experimental, 기본 켜짐, tsconfig에 반영됨 |

### Server / Middleware

| 소제목 | 처리 | 이유 |
|---|---|---|
| 개요, Block built-in route groups, Request logging | 다룸 (3-1) | 등록과 실행 순서 |
| Authentication, Authorization (User Isolation) | 다룸 (3-2) | `server.auth`, `mapUserToResourceId` |
| Using RequestContext | 다룸 (4-1) | Request Context 페이지에서 |
| CORS support, Advanced(resource ID in middleware, `MASTRA_THREAD_ID_KEY`) | 건너뜀 | `server.cors`로 대체, 드문 경우 |

### Server / Request Context

| 소제목 | 처리 | 이유 |
|---|---|---|
| Setting values, Runtime-only keys, Accessing with agents·tools, Reserved keys, Schema validation, Studio presets | 다룸 (4-1) | 서버 → 도구로 값이 가는 길 |
| Workflow steps, Prompt registry, TypeScript support | 건너뜀 | 워크플로 미사용, 외부 서비스, 스키마로 대체 |

### Server / Custom API Routes

| 소제목 | 처리 | 이유 |
|---|---|---|
| `registerApiRoute`, Middleware, OpenAPI, Authentication, Swagger UI | 다룸 (5-1) | 커스텀 라우트 정의와 보호 |
| Schema validation (`createRoute`) | 다룸 (5-1, 개념만) | `@mastra/server` 직접 의존 필요 |
| Continue generation after client disconnect | 건너뜀 | 고급 스트리밍 |

### Server / Server Adapters

| 소제목 | 처리 | 이유 |
|---|---|---|
| When to use, Server config vs adapter options | 다룸 (6-1, 개념만) | 어댑터가 필요한 경우 |
| 나머지 | 건너뜀 | 어댑터를 쓰지 않는다 |

### Server / Custom Adapters, PubSub

| 소제목 | 처리 | 이유 |
|---|---|---|
| 전체 | 건너뜀 | 미지원 프레임워크 전용, 단일 프로세스 기본값으로 충분 |

### Server / Mastra Client

| 소제목 | 처리 | 이유 |
|---|---|---|
| Initialize, generate·stream, Credentials and session cookies | 다룸 (9-1, 개념만) | 서버 HTTP 계약을 클라이언트 관점에서 |
| Configuration options, request cancelling, Client tools, dynamic workflows, server-side use | 건너뜀 | 레퍼런스로 충분 |

### Deploy / Mastra Server

| 소제목 | 처리 | 이유 |
|---|---|---|
| Building, Build output, Running, Environment variables, Build-time configuration, Graceful shutdown | 다룸 (10-1) | `mastra build`·`start`, `drainTimeout` |
| Public folder, Build process, Troubleshooting | 건너뜀 | 레퍼런스로 충분 |

### Agents / Processors

| 소제목 | 처리 | 이유 |
|---|---|---|
| 개념, Execution order, Attach processors | 다룸 (4-1) | 훅 시점과 순서, Memory 프로세서와의 관계 |
| Create custom processors (processInput, processOutputStream, processOutputResult, abort) | 다룸 (4-1, 4-2) | 실무 프로세서는 대부분 커스텀 |
| Built-in utility processors (TokenLimiter, ToolCallFilter) | 다룸 (4-3, 개념만) | Memory가 있을 때 의미. 실습은 Memory 회차로 |
| processInputStep, processLLMRequest/Response, prepareStep | 건너뜀 | 단계별 모델 교체 같은 고급 용도 |
| Response caching | 건너뜀 | beta |
| Advanced patterns, API error handling, ProviderHistoryCompat, ToolSearchProcessor | 건너뜀 | 필요할 때 레퍼런스로 |
| Violation callbacks | Guardrails에서 | 가드레일과 한 묶음 |

나머지 페이지(Guardrails, Human-in-the-Loop, Code Mode)는 진행하며 채운다.

### Observability / Overview

| 소제목 | 처리 | 이유 |
|---|---|---|
| Quickstart, Basic config, Storage signal support | 다룸 (1-1) | 최소 설정과 storage별로 남는 신호 |
| Maintaining Studio access | 다룸 (7-1 안에서) | 외부 exporter를 붙일 때만 |
| Flushing in serverless, Multi-config setup, Mastra platform | 건너뜀 | 서버 상시 실행, 단일 config, 유료 호스팅 |

### Observability / Traces: Usage

| 소제목 | 처리 | 이유 |
|---|---|---|
| Sampling strategies | 다룸 (2-1) | 비용을 정하는 첫 결정. `type`은 enum |
| Custom metadata, environment, RequestContext 자동 승격, tags | 다룸 (2-2) | 사용자·환경으로 trace를 찾는 실무 필수 |
| Creating child spans | 다룸 (2-3) | 도구 안 span metadata |
| Span processors, Span filtering, Serialization | 다룸 (2-4) | `SensitiveDataFilter`의 목록 대체 문제 |
| Retrieving trace IDs, External tracing | 다룸 (2-5, 개념만) | 로그·APM과 잇는 열쇠 |
| Hiding input/output, Custom span formatters | 건너뜀 | 호출 단위 옵션, exporter별 표현 |

### Observability / Traces: Storage

| 소제목 | 처리 | 이유 |
|---|---|---|
| Tracing strategies, Provider support, Production recommendations | 다룸 (3-1) | Studio에 늦게 보이는 이유, 운영 저장소 |
| Batching, Error handling, Dropped events | 건너뜀 | 기본값으로 충분 |

### Observability / Traces: Logging

| 소제목 | 처리 | 이유 |
|---|---|---|
| PinoLogger, observability storage 전달, trace 상관, 로그 레벨 | 다룸 (4-1) | trace id 자동 주입 |
| 도구 안 로그, 구조화 필드 | 다룸 (4-2) | span에 남지 않는 실패를 로그로 |
| Custom loggers, Querying logs, workflow 로그 | 건너뜀 | PinoLogger·Studio로 충분, workflow 미사용 |

### Observability / Traces: Feedback

| 소제목 | 처리 | 이유 |
|---|---|---|
| Add feedback, Find the trace for a message, Create feedback | 다룸 (5-1, 개념만) | clap-agent의 좋아요·싫어요 구조 |
| List, Delete, Analytics, Export | 건너뜀 | 화면이 있어야 의미가 있다 |

### Observability / Metrics

| 소제목 | 처리 | 이유 |
|---|---|---|
| 자동 메트릭, Storage support, Set up local metrics, Studio | 다룸 (6-1) | DuckDB composite storage |
| Metric queries | 건너뜀 | 커스텀 대시보드는 Datadog에서 |

### Observability / Datadog

| 소제목 | 처리 | 이유 |
|---|---|---|
| Exporter, APM, Bridge | 다룸 (7-1, 개념만) | clap-agent가 bridge를 쓴다. 실습은 계정이 필요해 없음 |
| Troubleshooting | 건너뜀 | 문제가 났을 때 |

### Evals / Overview

| 소제목 | 처리 | 이유 |
|---|---|---|
| Live evaluations, sampling, filter, Score persistence | 다룸 (8-1) | 라이브 채점과 등록 |
| Trace evaluations, Studio | 다룸 (8-2) | 지난 trace 채점, 점수 → 데이터셋 |
| Types of scorers, workflow step scorers | 건너뜀 | 분류만, workflow 미사용 |

### Evals / Built-in Scorers

| 소제목 | 처리 | 이유 |
|---|---|---|
| Accuracy and reliability, Output quality | 다룸 (9-1) | 선택 기준 |
| Context quality | 건너뜀 | RAG 컨텍스트 없음 |

### Evals / Custom Scorers

| 소제목 | 처리 | 이유 |
|---|---|---|
| 4단계 파이프라인, 함수 vs 프롬프트 객체, Agent type | 다룸 (10-1) | 코드 기반 스코어러 골격 |
| Input filtering (filterRun) | 건너뜀 | 대화가 길어질 때. 8회차 뒤에 |

### Evals / Quick Checks

| 소제목 | 처리 | 이유 |
|---|---|---|
| Available checks, live scoring, How checks work | 다룸 (11-1) | 비용 0 스코어러 |

### Evals / Running in CI, Vitest Integration

| 소제목 | 처리 | 이유 |
|---|---|---|
| runEvals 입출력, concurrency | 다룸 (12-1) | 배치 평가 스크립트 |
| expectEvals, expectEval, matchers, reporter | 다룸 (12-2, 개념만) | 테스트 러너 없음. clap-agent도 tsx 스크립트 |

### Evals / Gates and Verdicts

| 소제목 | 처리 | 이유 |
|---|---|---|
| gates, thresholds, verdict, CI | 다룸 (13-1) | 종료 코드로 CI 게이트 |

### Evals / Datasets

| 소제목 | 처리 | 이유 |
|---|---|---|
| create, schemas, addItems, Studio, Versioning | 다룸 (14-1) | 데이터셋 생성 스크립트와 버전 비교 |

### Evals / Experiments

| 소제목 | 처리 | 이유 |
|---|---|---|
| startExperiment, Studio, Registered agent, Scoring results, Configuration | 다룸 (15-1) | 실험 실행과 비교 |
| Workflow·Scorer target, Memory-enabled, per-item scorers, hooks, tool mocks, async, caller-driven | 건너뜀 | 필요할 때 레퍼런스로 |

Multi-turn Evals, Evals with Memory는 memory(8회차) 뒤에 본다.

## Claude Code와 함께 공부하기

이 저장소를 Claude Code로 열면 `CLAUDE.md`의 규칙대로 진행한다. 소제목 하나씩 개념, 실습, 비교 순서로 설명하고, "다음"이라고 하면 넘어간다. 실습 파일의 골격은 Claude가 만들고 `TODO` 자리를 사용자가 채운다.

비교 대상 프로젝트는 `CLAUDE.md`에 경로로 적혀 있다. 자기 프로젝트와 비교하려면 그 경로를 바꾸면 된다.

## Mastra 문서

- Agents: https://mastra.ai/docs/agents/overview
- 각 문서는 URL 끝에 `.md`를 붙이면 원문 마크다운으로 볼 수 있다. (예: https://mastra.ai/docs/agents/overview.md)
- 전체 페이지 목록: https://mastra.ai/llms.txt
