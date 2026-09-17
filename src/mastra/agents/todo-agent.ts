import { Agent } from '@mastra/core/agent';
import { OWNER_ID_CONTEXT_KEY, TODO_AGENT_ID, TONE_CONTEXT_KEY } from '../constants';
import { MODELS } from '../models';
import { inputModeration, unicodeNormalizer } from '../processors/guardrails';
import { outputFilter } from '../processors/output-filter';
import { addTodoTool } from '../tools/add-todo-tool';
import { completeTodoTool } from '../tools/complete-todo-tool';
import { listTodosTool } from '../tools/list-todos-tool';
import { todoAgentRequestContextSchema } from './todo-agent.context';
import { todoAgentMemory } from './todo-agent.memory';
import { buildTodoAgentInstructions } from './todo-agent.prompt';

export const todoAgent = new Agent({
  id: TODO_AGENT_ID,
  name: 'Todo Agent',
  // 값 대신 함수를 주면 요청마다 다시 만들어진다. requestContext가 바뀌면 프롬프트도 바뀐다.
  instructions: ({ requestContext }) =>
    buildTodoAgentInstructions(
      requestContext.get(OWNER_ID_CONTEXT_KEY),
      requestContext.get(TONE_CONTEXT_KEY),
    ),
  requestContextSchema: todoAgentRequestContextSchema,
  model: MODELS.GOOGLE_FLASH,
  tools: { addTodoTool, listTodosTool, completeTodoTool },
  // 정규화가 먼저 돌아야 모더레이션이 정리된 텍스트를 본다.
  inputProcessors: [unicodeNormalizer, inputModeration],
  outputProcessors: [outputFilter],
  memory: todoAgentMemory,
});
