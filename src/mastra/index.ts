import { Mastra } from '@mastra/core/mastra';
import { todoAgent } from './agents/todo-agent';
import { TODO_AGENT_KEY } from './constants';
import { storage } from './storage';

export const mastra = new Mastra({
  agents: { [TODO_AGENT_KEY]: todoAgent },
  storage,
});
