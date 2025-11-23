import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as path from 'path';

interface BackendStackProps extends cdk.StackProps {
  tasksTable: dynamodb.Table;
  submissionsTable: dynamodb.Table;
  assignmentsTable: dynamodb.Table;
  walletsTable: dynamodb.Table;
  workersTable: dynamodb.Table;
  disputesTable: dynamodb.Table;
  transactionsTable: dynamodb.Table;
  requesterUserPool: cognito.UserPool;
  workerUserPool: cognito.UserPool;
  availableTasksQueue: sqs.Queue;
}

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    // API Gateway
    const api = new apigateway.RestApi(this, 'CrowdsourcingApi', {
      restApiName: 'Crowdsourcing Service',
      description: 'This service handles crowdsourcing tasks.',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Cognito Authorizers
    const requesterAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'RequesterAuthorizer', {
      cognitoUserPools: [props.requesterUserPool],
    });

    const workerAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'WorkerAuthorizer', {
      cognitoUserPools: [props.workerUserPool],
    });

    // Shared Environment
    const sharedEnv = {
        TASKS_TABLE: props.tasksTable.tableName,
        AVAILABLE_TASKS_QUEUE_URL: props.availableTasksQueue.queueUrl,
    };

    // --- Tasks Handlers ---

    // Create Task Batch
    const createTaskBatchLambda = new lambda.Function(this, 'CreateTaskBatchLambda', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'handlers.tasks.create_task_batch.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/src')),
      environment: sharedEnv,
      timeout: cdk.Duration.seconds(30),
    });

    props.tasksTable.grantWriteData(createTaskBatchLambda);

    // Publish Task Batch
    const publishTaskBatchLambda = new lambda.Function(this, 'PublishTaskBatchLambda', {
        runtime: lambda.Runtime.PYTHON_3_12,
        handler: 'handlers.tasks.publish_task_batch.handler',
        code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/src')),
        environment: sharedEnv,
        timeout: cdk.Duration.seconds(60), // Creating batch messages might take time
    });

    props.tasksTable.grantReadWriteData(publishTaskBatchLambda);
    props.availableTasksQueue.grantSendMessages(publishTaskBatchLambda);

    // List Tasks
    const listTasksLambda = new lambda.Function(this, 'ListTasksLambda', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'handlers.tasks.list_tasks.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/src')),
      environment: sharedEnv,
    });

    props.tasksTable.grantReadData(listTasksLambda);

    // --- API Routes ---

    const requesterResource = api.root.addResource('requester');
    const tasksResource = requesterResource.addResource('tasks');

    // POST /requester/tasks/batch
    const batchResource = tasksResource.addResource('batch');
    batchResource.addMethod('POST', new apigateway.LambdaIntegration(createTaskBatchLambda), {
      authorizer: requesterAuthorizer,
    });

    // POST /requester/tasks/{batchId}/publish
    const batchItemResource = tasksResource.addResource('{batchId}');
    const publishResource = batchItemResource.addResource('publish');
    publishResource.addMethod('POST', new apigateway.LambdaIntegration(publishTaskBatchLambda), {
        authorizer: requesterAuthorizer,
    });

    // GET /requester/tasks
    tasksResource.addMethod('GET', new apigateway.LambdaIntegration(listTasksLambda), {
      authorizer: requesterAuthorizer,
    });

  }
}
