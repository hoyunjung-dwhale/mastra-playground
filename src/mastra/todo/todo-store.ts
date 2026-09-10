import type { Todo } from './todo.schema';

// 프로세스 메모리에만 있다. mastra dev가 파일 변경으로 다시 읽으면 비워진다.
const todos: Todo[] = [];
let nextId = 1;

export function addTodo(title: string): Todo {
  const todo: Todo = { id: nextId++, title, done: false };
  todos.push(todo);
  return todo;
}

export function listTodos(done?: boolean): Todo[] {
  if (done === undefined) {
    return [...todos];
  }
  return todos.filter((todo) => todo.done === done);
}
