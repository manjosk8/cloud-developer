## Project 5 - Cloud Developer Nanodegree

Notes:

- In order to make serverless framework to work it was required to update nodejs runtime environment from version 8 to version 12
- Postman collection contained errors regarding updating of the items that was done through PUT method instead of the PATCH method as it was specified so Final Project.postman_collection.json contains updated version. I've added additional variable to test image upload uploadUrl that is automatically populated through Postman Test upon presigned S3 link retrieval and added new request for image upload method.
- Permissions in serverless.yaml are added in global and per lambda function because of the specifics with serverless framework and bugs that require first global deployment and then update of permissions per lambda function. serverless.yaml corresponds to the latest config deployed.
- In order to return Items without userId new Typescript interface was developed named TodoQueryItem.ts
- API Gateway does the verifications of POST and PATCH methods through json specification located in models directory
- JWT does certificate retrieval from web as it was specified in guide you have provided in :TODO comments
- Tracing was done through AWS X-Ray
- Assigning of S3 links and deletion of items is done through one operation this can be improved and is the idea for the Capstone project to integrate messaging service so that S3 sends events when something is uploaded to SNS and DynamoDB through Lambda function listens and creates first authenticationUrl upon successful upload

This section of the course was great and thank you for detailed explanations and going through various topics, really useful :)

Code is located in course-04/project/c4-final-project-starter-code repo:

[https://github.com/manjosk8/cloud-developer/tree/master/course-04/project/c4-final-project-starter-code](https://github.com/manjosk8/cloud-developer/tree/master/course-04/project/c4-final-project-starter-code)