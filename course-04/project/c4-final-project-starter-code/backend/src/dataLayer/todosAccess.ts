import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodoQueryItem } from '../models/TodoQueryItem'

import { createLogger } from '../utils/logger'
const logger = createLogger('db')

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly s3 = new XAWS.S3({
            signatureVersion: 'v4'
        }),
        private readonly userIdIndex = process.env.USER_ID_INDEX,
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly bucketName = process.env.IMAGES_S3_BUCKET,
        private readonly urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION, 10)) {
    }

    async todoExists(todoId: string, userId: string): Promise<boolean> {
        logger.info(`Verify if todo exits ${todoId} for user ${userId}`)

        //Get todo by todoId
        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: {
                todoId
            }
        }).promise()
        
        //Check if todo exists
        let todoExists = !!result.Item;
        if (!todoExists) {
            return false;
        }

        //Check if the user matches
        const todoItem = result.Item as TodoItem;
        todoExists = todoItem.userId === userId;

        return todoExists;
    }

    async getTodosPerUser(userId: string): Promise<TodoQueryItem[]> {
        logger.info(`Getting all todo items for user ${userId}`)

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ProjectionExpression: 'todoId, createdAt, #nam, dueDate, done, attachmentUrl',
            ExpressionAttributeNames: {
                '#nam': 'name'
            },
            ScanIndexForward: true
        }).promise()
        logger.info(result)
        return result.Items as TodoQueryItem[]
    }

    async createTodo(todoItem: TodoItem): Promise<TodoQueryItem> {
        logger.info(`Creating todo item ${todoItem.todoId}`)

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()

        const result: TodoQueryItem = {
            todoId: todoItem.todoId,
            createdAt: todoItem.createdAt,
            name: todoItem.name,
            dueDate: todoItem.dueDate,
            done: todoItem.done,
            attachmentUrl: todoItem.attachmentUrl
        }
        return result
    }

    async updateTodo(todoId: string, todoUpdate: TodoUpdate): Promise<void> {
        logger.info(`Updating todo item ${todoId}`)

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId
            },
            UpdateExpression: 'set #nam = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ':name': todoUpdate.name,
                ':dueDate': todoUpdate.dueDate,
                ':done': todoUpdate.done
            },
            ExpressionAttributeNames: {
                '#nam': 'name'
            }
        }).promise()
    }

    async deleteTodo(todoId: string): Promise<void> {
        logger.info(`Deleting todo item ${todoId}`)

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId
            }
        }).promise()

        //Delete S3 image if it exists
        try {
            await this.s3.deleteObject({
                Bucket: this.bucketName,
                Key: `${todoId}.png`
            }).promise()
        } catch (e) {
        }
    }

    async getUploadUrl(todoId: string): Promise<string> {
        logger.info(`Generating upload url for todo item ${todoId}`)

        let parameters
        if (this.urlExpiration > 0) {
            parameters = {
                Bucket: this.bucketName,
                Key: `${todoId}.png`,
                ContentType: 'image/png',
                Expires: this.urlExpiration
            }
        } else {
            parameters = {
                Bucket: this.bucketName,
                Key: `${todoId}.png`,
                ContentType: 'image/png'
            }
        }
        const uploadUrl = this.s3.getSignedUrl('putObject', parameters)

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': `https://${this.bucketName}.s3.amazonaws.com/${todoId}.png`
            }
        }).promise()

        return uploadUrl
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}
