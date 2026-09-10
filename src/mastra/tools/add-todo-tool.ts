import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { todoSchema } from '../todo/todo.schema';
import { addTodo } from '../todo/todo-store';

export const addTodoTool = createTool({
  id: 'add-todo',
  // TODO: 모델이 언제 이 도구를 쓸지 판단하는 근거다. 어떤 요청에 쓰는지 한두 문장으로 적는다.
  description: '',
  inputSchema: z.object({
    // TODO: 모델이 이 값을 어떻게 채워야 하는지 적는다. (예: 사용자가 말한 할 일 내용 그대로)
    title: z.string().min(1).describe(''),
  }),
  outputSchema: todoSchema,
  execute: async ({ title }) => addTodo(title),
});
