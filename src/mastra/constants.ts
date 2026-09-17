export const TODO_AGENT_KEY = 'todoAgent';
export const TODO_AGENT_ID = 'todo-agent';

// requestContext 키. 주입 측(스크립트·미들웨어)과 조회 측(에이전트·도구)이 상수를 공유해야
// 키 이름이 어긋나도 조용히 undefined가 되는 일을 막는다.
export const OWNER_ID_CONTEXT_KEY = 'ownerId';
export const TONE_CONTEXT_KEY = 'tone';
