import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as sfnTasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
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
  submissionQueue: sqs.Queue;
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
        ASSIGNMENTS_TABLE: props.assignmentsTable.tableName,
        SUBMISSIONS_TABLE: props.submissionsTable.tableName,
        WALLETS_TABLE: props.walletsTable.tableName,
        WORKERS_TABLE: props.workersTable.tableName,
        DISPUTES_TABLE: props.disputesTable.tableName,
        TRANSACTIONS_TABLE: props.transactionsTable.tableName,
        AVAILABLE_TASKS_QUEUE_URL: props.availableTasksQueue.queueUrl,
        SUBMISSION_QUEUE_URL: props.submissionQueue.queueUrl,
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

    // List Available Tasks (Worker)
    const listAvailableTasksLambda = new lambda.Function(this, 'ListAvailableTasksLambda', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'handlers.tasks.list_available_tasks.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/src')),
      environment: sharedEnv,
    });

    props.tasksTable.grantReadData(listAvailableTasksLambda);

    // Assign Task (Worker)
    const assignTaskLambda = new lambda.Function(this, 'AssignTaskLambda', {
        runtime: lambda.Runtime.PYTHON_3_12,
        handler: 'handlers.tasks.assign_task.handler',
        code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/src')),
        environment: sharedEnv,
    });

    props.tasksTable.grantReadWriteData(assignTaskLambda);
    props.assignmentsTable.grantWriteData(assignTaskLambda);

    // Submit Work (Worker)
    const submitWorkLambda = new lambda.Function(this, 'SubmitWorkLambda', {
        runtime: lambda.Runtime.PYTHON_3_12,
        handler: 'handlers.submissions.submit_work.handler',
        code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/src')),
        environment: sharedEnv,
    });

    props.tasksTable.grantReadWriteData(submitWorkLambda);
    props.assignmentsTable.grantReadWriteData(submitWorkLambda);
    props.submissionsTable.grantWriteData(submitWorkLambda);
    props.submissionQueue.grantSendMessages(submitWorkLambda);

    // --- QC Handlers ---

    // Validate Submission
    const validateSubmissionLambda = new lambda.Function(this, 'ValidateSubmissionLambda', {
        runtime: lambda.Runtime.PYTHON_3_12,
        handler: 'handlers.qc.validate_submission.handler',
        code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/src')),
        environment: sharedEnv,
    });

    props.tasksTable.grantReadData(validateSubmissionLambda);
    props.submissionsTable.grantWriteData(validateSubmissionLambda);

    // AI Services Permissions
    validateSubmissionLambda.addToRolePolicy(new iam.PolicyStatement({
        actions: [
            'rekognition:DetectLabels',
            'rekognition:DetectModerationLabels',
            'transcribe:StartTranscriptionJob',
            'transcribe:GetTranscriptionJob',
            'sagemaker:InvokeEndpoint',
            'events:PutEvents'
        ],
        resources: ['*'],
    }));

    // Trigger from Submission Queue
    validateSubmissionLambda.addEventSource(new lambdaEventSources.SqsEventSource(props.submissionQueue, {
        batchSize: 1,
    }));

    // --- Payment Handlers ---

    // Process Payment
    const processPaymentLambda = new lambda.Function(this, 'ProcessPaymentLambda', {
        runtime: lambda.Runtime.PYTHON_3_12,
        handler: 'handlers.payments.process_payment.handler',
        code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/src')),
        environment: sharedEnv,
    });

    props.tasksTable.grantReadData(processPaymentLambda);
    props.walletsTable.grantReadWriteData(processPaymentLambda);
    props.transactionsTable.grantWriteData(processPaymentLambda);

    processPaymentLambda.addToRolePolicy(new iam.PolicyStatement({
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        resources: ['*'],
    }));

    // Trigger Payment on Submissions Table Modify (Status -> Approved)
    processPaymentLambda.addEventSource(new lambdaEventSources.DynamoEventSource(props.submissionsTable, {
        startingPosition: lambda.StartingPosition.TRIM_HORIZON,
        batchSize: 1,
        filters: [
            lambda.FilterCriteria.filter({
                eventName: lambda.FilterRule.isEqual('MODIFY'),
                dynamodb: {
                    NewImage: {
                        status: { S: ['Approved'] } // Only if new status is Approved
                    }
                }
            }),
        ],
    }));

    // --- Wallet Handlers ---

    // Get Wallet
    const getWalletLambda = new lambda.Function(this, 'GetWalletLambda', {
        runtime: lambda.Runtime.PYTHON_3_12,
        handler: 'handlers.wallet.get_wallet.handler',
        code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/src')),
        environment: sharedEnv,
    });

    props.walletsTable.grantReadData(getWalletLambda);

    // --- Disputes Handlers ---

    // Step Function for Disputes
    const disputeResolutionStateMachine = new sfn.StateMachine(this, 'DisputeResolutionStateMachine', {
        definitionBody: sfn.DefinitionBody.fromChainable(
            new sfn.Pass(this, 'StartDisputeProcess')
                .next(new sfn.Succeed(this, 'DisputeResolved'))
        ),
        timeout: cdk.Duration.days(30),
    });

    // Start Dispute (Worker)
    const startDisputeLambda = new lambda.Function(this, 'StartDisputeLambda', {
        runtime: lambda.Runtime.PYTHON_3_12,
        handler: 'handlers.disputes.start_dispute.handler',
        code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/src')),
        environment: {
            ...sharedEnv,
            DISPUTE_STATE_MACHINE_ARN: disputeResolutionStateMachine.stateMachineArn,
        },
    });

    props.submissionsTable.grantReadWriteData(startDisputeLambda);
    props.disputesTable.grantWriteData(startDisputeLambda);
    disputeResolutionStateMachine.grantStartExecution(startDisputeLambda);

    // Resolve Dispute (Admin)
    const resolveDisputeLambda = new lambda.Function(this, 'ResolveDisputeLambda', {
        runtime: lambda.Runtime.PYTHON_3_12,
        handler: 'handlers.disputes.resolve_dispute.handler',
        code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/src')),
        environment: sharedEnv,
    });

    props.disputesTable.grantReadWriteData(resolveDisputeLambda);
    props.submissionsTable.grantWriteData(resolveDisputeLambda);

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

    // GET /requester/wallet
    const requesterWalletResource = requesterResource.addResource('wallet');
    requesterWalletResource.addMethod('GET', new apigateway.LambdaIntegration(getWalletLambda), {
        authorizer: requesterAuthorizer,
    });

    const workerResource = api.root.addResource('worker');
    const workerTasksResource = workerResource.addResource('tasks');

    // GET /worker/tasks
    workerTasksResource.addMethod('GET', new apigateway.LambdaIntegration(listAvailableTasksLambda), {
      authorizer: workerAuthorizer,
    });

    // GET /worker/wallet
    const workerWalletResource = workerResource.addResource('wallet');
    workerWalletResource.addMethod('GET', new apigateway.LambdaIntegration(getWalletLambda), {
        authorizer: workerAuthorizer,
    });

    const workerTaskItemResource = workerTasksResource.addResource('{taskId}');

    // POST /worker/tasks/{taskId}/assign
    const assignResource = workerTaskItemResource.addResource('assign');
    assignResource.addMethod('POST', new apigateway.LambdaIntegration(assignTaskLambda), {
        authorizer: workerAuthorizer,
    });

    // POST /worker/tasks/{taskId}/submit
    const submitResource = workerTaskItemResource.addResource('submit');
    submitResource.addMethod('POST', new apigateway.LambdaIntegration(submitWorkLambda), {
        authorizer: workerAuthorizer,
    });

    // POST /worker/disputes
    const workerDisputesResource = workerResource.addResource('disputes');
    workerDisputesResource.addMethod('POST', new apigateway.LambdaIntegration(startDisputeLambda), {
        authorizer: workerAuthorizer,
    });

    const adminResource = api.root.addResource('admin');
    const adminDisputesResource = adminResource.addResource('disputes');
    const adminDisputeItemResource = adminDisputesResource.addResource('{disputeId}');
    const resolveResource = adminDisputeItemResource.addResource('resolve');

    // POST /admin/disputes/{disputeId}/resolve
    // Using requesterAuthorizer for admin actions for now
    resolveResource.addMethod('POST', new apigateway.LambdaIntegration(resolveDisputeLambda), {
        authorizer: requesterAuthorizer,
    });

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
        value: api.url,
        description: 'The URL of the API Gateway',
    });
  }
}
