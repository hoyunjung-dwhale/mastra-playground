import type { Todo } from './todo.schema';

// 프로세스 메모리에만 있다. mastra dev가 파일 변경으로 다시 읽으면 비워진다.
// 소유자별로 나눠 둔다. 소유자는 모델이 아니라 requestContext가 정한다.
const todosByOwner = new Map<string, Todo[]>();
let nextId = 1;

function todosOf(ownerId: string): Todo[] {
  const todos = todosByOwner.get(ownerId);
  if (todos) {
    return todos;
  }
  const created: Todo[] = [];
  todosByOwner.set(ownerId, created);
  return created;
}

export function addTodo(ownerId: string, title: string): Todo {
  const todo: Todo = { id: nextId++, title, done: false };
  todosOf(ownerId).push(todo);
  return todo;
}

export function listTodos(ownerId: string, done?: boolean): Todo[] {
  const todos = todosOf(ownerId);
  if (done === undefined) {
    return [...todos];
  }
  return todos.filter((todo) => todo.done === done);
}

export function completeTodo(ownerId: string, id: number): Todo | undefined {
  const todo = todosOf(ownerId).find((item) => item.id === id);
  if (!todo) {
    return undefined;
  }
  todo.done = true;
  return todo;
}
