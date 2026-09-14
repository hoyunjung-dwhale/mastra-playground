import path from 'node:path';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';

// mastra dev는 서버를 src/mastra/public에서 실행하고(MASTRA_PROJECT_ROOT로 루트를 알려 준다)
// npm run call은 프로젝트 루트에서 실행하므로, 상대 경로 file:./mastra.db 를 쓰면 두 프로세스가
// 서로 다른 파일을 연다. 루트 기준 절대 경로로 만들어 Studio와 스크립트가 같은 DB를 보게 한다.
const projectRoot = process.env.MASTRA_PROJECT_ROOT ?? process.cwd();
const localFileUrl = `file:${path.join(projectRoot, 'mastra.db')}`;

// 비워 두면 로컬 파일, 원격 libSQL(Turso)이면 .env의 DATABASE_URL로 바꾼다.
const url = process.env.DATABASE_URL || localFileUrl;

export const storage = new LibSQLStore({
  id: 'mastra-storage',
  url,
});

// semantic recall의 임베딩 저장소. storage와 달리 Mastra 인스턴스가 물려주지 않아
// Memory 생성자에 직접 넘겨야 한다. libSQL은 같은 파일에 벡터 테이블을 둔다.
export const vector = new LibSQLVector({
  id: 'mastra-vector',
  url,
});
