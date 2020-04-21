import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'

import { createLogger } from '../../utils/logger'
const logger = createLogger('create')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)

  let statusCode
  let response
  try {
    const newItem = await createTodo(newTodo, userId);
    
    statusCode = 201
    response = { item: newItem }
  } catch (e) {
    logger.error(e)

    statusCode = 400
    response = { error: e.message }
  }

  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(response)
  }
}
