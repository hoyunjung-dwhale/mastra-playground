# mastra-playground

[Mastra](https://mastra.ai/docs) 공식 문서를 절 단위로 읽고 실습하는 학습용 프로젝트다. 문서 한 페이지를 읽을 때마다 같은 에이전트 하나에 기능을 붙여 가며, 정리한 내용은 `docs/` 아래에 남긴다.

## 준비

| 항목 | 값 |
|---|---|
| Node.js | 22.13 이상 (`node -v`로 확인) |
| 패키지 관리자 | npm |
| LLM API 키 | 아래 provider 중 하나 |

API 키는 provider마다 발급 위치가 다르다.

| provider | 발급 위치 | 환경 변수 | 비고 |
|---|---|---|---|
| Google Gemini | https://aistudio.google.com/apikey | `GOOGLE_API_KEY` | Flash 계열은 무료 티어가 있다. ([요금](https://ai.google.dev/gemini-api/docs/pricing)) |
| Anthropic Claude | https://platform.claude.com/settings/keys | `ANTHROPIC_API_KEY` | 유료. claude.ai 구독과는 별도 결제다. |
| OpenAI | https://platform.openai.com/api-keys | `OPENAI_API_KEY` | 유료 |

## 실행

```bash
git clone https://github.com/hoyunjung-dwhale/mastra-playground.git
cd mastra-playground
npm install
cp .env.example .env   # 파일이 없으면 아래 내용으로 직접 만든다
```

`.env`에 발급받은 키를 넣는다. 쓰지 않는 항목은 비워 두면 된다.

```
GOOGLE_API_KEY=
ANTHROPIC_API_KEY=
```

개발 서버를 띄운다.

```bash
npm run dev
```

http://localhost:4111 을 열면 Studio가 뜬다. Studio는 등록된 에이전트와 대화하고 도구 호출 과정을 볼 수 있는 화면이다. 파일을 고치면 서버가 자동으로 다시 읽으므로 재시작하지 않아도 된다.

다른 provider를 쓰려면 에이전트 파일의 `model` 문자열만 바꾼다. 예를 들어 `google/gemini-3.6-flash`를 `anthropic/claude-sonnet-5`로 바꾸면 `ANTHROPIC_API_KEY`를 읽는다. 지원하는 모델 목록은 https://mastra.ai/models 에 있다.

## 구조

```
src/mastra/
  index.ts          Mastra 인스턴스. 에이전트를 여기에 등록한다
  agents/           에이전트 정의
  tools/            도구 정의 (Tools 절부터)
docs/
  agents.md         Agents 절 정리
CLAUDE.md           Claude Code로 함께 공부할 때 쓰는 진행 규칙
```

## 진행 방식

문서 절 하나를 한 회차로 잡고, 회차마다 `docs/` 아래에 정리 파일을 하나씩 둔다.

| 회차 | 문서 절 | 정리 파일 |
|---|---|---|
| 1 | Build / Agents | `docs/agents.md` |
| 2 | Build / Memory | `docs/memory.md` |
| 3 | Develop, Deploy / Storage, Server | `docs/develop-deploy.md` |
| 4 | Observe / Trace, Metrics, Evals | `docs/observe.md` |

한 절 안에서는 문서의 소제목 하나를 다음 세 단계로 본다.

1. **개념**: 문서 원문에서 그 소제목이 말하는 것과, 그것이 전제하는 일반 개념(에이전트 루프, tool calling, system prompt 등)을 정리한다.
2. **실습**: 같은 에이전트에 그 기능을 직접 붙이고 Studio에서 동작을 확인한다.
3. **실제 프로젝트 비교**: 운영 중인 Mastra 프로젝트에서 같은 기능이 어떻게 쓰였는지 코드 위치를 찾아 본다.

실습 에이전트는 할 일 관리 에이전트다. 외부 API 없이 동작하고, Tools·Structured Output·Processors·Guardrails·Human-in-the-Loop·Code Mode가 모두 자연스럽게 붙기 때문에 골랐다.

## Claude Code와 함께 공부하기

이 저장소를 Claude Code로 열면 `CLAUDE.md`의 규칙대로 진행한다. 소제목 하나씩 개념, 실습, 비교 순서로 설명하고, "다음"이라고 하면 넘어간다. 실습 파일의 골격은 Claude가 만들고 `TODO` 자리를 사용자가 채운다.

비교 대상 프로젝트는 `CLAUDE.md`에 경로로 적혀 있다. 자기 프로젝트와 비교하려면 그 경로를 바꾸면 된다.

## Mastra 문서

- Agents: https://mastra.ai/docs/agents/overview
- 각 문서는 URL 끝에 `.md`를 붙이면 원문 마크다운으로 볼 수 있다. (예: https://mastra.ai/docs/agents/overview.md)
- 전체 페이지 목록: https://mastra.ai/llms.txt
