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
  agents.md             Agents 절 정리
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

1. `git log --oneline`에서 하고 싶은 소제목의 **골격** 커밋을 찾아 checkout 한다.
2. `docs/`의 해당 절을 읽으면서 `TODO`를 채우고 `npm run check`, `npm run typecheck`, Studio로 확인한다.
3. 다음 **완성** 커밋의 코드와 비교한다.

절이 끝난 시점에는 태그가 있다. `git tag`로 목록을 본다.

| 태그 | 시점 |
|---|---|
| `agents/1-overview` | Agents 절 Overview 페이지 끝 |
| `agents/2-tools` | Agents 절 Tools 페이지 끝 |

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

나머지 페이지(Processors, Guardrails, Human-in-the-Loop, Code Mode)는 진행하며 채운다.

## Claude Code와 함께 공부하기

이 저장소를 Claude Code로 열면 `CLAUDE.md`의 규칙대로 진행한다. 소제목 하나씩 개념, 실습, 비교 순서로 설명하고, "다음"이라고 하면 넘어간다. 실습 파일의 골격은 Claude가 만들고 `TODO` 자리를 사용자가 채운다.

비교 대상 프로젝트는 `CLAUDE.md`에 경로로 적혀 있다. 자기 프로젝트와 비교하려면 그 경로를 바꾸면 된다.

## Mastra 문서

- Agents: https://mastra.ai/docs/agents/overview
- 각 문서는 URL 끝에 `.md`를 붙이면 원문 마크다운으로 볼 수 있다. (예: https://mastra.ai/docs/agents/overview.md)
- 전체 페이지 목록: https://mastra.ai/llms.txt
