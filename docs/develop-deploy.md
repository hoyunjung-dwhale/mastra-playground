# Develop / Deploy

진행 계획만 적어 둔 틀이다. 내용은 소제목을 하나씩 볼 때마다 아래에 채운다.

## 1. Storage

원문: https://mastra.ai/docs/storage

8회차에서 대화를 저장하며 storage를 이미 붙였다. 여기서는 도메인 데이터와 운영 설정을 본다.

| 소제목 | 처리 |
|---|---|
| When to configure storage, How storage works | 다룸 (1-1). domain 단위로 나뉜 구조를 본다 |
| Get started locally | 다룸 (1-1). 8회차에서 붙인 libSQL 파일이 무엇을 담고 있는지 확인만 한다 |
| Configuration scope, Choose a backend by data shape | 다룸 (1-2). 인스턴스 단위와 에이전트 단위를 나누는 기준이다 |
| Composite storage, Configure for production | 다룸 (1-2). domain별로 다른 DB에 보내는 방법이다 |
| Retention과 prune | 다룸 (1-2). 대화가 쌓이면 지워야 한다 |
| Supported providers | 건너뜀. 링크 목록이라 설명할 내용이 없다 |

### 1-1 domain과 테이블

#### 개념

storage는 런타임 상태를 프로세스 밖에 남기는 영속화 계층이다. Memory(스레드·메시지·working memory), 워크플로 스냅샷, 관측 데이터(트레이스·스팬·로그), 평가 기록, 스케줄이 전부 같은 저장소를 바라본다. 등록하지 않으면 in-memory 저장소가 쓰이고 프로세스가 끝나면 사라진다.

Mastra는 이 데이터를 **domain** 단위로 묶는다. adapter마다 구현한 domain이 달라서, "이 DB로 스케줄 기능을 쓸 수 있는가" 같은 질문의 답이 domain 지원 목록으로 정해진다.

| domain | 담당 데이터 |
|---|---|
| `memory` | 스레드, 메시지, resource, working memory |
| `workflows` | 워크플로 스냅샷 |
| `observability` | 트레이스, 스팬, 메트릭, 로그 |
| `scores`, `datasets`, `experiments` | 평가 기록 |
| `backgroundTasks`, `schedules`, `threadState` | 백그라운드 작업, 스케줄, 지속 상태 |

#### 실습 결과

`sqlite3 mastra.db ".tables"`로 보면 테이블이 46개다. Memory만 켰는데도 `mastra_workflow_snapshot`, `mastra_schedules`처럼 쓰지 않은 domain의 테이블까지 미리 만들어져 있다. adapter가 구현한 domain의 스키마를 첫 사용 시점에 한꺼번에 생성하기 때문이다. 스키마 소유권이 프레임워크에 있으므로, 운영에서는 애플리케이션 계정에 테이블 생성 권한을 줄지가 설계 질문이 된다.

행이 들어 있는 테이블은 `mastra_messages`(8행)와 `mastra_threads`(2행)뿐이었다.

**메시지 테이블의 구조**

열은 `id`, `thread_id`, `resourceId`, `content`, `role`, `type`, `createdAt` 일곱 개다. 실제 내용은 전부 `content` 열 하나에 JSON 문자열로 들어가고, 인덱스가 걸린 열만 밖으로 꺼내 두었다.

```
idx_messages_thread_created_at            (thread_id, createdAt)
idx_messages_thread_resource_created_at   (thread_id, resourceId, createdAt)
```

둘 다 `createdAt`이 마지막이다. "이 스레드의 최근 N개"가 기본 조회이기 때문이고, `lastMessages: 10`이 이 인덱스를 탄다.

`role`에는 `user`와 `assistant` 두 값만 있다. 도구 호출이 별도 행이 아니라 assistant 메시지의 `parts` 배열 안에 들어가기 때문이다.

| 어시스턴트 행 | `parts` | `content` 길이 |
|---|---|---|
| 도구 없이 답만 | `text` | 923자 |
| 도구 1회 | `tool-invocation` + `step-start` + `text` | 1,535자 |

**LLM에 나가는 요청과 DB에 남는 것**

`agent.generate` 한 번이 provider에 HTTP 요청 7건을 만들었다. 임베딩 2건(semantic recall), 모더레이션 1건, 본 호출 2건(도구 호출 전후), 저장용 임베딩 1건, 제목 생성 1건이다.

| | DB 저장 | provider 전송(Gemini) |
|---|---|---|
| 단위 | 행 2개 (user 1, assistant 1) | `contents` 원소 3개 |
| 역할 이름 | `user`, `assistant` | `user`, `model` |
| 도구 호출 | `tool-invocation` 파트 하나에 인자와 결과가 함께 | `functionCall`과 `functionResponse` 두 원소로 분리 |
| system prompt, 도구 선언 | 저장하지 않음 | 매 요청 동봉 |

저장은 선형이고 전송은 누적이다. 대화가 길어지면 행이 늘어날 뿐 기존 행은 그대로인데, 모델에는 매 호출 히스토리를 처음부터 다시 보낸다. Memory의 각 층은 DB를 줄이는 장치가 아니라 이 재전송분을 줄이는 장치다.

토큰으로 보면 사용자 문장 한 줄(모더레이션 호출 149 토큰)이 본 호출에서는 1,036 토큰이 된다. 늘어난 대부분이 system prompt와 working memory 지침, 도구 선언 4개다. 도구 결과를 붙인 두 번째 스텝은 1,271 토큰이었다.

행 크기를 키우는 것은 대화 내용이 아니라 `providerMetadata`다. capture-1의 어시스턴트 행 2,433자 중 1,500자가 Gemini의 `thoughtSignature`였다. 응답에서 받은 값이 다음 요청의 `contents`로 그대로 되돌아가기 때문에 보관한다.

#### clap-agent

- 스레드 `metadata`를 조회 필터로 쓴다. 리뷰 채팅 시작 때 `reviewGroupId`를 심고(`src/mastra/server/review/review-chat.ts:460`), 목록 라우트에서 그 값으로 DB 필터를 건다(`review-thread-list.ts:43`). 애플리케이션에서 거르면 `total`·`hasMore`가 틀어지기 때문이다.
- 같은 `metadata`에 `workingMemory` 예약 키가 들어갈 수 있어 덮어쓰기 위험이 있다. 병합 저장이 버전업으로 바뀌면 유실되므로 재확인이 필요하다는 주석을 남겨 두었다(`review-chat.ts:457`).
- 저장 행을 그대로 응답에 싣지 않는다. 파트를 `text`, `tool`(이름만), 리포트 첨부로 좁힌 zod 스키마를 두어(`review-thread-messages.ts:21`), 스트림에서 마스킹한 도구 원문이 히스토리 조회로 되돌아오는 경로를 막는다.
- Anthropic 모델을 쓰는 에이전트에는 캐시 마커 프로세서를 붙인다(`src/mastra/processors/anthropic-cache-breakpoint.ts`). Anthropic은 breakpoint마다 뒤로 최대 20 position까지만 이전 캐시를 찾고, 연속된 `tool_use` 묶음과 `tool_result` 묶음은 각각 1 position으로 접힌다. 그래서 순차 도구 루프가 길어지면 룩백을 넘긴다. 코드는 한도 20을 상수로 두고 15 간격으로 마커를 심으며, 세는 단위가 AI SDK 파트라 실제 position보다 크거나 같아 항상 안전한 쪽으로 틀린다.

#### 헷갈렸던 지점

- 저 JSON이 `content`라는 거야? → 그렇다. JSON 전체가 `content` 열 하나에 든 문자열이고, 그 안에 평문 복사본인 `content` 키가 또 있다. 정본은 `parts` 배열이다.
- 왜 `contents`가 맨 위에 있나, 아래에 있어야 하지 않나? → JSON 객체의 키 순서에는 의미가 없다. 순서가 의미를 갖는 것은 `contents`와 `parts` 배열 안이다. Gemini는 system을 별도 필드로 받고, OpenAI는 `messages` 배열 첫 원소로 받는다.
- 대화가 길어지면 `content`도 커지나? → 아니다. 새 행이 생긴다. `parts`는 그 행을 만들 때 한 턴 안에서만 늘어난다. 점점 커지는 것은 매 호출 다시 보내는 프롬프트다.
- 캐시 마커의 20은 무엇을 세는 단위인가? → 메시지가 아니라 콘텐츠 블록의 위치다.

### 1-2 저장소를 나누는 방법과 운영 구성

#### 개념

저장소를 나누는 층위가 세 개다.

| 층위 | 설정 위치 | 적용 범위 |
|---|---|---|
| 인스턴스 단위 | `new Mastra({ storage })` | 에이전트, 워크플로, 관측, 평가, 스케줄이 공유한다 |
| 에이전트 단위 | `new Memory({ storage })` | 그 에이전트의 memory 데이터만 덮어쓴다 |
| domain 단위 | `new MastraCompositeStore({ default, domains })` | domain마다 다른 DB로 보낸다 |

나누는 기준은 데이터가 쓰이고 읽히는 모양이다. `memory`는 호출마다 행을 읽고 쓰므로 트랜잭션 DB, `observability`는 대량으로 쓰고 집계해 읽으므로 전용 저장소나 OLAP, `workflows`는 재개 시점에 반드시 있어야 하므로 신뢰성 있는 영속 DB를 쓴다. `schedules`는 그 domain을 구현한 adapter여야 한다.

보관 기간은 기본이 무한이다. 줄이려면 `retention`을 선언하고 `prune()`을 직접 스케줄러에 걸어야 한다. Mastra는 대신 돌려 주지 않는다. 대상은 자동으로 쌓이는 표(대화 기록, 텔레메트리, 잡 기록, 스케줄 발화 이력)뿐이고, 사용자가 만든 것(에이전트, 스킬, 데이터셋, 스케줄 정의)은 명시적으로 지우는 대상이라 retention 키가 아니다.

#### 실습 결과

`src/mastra/storage.ts`에 `retention`을 선언했다. 판단이 갈린 지점은 표마다 달랐다.

| 표 | 값 | 이유 |
|---|---|---|
| `messages` | `'30d'` | 가장 빨리 쌓이고 행도 무겁다. 모델에 다시 실리는 것은 `lastMessages`가 고른 최근 몇 개뿐이다 |
| `threads` | `'90d'` | 기준 열이 `updatedAt`이 아니라 `createdAt`이다. 메시지와 같은 값으로 맞추면 오래전에 시작해 지금도 쓰는 대화가 통째로 사라진다 |
| `resources` | 선언하지 않음 | 사용자 수만큼만 늘어나 growth 표가 아니고, `createdAt` 기준이라 오래 쓴 사용자의 working memory가 먼저 지워진다 |

비활성 기준(`updatedAt`)으로 지워지는 것은 `threadState`와 `workflowSnapshot`뿐이다. 나머지는 나이 기준이다.

`npm run prune`으로 확인했다. 처음에는 모든 행이 이틀 전이라 0행이었고, `capture-1` 스레드의 메시지 `createdAt`을 2025-01-01로 바꾼 뒤 다시 돌리니 2행이 지워졌다.

```
memory / mastra_messages: 2행 삭제
memory / mastra_threads:  0행 삭제
```

- 메시지만 지워지고 스레드는 남아 제목만 있는 고아 스레드가 생겼다. 표 사이에 FK가 없어 프레임워크가 정합성을 맞춰 주지 않는다. 목록 화면에서 어떻게 보여 줄지는 애플리케이션이 정해야 한다.
- 파일 크기는 그대로다(1,286,144바이트). `prune()`은 행만 지우고 디스크 반환은 하지 않는다. 빈 페이지를 이후 쓰기가 재사용할 뿐이다.
- 결과는 표 단위 `PruneResult`(`domain`, `table`, `deleted`, `done`)로 돌아온다. `done: false`면 한도에 걸려 남은 행이 있다는 뜻이라 다시 호출해야 한다. 스케줄러에 걸 때는 이 값을 로그로 남겨야 한다.
- 기준 열 인덱스는 `init()`이 아니라 첫 `prune()` 때 지연 생성된다. retention을 쓰지 않는 배포가 인덱스 비용을 내지 않게 한 설계다.

#### clap-agent

`MastraCompositeStore`는 쓰지 않고 `PostgresStoreVNext` 하나에 모든 domain을 맡긴다(`src/mastra/index.ts:52`). 대신 `observability`만 별도 커넥션 풀을 받는다(`src/mastra/storage.ts:11`). domain을 다른 DB로 보내기 전에 접속 자원만 먼저 갈라 둔 중간 형태다.

- 풀 상한 `PRIMARY_POOL_MAX = 10`, `OBSERVABILITY_POOL_MAX = 5`에 실측 근거가 주석으로 붙어 있다. dev RDS(`db.t4g.micro`)의 `max_connections` 79에 맞춘 예산이고, 기본값(풀당 20, 태스크당 40)은 배포 중 구·신 태스크가 겹치면 한도를 넘는다.
- `partitioning: 'native'`를 고정한다. 지정하지 않으면 TimescaleDB·`pg_partman` 자동 감지가 partman 설정을 건드릴 수 있다. v-next PostgreSQL의 observability는 일 단위 파티션 표를 쓰고, 그 구성에서 `prune()`은 행을 지우는 대신 하루치 파티션을 드롭한다.
- 접속 정보 해석(`config.ts:173`)과 생성자 인자 조립(`storage.ts:11`)을 분리했다. 스토리지를 띄우지 않고 풀 예산을 테스트하기 위해서다. `DB_PORT`에 5432 기본값을 두지 않고 없으면 부팅을 실패시키는 것도 같은 성격의 판단이다.
- `retention`과 `prune(` 사용처는 없다. 지금은 무한 보관이고, observability 파티션이 나중에 정리 작업을 붙일 자리다.

#### 헷갈렸던 지점

- 호출이 실패해도 스레드 행이 남나? → 남았다. 할당량으로 실패한 호출의 `capture-2` 스레드가 메시지 0개로 남아 있다. 다만 `capture-1`은 스레드 `createdAt`이 메시지보다 늦어서, 스레드 행이 언제 기록되는지는 이 관찰만으로 단정할 수 없다. 소스 확인은 하지 않고 넘어갔다.

## 2. Develop

원문: https://mastra.ai/docs/develop

| 소제목 | 처리 |
|---|---|
| Run Mastra locally | 다룸 (2-1, 짧게). dev 서버가 어디서 도는지 8회차에서 미뤄 둔 확인을 여기서 끝낸다 |
| Project structure | 다룸 (2-1, 짧게) |
| Build with AI | 건너뜀. 편집기 연동 안내다 |
| File-based agents | 건너뜀. 실험 기능이다 |

### 2-1 로컬 실행과 프로젝트 구조

#### 개념

`mastra dev` 한 명령이 개발 서버(기본 포트 4111), Studio UI, 파일 감시를 함께 올린다. `src/mastra/` 아래가 바뀌면 서버가 자동으로 다시 시작되고, `http://localhost:4111/api`에서 지금 노출된 엔드포인트를 볼 수 있다.

구조 권고는 단순하다. 프레임워크 코드를 `src/mastra/` 아래 두고 primitive마다 폴더를 나누며 `index.ts`를 등록의 중심으로 삼는다. 우리 프로젝트는 여기에 `constants.ts`, `models.ts`, `storage.ts`, `processors/`를 더했다. 문서 규칙이 아니라 우리가 정한 관례다.

#### 실습 결과

8회차에서 미뤄 둔 "dev 서버가 어디서 도는가"를 실측했다.

| 확인 항목 | 값 |
|---|---|
| 서버 프로세스 작업 디렉터리 | `src/mastra/public` |
| `MASTRA_PROJECT_ROOT` | `<프로젝트 루트>/.mastra` |
| 서버가 연 DB (수정 전) | `.mastra/mastra.db` (4,096바이트, 비어 있음) |
| 스크립트가 연 DB | `mastra.db` (1,286,144바이트, 실습 데이터 전부) |

`MASTRA_PROJECT_ROOT`가 가리키는 곳은 프로젝트 루트가 아니라 빌드 산출물 디렉터리인 `.mastra`였다. CLI가 `MASTRA_PROJECT_ROOT: resolve(dotMastraPath)`로 심기 때문이다(`node_modules/mastra/dist/index.js`). 8회차 주석은 작업 디렉터리 부분은 맞았지만 이 환경 변수의 값은 잘못 알고 있었고, 그래서 Studio와 스크립트가 여전히 다른 파일을 열고 있었다.

상대 경로로 되돌리는 것은 해법이 아니다. Mastra는 `file:` 상대 경로를 어디로도 재매핑하지 않는다. `MASTRA_PROJECT_ROOT`를 읽는 코드가 `@mastra/libsql`에는 없다. 상대 경로를 쓰면 dev 서버는 `src/mastra/public`에, 스크립트는 프로젝트 루트에 각각 파일을 만든다.

`src/mastra/storage.ts`에서 값이 `.mastra`로 끝나면 한 단계 올리도록 고쳤다. 재시작 뒤 서버가 루트의 `mastra.db`를 여는 것을 `lsof`로 확인했다.

#### clap-agent

구조는 문서 권고를 따르되 운영에서 필요한 폴더(`auth/`, `server/`, `observability/`, `lib/`, `evals/`)가 더 붙어 있고, 테스트를 같은 폴더에 둔다(`storage.ts` 옆 `storage.test.ts`).

`mastra dev`를 그대로 쓰지 않는다. `dev`와 `build` 앞단에 `node scripts/patch-mastra-studio.mjs`가 붙는다. Studio 실험 화면이 목록을 파라미터 없이 조회해 서버 기본값 `perPage=10`에 잘리는 업스트림 버그를 우회하기 위해서다(dev 실험 193건). `pnpm patch` 대신 치환 스크립트를 택한 이유는 미니파이된 933KB 단일 라인 diff가 리뷰 불가능하기 때문이고, 대신 치환 규칙을 코드로 남겼다. 번들이 하나가 아니면 예외를 던지고, 제거 조건(ISSUE #412)을 파일 첫 줄에 적어 두었다.

두 사례의 공통 원인은 같다. `mastra dev`가 소스를 그대로 실행하지 않고 번들을 만들어 돌리기 때문에 경로가 어긋나고, 패치 대상도 소스가 아니라 `node_modules`의 산출물이 된다.

#### 헷갈렸던 지점

- 이게 중요한 문제인가? → 실습 결과에는 영향이 없었다. 확인을 전부 스크립트와 `sqlite3`로 했기 때문이다. Studio로 볼 때만 빈 DB가 보였다.
- 기본값 경로에 맞추면 되지 않나? → 기본값도 통일해 주지 않는다. 문서 예시가 상대 경로(`file:./storage.db`)인데 Mastra가 이를 재매핑하지 않아서, 두 프로세스를 맞추려면 어차피 경로를 우리가 정해야 한다.

## 3. Server

원문: https://mastra.ai/docs/server/server-adapters

| 페이지 | 처리 |
|---|---|
| Request Context | 다룸 (3-1). 요청마다 다른 값을 도구까지 내려보내는 통로다 |
| Middleware | 다룸 (3-2). 요청 헤더를 읽어 Request Context를 채우는 자리다 |
| Custom API Routes | 다룸 (3-3). 기본 REST 말고 직접 만든 엔드포인트 |
| Server Adapters | 건너뜀. 기존 Express·Hono 앱에 Mastra를 얹는 방식이고, clap-agent는 mastra 서버를 그대로 쓴다 |
| Mastra Client | 건너뜀. 프론트엔드용 TypeScript SDK다 |
| Custom Adapters | 건너뜀. 어댑터를 직접 만들 일이 없다 |
| PubSub | 건너뜀. 분산 실행용이다 |
| Studio Deployment | 건너뜀. Studio 화면을 외부에 공개 배포하는 방법이다 |

### 3-1 Request Context

#### 개념

`RequestContext`는 요청 하나 동안만 살아 있는 키-값 저장소다. `Map`처럼 생긴 클래스이고 요청이 끝나면 버려진다. DB에 저장되지 않고 그 자체가 LLM으로 전송되지도 않는다.

요청마다 달라지는 값은 세 통로로 나뉜다. 갈리는 기준은 **누가 그 값을 정하느냐**다.

| 값 | 통로 | 정하는 주체 |
|---|---|---|
| 사용자 메시지 | `messages` | 사용자 |
| 도구 인자 | 도구 `inputSchema` | 모델 |
| 로그인 사용자, 세션 쿠키, 로케일, 실험 변형 | `requestContext` | 서버 코드 |

판단 기준은 한 질문으로 줄어든다. 이 값을 모델이 마음대로 바꿔도 괜찮은가. 괜찮으면 `inputSchema`, 안 되면 `requestContext`다.

읽는 자리는 에이전트 설정(`instructions`, `model`, `tools`, `memory`를 함수로 주면 인자로 받는다), 도구의 `execute` 두 번째 인자, 워크플로 스텝이다.

Mastra가 서버에서 직접 읽는 예약 키가 셋 있다. `MASTRA_RESOURCE_ID_KEY`, `MASTRA_THREAD_ID_KEY`, `MASTRA_MESSAGE_AUTHOR_KEY`다. 클라이언트가 보낸 값보다 우선하고, 소유자가 아닌 스레드에 접근하면 서버가 403을 돌려준다. 가장 쉬운 채우는 방법은 auth 설정의 `mapUserToResourceId`다.

`requestContextSchema`를 선언하면 실행 전에 검증한다. 실패했을 때의 동작이 계층마다 다르다.

| 계층 | 검증 시점 | 실패 시 |
|---|---|---|
| 에이전트 | `generate()`·`stream()` 시작 | `MastraError`를 던진다 (LLM 호출 전) |
| 도구 | `execute()` 직전 | 예외 대신 에러 객체를 반환한다 |
| 워크플로 | `run.start()` 시작 | 예외를 던진다 |

도구만 예외를 던지지 않는 이유는 도구 호출이 에이전트 루프 안에서 일어나기 때문이다. 예외를 던지면 대화가 끊기지만, 에러를 결과로 돌려주면 모델이 읽고 다음 행동을 정할 수 있다.

#### 실습 결과

할 일 에이전트를 소유자별로 나눴다. 호출은 하지 않고 골격과 검증까지만 했다.

| 파일 | 한 일 |
|---|---|
| `src/mastra/constants.ts` | 컨텍스트 키 상수 `ownerId`, `tone` 추가 |
| `src/mastra/agents/todo-agent.context.ts` | 에이전트와 도구가 공유하는 `requestContextSchema`와 `ownerIdOf` 헬퍼 |
| `src/mastra/todo/todo-store.ts` | 저장소를 소유자별 `Map`으로 변경 |
| `src/mastra/tools/*.ts` | 세 도구에 `requestContextSchema`를 달고 `execute`에서 소유자를 읽음 |
| `src/mastra/agents/todo-agent.prompt.ts` | `instructions`를 함수로 바꿔 소유자와 말투를 반영 |
| `scripts/call-with-context.ts` | 두 사용자로 번갈아 호출하는 스크립트 |

핵심은 소유자를 도구의 `inputSchema`에 넣지 않았다는 점이다. 모델이 정할 수 있는 값은 할 일 제목뿐이고, 누구의 목록인지는 `requestContext`만 정한다.

`requestContextSchema`를 달았더니 `requestContext.get(OWNER_ID_CONTEXT_KEY)`가 `string`으로 추론되어 캐스팅이 필요 없었다. 타입 검사와 biome 모두 통과했다.

말투 지시는 금지 항목까지 적었다. "반말로 해"만 적으면 모델이 인사말과 이모지를 함께 붙이는 쪽으로 기운다.

#### clap-agent

- 미들웨어는 주입만 하고 검증은 `auth`가 맡는다(`server/clap-session-cookie.ts`). `path: '*'`를 명시한 이유는 베어 함수 등록 시 core(`/api/*`)와 deployer(`'*'`)의 정규화가 어긋나 특정 경로 커버리지가 버전에 좌우되기 때문이다.
- 인증이 `mapUserToResourceId`로 `MASTRA_RESOURCE_ID_KEY`를 채우고(`auth/clap-session-auth.ts:74`), 스레드 목록·상세·메시지·삭제와 메시지 피드백 라우트가 그 값으로 소유권을 다시 확인한다.
- 도구의 `requestContextSchema`에는 `userEmail` 하나만 둔다. `user`, `clapSessionCookie`, `reviewGroupId`, `agentContext`는 스키마에 넣지 않고 런타임에서만 읽는다. Studio에서 사람이 채울 값만 노출하고 미들웨어가 주입하는 인프라 값은 감추려는 구분이다. 타입은 `ClapRequestContextValues` 인터페이스로 따로 선언한다.
- 인증 수단 결정을 `resolveClapAuth` 한 함수에 모았다. 우선순위는 `userEmail` 명시(비운영 전용) → 세션 쿠키 → 인증 사용자 이메일이고, 운영에서는 `isProdRuntime` 가드로 대행 경로가 닫힌다. 모든 도구가 이 함수를 지나므로 진단 로그의 단일 지점으로도 쓴다. 실험 실행은 서버 미들웨어를 타지 않아 미들웨어에 로그를 걸면 관측되지 않기 때문이다.

#### 헷갈렸던 지점

- Request Context가 정확히 뭔가? → 요청 하나 동안만 사는 `Map` 같은 객체다. 요청이 끝나면 사라지고 저장되지 않는다.
- 요청마다 달라질 수 있는 값을 넣는 건가? → 조건이 하나 더 붙는다. 요청마다 달라지면서 **모델이 아니라 코드가 정하는** 값이다. 사용자 메시지와 도구 인자도 요청마다 다르지만 통로가 다르다.

### 3-2 Middleware

#### 개념

미들웨어는 Hono의 `Context`와 `next`를 받는 함수다. `next()`를 부르면 다음 미들웨어나 라우트 핸들러로 넘어가고, `Response`를 반환하면 거기서 요청이 끝난다. 등록 방법은 `{ path, handler }` 객체, 함수만 넘기는 전역 등록, `registerApiRoute`의 `middleware` 옵션 세 가지다.

제약이 둘 있다.

| 제약 | 내용 |
|---|---|
| Hono 전용 | `mastra dev`·`mastra build`와 Hono 계열 어댑터에서만 돈다. Express·Fastify·Koa 어댑터에서는 시작 시 경고만 남고 실행되지 않는다 |
| 공개 라우트 제외 | `requiresAuth: false` 라우트에는 사용자 미들웨어가 돌지 않는다. Studio 로그인처럼 프레임워크가 열어 둬야 하는 경로를 막지 못하게 한 것이다 |

쓰임새는 네 가지다. 내장 라우트 차단(`next()`를 부르지 않고 404 반환), `RequestContext` 주입, 인증과 인가, CORS와 요청 로깅이다.

사용자 격리는 미들웨어보다 `auth.mapUserToResourceId`가 기본이다. 설정하면 서버가 스레드 목록을 거르고, 다른 resource의 스레드에 403을 돌려주며, 생성 시 resource를 강제한다. 매퍼가 빈 문자열이나 비문자열을 돌려주거나 예외를 던지면 라우트 실행 전에 500으로 거부된다.

#### 실습 결과

**막기 전 상태를 먼저 확인했다.** 인증 없이 `resourceId`만 넘겨도 스레드 목록이 그대로 나왔다.

```
GET /api/memory/threads?resourceId=user-1        → 200, 스레드 4개
GET /api/memory/threads/todo-1/messages          → 200, 메시지 본문 전부
```

`src/mastra/server/middleware.ts`를 만들어 요청 로거와 라우트 차단 구조를 넣고 `src/mastra/index.ts`에 등록했다. 차단 목록에 `'/api/memory/*'`를 넣자 두 요청 모두 404가 되었고, `/api/agents`는 200 그대로였다.

| 확인한 것 | 결과 |
|---|---|
| 와일드카드 범위 | 그룹 자체와 하위 경로를 함께 막는다 |
| 로거와 차단의 순서 | 로거가 앞에 있어 404가 된 요청도 로그에 남는다 |
| 미들웨어가 타는 범위 | `path: '*'`는 dev 서버 내부 라우트(`POST /__refresh`)까지 포함한다 |

`console.log`는 쓸 수 없었다. biome 설정이 `suspicious.noConsole: error`이고 예외가 `scripts/**`와 `src/mastra/evals/**`뿐이다. `context.get('mastra').getLogger()`로 바꿨고, 그러려면 핸들러 인자 타입을 `ContextWithMastra`로 명시해야 `context.get('mastra')`가 타입으로 잡힌다.

Mastra에 요청 로깅 설정 타입(`HttpLoggingConfig`: 활성화, 레벨, 제외 경로, 헤더 마스킹)이 있지만 `ServerConfig`가 받는 필드에는 없다. 어댑터 내부의 `protected httpLoggingConfig`로만 존재해서(`@mastra/server/dist/server/server-adapter/index.d.ts:153`) `mastra dev` 경로에서는 설정할 수 없다. 미들웨어로 직접 남기는 것이 현재 방법이다.

확인 뒤 차단 목록은 비웠다. Studio의 대화 목록도 같은 라우트를 쓰기 때문이고, 사용자 격리는 `auth.mapUserToResourceId`로 푸는 것이 문서 권고다.

#### clap-agent

- 배열 조립을 `buildServerMiddleware()`로 분리했다(`src/mastra/server/middleware.ts:9`). Mastra 인스턴스를 띄우지 않고 등록 순서만 테스트하기 위해서다.
- 순서가 계약이다. 세션 쿠키 주입 → review-chat 순서가 뒤집히면 review-chat이 쿠키 없이 clap API를 불러 매 요청이 401이 된다. `index.test.ts:31`이 이 순서를 검증하고, 깨졌을 때 무엇이 망가지는지를 주석으로 적어 두었다.
- 그 테스트는 핸들러 참조가 아니라 `path` 문자열로 미들웨어를 찾는다. 팩토리가 호출마다 새 클로저를 만들어 참조 동일성이 없기 때문이다.
- 세션 쿠키 미들웨어는 설정이 있을 때만 배열에 들어간다. 로컬은 인증 없이 돌고 배포 환경은 설정 단계에서 부팅을 실패시킨다.
- 세 번째 미들웨어(`connectedProvidersOnly`)는 요청을 막는 대신 Studio가 받는 모델 목록을 걸러 낸다. 차단·주입 말고 응답 가공이라는 세 번째 쓰임새다.

#### 헷갈렸던 지점

- 라우트가 뭔가? → HTTP 메서드와 URL 경로 한 쌍, 그리고 그 요청을 처리하는 함수다. Spring의 `@GetMapping` 메서드 하나에 해당한다. Mastra는 에이전트를 등록하면 `/api/agents/:agentId/generate` 같은 라우트를 자동으로 만들어 준다.
- 라우트 그룹은? → 경로 앞부분이 같은 묶음이다. 미들웨어의 `path` 패턴이 겨냥하는 단위다.

### 3-3 Custom API Routes

#### 개념

내장 라우트는 에이전트와 워크플로를 실행하는 통로다. 화면이 필요로 하는 것(도메인 정보를 붙인 목록, 피드백 저장, 헬스체크, 웹훅)은 직접 만든다. 만든 라우트는 `server.apiRoutes` 배열에 넣고, 경로는 서버 루트 기준이라 `/api` 접두사가 붙지 않는다.

정의 방식이 둘이다.

| | `registerApiRoute` (Hono 라우트) | `createRoute` (스키마 라우트) |
|---|---|---|
| 출처 | `@mastra/core/server` | `@mastra/server/server-adapter` |
| 입력 검증 | 직접 작성 | `pathParamSchema`·`queryParamSchema`·`bodySchema`로 자동, 실패 시 400 |
| 핸들러 인자 | Hono `Context` | 검증된 값 + `mastra`, `requestContext` |
| 응답 | `Response`를 직접 만든다. 헤더·상태·HTML 자유 | 값을 반환하면 직렬화된다. `responseType`은 `json`·`stream`·`datastream-response`·`mcp-*` |
| 라우트 단위 미들웨어·CORS | 지원 | **미지원** (`@mastra/core/dist/server/types.d.ts:75`) |
| OpenAPI | 손으로 적는다 | zod에서 자동 생성 |
| 권한 | 직접 검사 | 경로와 메서드에서 파생(`GET /todos/…` → `todos:read`), `requiresPermission`·`createPublicRoute()`로 조정 |

인증을 설정하면 커스텀 라우트도 기본으로 인증이 필요해지고, `requiresAuth: false`로만 빠져나온다. 다만 공개 라우트에는 사용자 미들웨어가 돌지 않으므로, 미들웨어에 걸어 둔 로깅이나 컨텍스트 주입이 그 라우트에서는 실행되지 않는다.

#### 실습 결과

`GET /todos/summary?ownerId=…`로 소유자별 할 일 요약을 돌려주는 라우트를 만들었다. 처음에는 `registerApiRoute` + `safeParse` + 손으로 쓴 `openapi` 블록(43줄)이었고, 뒤에 `createRoute`로 다시 썼다(31줄).

| 호출 | 결과 |
|---|---|
| `GET /todos/summary?ownerId=user-a` | 200, `{"ownerId":"user-a","total":0,"done":0,"open":0}` |
| `GET /todos/summary` | 400, `{"error":"Invalid query parameters","issues":[{"field":"ownerId","message":"…"}]}` |
| `GET /api/openapi.json` | `paths`에 `/todos/summary`와 응답 JSON Schema가 실림 |

- 경로에 `/api`가 없다. 3-2에서 만든 `/api/*` 차단 패턴이 커스텀 라우트에는 닿지 않는다.
- 전역 미들웨어(`path: '*'`)는 그대로 탄다. 로거 패턴을 `'/api/*'`로 좁혔다면 이 라우트 요청은 로그에 남지 않았을 것이다.
- `total`이 0인 이유는 `todo-store`가 프로세스 메모리이기 때문이다. dev 서버와 스크립트는 다른 프로세스라 할 일이 공유되지 않는다. 대화는 DB에 저장되지만 할 일은 아니다.
- `createRoute`를 쓰려면 `@mastra/server`를 직접 의존해야 한다. 전이 의존(`mastra` → `@mastra/deployer` → `@mastra/server`)으로 설치돼 있어 그냥 import해도 당장은 동작하지만, 설치 구조나 CLI 버전이 바뀌면 모듈을 찾지 못한다. `1.65.0`으로 고정해 `dependencies`에 넣었다. peer 조건은 `@mastra/core >=1.50 <2`다.
- `responseSchema`는 문서와 타입용이고 응답을 런타임에 검증하지는 않는다. 빌드 산출물에서 이 스키마는 OpenAPI 생성과 설정 전달에만 쓰이고 `parse` 호출은 없다. 내부 필드 유출을 막으려면 반환 직전에 직접 `parse`해야 한다.

#### clap-agent

라우트를 파일 하나에 하나씩 두고 그룹 배열(`REVIEW_ROUTES`, `ADMIN_ROUTES`)로 묶은 뒤 `buildApiRoutes()`가 합친다. 정의는 전부 `registerApiRoute`이고 `createRoute` 사용처는 0건이다.

- zod 스키마를 **응답 쪽에** 둔다. 검증 자동화보다 유출 차단이 목적이다. 저장 행의 `resourceId`·`metadata`·도구 원문이 응답에 섞이지 않도록 선언되지 않은 키를 제거한다(`review-thread-item.ts:9`, `review-thread-messages.ts:21`).
- 목록 라우트는 DB 단 `metadata` 필터로 거른다. 애플리케이션에서 후필터하면 `total`·`hasMore`가 틀어지기 때문이다. 필터를 통과해도 `threadId` 접두사로 한 번 더 확인한다. metadata는 오염될 수 있고 정본은 id다.
- 빈 문자열 함정을 주석으로 남겼다. truthiness로 좁히면 빈 문자열이 "필터 없음"이 되어 전체가 나간다.
- 어드민 라우트는 `registerAdminRoute()`로만 등록한다. 등록 함수가 권한 게이트(403)를 핸들러 앞에 자동으로 끼워, 개별 핸들러가 검사를 빠뜨릴 여지를 없앴다.
- 커스텀 라우트라 `@mastra/server`의 `enforceThreadAccess`를 타지 않으므로 소유자 검증을 직접 한다. 기본 구현이 `resourceId` 없는 행에서 검증을 건너뛰는(fail-open) 점을 의도적으로 다르게 구현했다(`thread-owner-validator.ts:8`).

지금 구조에서 `createRoute`로 옮길 수 없는 것은 HTML을 렌더링하는 어드민 라우트뿐이다(`responseType`에 html이 없다). 나머지는 옮길 수 있지만 에러 응답이 평문에서 JSON으로 바뀌어 클라이언트 계약이 달라진다. 라우트 단위 미들웨어는 한 곳도 쓰지 않아 스키마 라우트의 그 제약은 걸림돌이 아니다.

#### 헷갈렸던 지점

- `createRoute`를 그냥 쓰면 안 되나, 의존하는 게 뭐가 문제인가? → 의존 자체가 아니라 선언하지 않고 쓰는 것이 문제다. `package.json`에 없으면 버전을 고정할 수 없고, 설치 구조가 바뀌면 빌드나 런타임에서 터진다. 선언하면 된다.
- `createRoute`가 무조건 더 나은가? → 아니다. 스키마 라우트는 라우트 단위 미들웨어와 CORS를 지원하지 않고, 응답도 정해진 형식만 돌려준다. HTML이나 커스텀 헤더가 필요하면 `registerApiRoute`를 쓴다.
