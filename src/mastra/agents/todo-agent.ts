import { Agent } from '@mastra/core/agent';
import { TODO_AGENT_ID } from '../constants';
import { MODELS } from '../models';
import { inputNormalizer } from '../processors/input-normalizer';
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
  inputProcessors: [inputNormalizer],
  outputProcessors: [outputFilter],
});
