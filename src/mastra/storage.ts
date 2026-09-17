import path from 'node:path';
import type { RetentionConfig } from '@mastra/core/storage';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';

// mastra dev는 서버를 src/mastra/public에서, npm run call은 프로젝트 루트에서 실행한다.
// 상대 경로 file:./mastra.db 를 쓰면 두 프로세스가 서로 다른 파일을 연다.
// dev에서 MASTRA_PROJECT_ROOT는 프로젝트 루트가 아니라 빌드 산출물 디렉터리(.mastra)를 가리키므로
// 한 단계 올린다. .mastra는 gitignore 대상이라 여기에 DB를 두면 산출물과 함께 사라진다.
const rawRoot = process.env.MASTRA_PROJECT_ROOT ?? process.cwd();
const projectRoot = path.basename(rawRoot) === '.mastra' ? path.dirname(rawRoot) : rawRoot;
const localFileUrl = `file:${path.join(projectRoot, 'mastra.db')}`;

// 비워 두면 로컬 파일, 원격 libSQL(Turso)이면 .env의 DATABASE_URL로 바꾼다.
const url = process.env.DATABASE_URL || localFileUrl;

// 선언하지 않은 표는 영원히 남는다. satisfies로 묶어 없는 domain·표 이름을 컴파일 때 잡는다.
// 대상 표: memory.messages, memory.threads, memory.resources (기준 열은 모두 createdAt)
// maxAge는 ms·s·m·h·d·w 접미사를 붙인 문자열이거나 밀리초 숫자다.
const retention = {
  memory: {
    // 가장 빨리 쌓이는 표다. 모델에 다시 실리는 것은 lastMessages가 고른 최근 몇 개뿐이라,
    // 그보다 오래된 메시지는 사용자가 지난 대화를 열어 볼 때만 쓰인다.
    messages: { maxAge: '30d' },
    // 기준 열이 updatedAt이 아니라 createdAt이다. 오래전에 시작해 지금도 쓰는 스레드도
    // 나이만으로 지워지므로, 메시지보다 여유를 두어 활성 대화가 먼저 사라지지 않게 한다.
    threads: { maxAge: '90d' },
    // resources는 선언하지 않는다. 사용자 수만큼만 늘어나 growth 표가 아니고, 기준 열이
    // createdAt이라 선언하면 오래된 사용자의 working memory가 활동과 무관하게 지워진다.
  },
} satisfies RetentionConfig;

export const storage = new LibSQLStore({
  id: 'mastra-storage',
  url,
  retention,
});

// semantic recall의 임베딩 저장소. storage와 달리 Mastra 인스턴스가 물려주지 않아
// Memory 생성자에 직접 넘겨야 한다. libSQL은 같은 파일에 벡터 테이블을 둔다.
export const vector = new LibSQLVector({
  id: 'mastra-vector',
  url,
});
