import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'

import { createLogger } from '../../utils/logger'
const logger = createLogger('delete')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId

  let statusCode
  let response
  try {
    await deleteTodo(todoId, userId)

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
