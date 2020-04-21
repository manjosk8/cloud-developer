import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'
import { generateUploadUrl } from '../../businessLogic/todos'

import { createLogger } from '../../utils/logger'
const logger = createLogger('url')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId

  let statusCode
  let response
  try {
    const uploadUrl = await generateUploadUrl(todoId, userId);

    statusCode = 200
    response = { uploadUrl }
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