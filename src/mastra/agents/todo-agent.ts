import { Agent } from '@mastra/core/agent';
import { TODO_AGENT_ID } from '../constants';
import { MODELS } from '../models';
import { inputModeration, unicodeNormalizer } from '../processors/guardrails';
import { outputFilter } from '../processors/output-filter';
import { addTodoTool } from '../tools/add-todo-tool';
import { completeTodoTool } from '../tools/complete-todo-tool';
import { listTodosTool } from '../tools/list-todos-tool';
import { todoAgentInstructions } from './todo-agent.prompt';

export const todoAgent = new Agent({
  id: TODO_AGENT_ID,
  name: 'Todo Agent',
  instructions: todoAgentInstructions,
  model: MODELS.GOOGLE_FLASH,
  tools: { addTodoTool, listTodosTool, completeTodoTool },
  // 정규화가 먼저 돌아야 모더레이션이 정리된 텍스트를 본다.
  inputProcessors: [unicodeNormalizer, inputModeration],
  outputProcessors: [outputFilter],
});
