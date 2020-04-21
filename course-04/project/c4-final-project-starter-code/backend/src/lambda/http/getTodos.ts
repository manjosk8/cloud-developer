import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { getTodosPerUser } from '../../businessLogic/todos'
import { getUserId } from '../utils'

import { createLogger } from '../../utils/logger'
const logger = createLogger('read')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const userId = getUserId(event)

  let statusCode
  let response
  try {
    const todos = await getTodosPerUser(userId)

    statusCode = 200
    response = { items: todos }
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
