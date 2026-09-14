# mastra-playground

[Mastra](https://mastra.ai/docs) 공식 문서를 절 단위로 읽고 실습하는 학습용 프로젝트다. 문서 한 페이지를 읽을 때마다 같은 에이전트(할 일 관리 에이전트) 하나에 기능을 붙여 가며, 정리한 내용은 `docs/` 아래에 남긴다.

## 시작하기

Node.js 22.13 이상과 npm, 그리고 아래 provider 중 하나의 API 키가 필요하다.

| provider | 발급 위치 | 환경 변수 | 비고 |
|---|---|---|---|
| Google Gemini | https://aistudio.google.com/apikey | `GOOGLE_API_KEY` | Flash 계열에 무료 티어가 있다. 한도는 프로젝트 단위이며 [AI Studio](https://aistudio.google.com/rate-limit)에서 확인한다 |
| Anthropic Claude | https://platform.claude.com/settings/keys | `ANTHROPIC_API_KEY` | 유료. claude.ai 구독과는 [별도 결제](https://support.claude.com/en/articles/9876003)다 |
| OpenAI | https://platform.openai.com/api-keys | `OPENAI_API_KEY` | 유료 |

```bash
git clone https://github.com/hoyunjung-dwhale/mastra-playground.git
cd mastra-playground
npm install
cp .env.example .env   # 발급받은 키를 넣고 나머지는 비워 둔다
npm run dev            # 개발 서버 + Studio (http://localhost:4111)
```

Studio는 등록된 에이전트와 대화하고 도구 호출 과정을 보는 화면이다. 파일을 고치면 서버가 자동으로 다시 읽는다.

| 명령 | 하는 일 |
|---|---|
| `npm run call` | `generate`·`stream` 호출 |
| `npm run structured` | structured output 호출 |
| `npm run call:memory` | `resource`·`thread`를 넘겨 기억 확인 |
| `npm run threads` | 저장된 스레드·메시지 조회 |
| `npm run check` | biome 서식·린트 (자동 수정은 `check:fix`) |
| `npm run typecheck` | tsc |

provider를 바꾸려면 `src/mastra/models.ts`의 모델 문자열만 고친다. 지원 목록은 https://mastra.ai/models 에 있다. `DATABASE_URL`을 비워 두면 프로젝트 루트의 `mastra.db`(libSQL)를 쓴다.

## 구조

```
src/mastra/
  index.ts              Mastra 인스턴스. 에이전트와 storage를 등록한다
  constants.ts          에이전트 id·등록 키
  models.ts             모델·임베딩 모델 문자열 상수
  storage.ts            libSQL storage와 벡터 저장소
  agents/               에이전트 본체, system prompt, Memory 설정
  tools/                도구. 파일 하나에 하나씩
  todo/                 할 일 스키마(zod)와 저장소
  processors/           입력 가드레일, 출력 스트림 필터
scripts/                호출·조회 예제
docs/                   회차별 정리 (저장소 작성자)
notes/                  클론한 학습자가 자기 정리를 쓰는 곳
CLAUDE.md               Claude Code로 함께 공부할 때 쓰는 진행 규칙
```

실습 코드여도 운영 기준으로 쓴다. 식별자와 모델 문자열은 상수로, system prompt는 `*.prompt.ts`로 분리하고, 제약은 주석이 아니라 타입으로 강제한다.

## 진행 방식

문서 절 하나를 한 회차로 잡고 회차마다 정리 파일을 하나씩 둔다. 소제목마다 개념, 실습, 운영 프로젝트 비교 순서로 본다. 무엇을 다루고 무엇을 건너뛰는지는 각 정리 파일 맨 위에 적어 둔다.

| 회차 | 문서 절 | 정리 파일 | 상태 |
|---|---|---|---|
| 1 | Build / Agents | `docs/agents.md` | 끝 |
| 2 | Build / Memory | `docs/memory.md` | 끝 |
| 3 | Develop, Deploy / Storage, Server | `docs/develop-deploy.md` | 예정 |
| 4 | Observe / Trace, Metrics, Evals | `docs/observe.md` | 예정 |

## 따라 하기

커밋이 "골격"과 "완성"으로 나뉘어 있다. 골격 커밋은 구조와 주석만 있고 판단이 들어가는 자리가 `// TODO`로 비어 있으며, 완성 커밋이 그 자리를 채운 것이다.

1. `git log --oneline`에서 하고 싶은 소제목의 **골격** 커밋을 찾아 브랜치를 만든다.
   ```bash
   git switch -c study/<이름> <골격 커밋>
   ```
2. `docs/`의 해당 절을 읽으며 `TODO`를 채우고 `npm run check`, `npm run typecheck`, Studio로 확인한다.
3. 다음 **완성** 커밋과 비교한다. (`git diff <완성 커밋> -- src`)
4. 자기 정리는 `notes/`에 쓴다. `docs/`를 고치지 않아야 이후 회차를 `git pull`로 받을 때 충돌이 없다.

절이 끝난 시점에는 `<절>/<번호>-<페이지>` 형식의 태그가 있다. `git tag`로 목록을 본다.

## Claude Code와 함께 공부하기

이 저장소를 Claude Code로 열면 `CLAUDE.md`의 규칙대로 진행한다. 소제목 하나씩 설명하고 "다음"이라고 하면 넘어가며, 실습 파일의 골격은 Claude가 만들고 `TODO` 자리를 사용자가 채운다. 비교 대상 프로젝트 경로도 `CLAUDE.md`에 적혀 있어 자기 프로젝트로 바꿀 수 있다.

## Mastra 문서

- 각 문서는 URL 끝에 `.md`를 붙이면 원문 마크다운으로 볼 수 있다. (예: https://mastra.ai/docs/agents/overview.md)
- 전체 페이지 목록: https://mastra.ai/llms.txt
