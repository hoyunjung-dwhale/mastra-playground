import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { todoSchema } from '../todo/todo.schema';
import { completeTodo } from '../todo/todo-store';

// 없는 id로 호출했을 때 예외 대신 결과로 돌려준다. 예외 원문 대신 다음 행동을 지시해야
// 모델이 같은 인자로 재시도하지 않고 목록을 다시 조회해 복구한다.
const todoNotFoundSchema = z.object({
  error: z.literal(true),
  guidance: z.string(),
});

export const completeTodoTool = createTool({
  id: 'complete-todo',
  description:
    '할 일 하나를 완료 상태로 바꾼다. 사용자가 특정 할 일을 끝냈다·완료했다고 말하면 호출한다. ' +
    'id를 모르면 먼저 listTodosTool로 목록을 조회해 id를 확인한 뒤 호출한다.',
  inputSchema: z.object({
    id: z.number().int().positive().describe('완료 처리할 할 일의 id. listTodosTool 결과의 id 값'),
  }),
  outputSchema: z.union([todoNotFoundSchema, todoSchema]),
  execute: async ({ id }) => {
    const todo = completeTodo(id);
    if (!todo) {
      return {
        error: true as const,
        guidance: `id가 ${id}인 할 일이 없다. 같은 id로 재시도하지 말고 listTodosTool로 목록을 조회해 실제 id로 다시 호출하라.`,
      };
    }
    return todo;
  },
});
