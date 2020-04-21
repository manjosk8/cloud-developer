import * as uuid from 'uuid'

import { TodoAccess } from '../dataLayer/todosAccess'
import { TodoQueryItem } from '../models/TodoQueryItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodoAccess()

async function verifyTodoAccess(todoId: string, userId: string) {
    const todoExists = await todoAccess.todoExists(todoId, userId);
    if (!todoExists) {
        throw new Error(`Todo item ${todoId} does not exist for your user`);
    }
}

export async function getTodosPerUser(userId: string): Promise<TodoQueryItem[]> {
    const todos = await todoAccess.getTodosPerUser(userId)
    return todos
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
): Promise<TodoQueryItem> {

    const todoId = uuid.v4()

    return await todoAccess.createTodo({
        userId,
        todoId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false
    })
}

export async function updateTodo(
    todoId: string,
    updateTodoRequest: UpdateTodoRequest,
    userId: string
): Promise<void> {
    await verifyTodoAccess(todoId, userId);
    await todoAccess.updateTodo(todoId, updateTodoRequest);
}

export async function deleteTodo(
    todoId: string,
    userId: string
): Promise<void> {
    await verifyTodoAccess(todoId, userId);
    await todoAccess.deleteTodo(todoId);
}

export async function generateUploadUrl(
    todoId: string,
    userId: string
): Promise<string> {
    await verifyTodoAccess(todoId, userId);
    const uploadUrl = await todoAccess.getUploadUrl(todoId);
    return uploadUrl;
}