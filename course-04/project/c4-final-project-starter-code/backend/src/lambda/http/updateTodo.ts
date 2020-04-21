import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'

import { createLogger } from '../../utils/logger'
const logger = createLogger('update')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  let statusCode
  let response
  try {
    await updateTodo(todoId, updatedTodo, userId)

    statusCode = 200
    response = ''
  } catch (e) {
    logger.error(e)

    statusCode = 400
    response = JSON.stringify({ error: e.message })
  }
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: response
  }
}
