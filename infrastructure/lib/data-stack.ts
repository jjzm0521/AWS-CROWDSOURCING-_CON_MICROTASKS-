import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class DataStack extends cdk.Stack {
  public readonly tasksTable: dynamodb.Table;
  public readonly submissionsTable: dynamodb.Table;
  public readonly assignmentsTable: dynamodb.Table;
  public readonly walletsTable: dynamodb.Table;
  public readonly workersTable: dynamodb.Table;
  public readonly requestersTable: dynamodb.Table;
  public readonly disputesTable: dynamodb.Table;
  public readonly transactionsTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Tasks Table
    this.tasksTable = new dynamodb.Table(this, 'TasksTable', {
      partitionKey: { name: 'taskId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev/test
    });

    // GSI for listing tasks by requester and status
    this.tasksTable.addGlobalSecondaryIndex({
      indexName: 'RequesterStatusIndex',
      partitionKey: { name: 'requesterId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'status', type: dynamodb.AttributeType.STRING },
    });

    this.tasksTable.addGlobalSecondaryIndex({
      indexName: 'BatchIndex',
      partitionKey: { name: 'batchId', type: dynamodb.AttributeType.STRING },
    });

    this.tasksTable.addGlobalSecondaryIndex({
      indexName: 'StatusIndex',
      partitionKey: { name: 'status', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
    });

    // Submissions Table
    this.submissionsTable = new dynamodb.Table(this, 'SubmissionsTable', {
      partitionKey: { name: 'submissionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: dynamodb.StreamViewType.NEW_IMAGE,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.submissionsTable.addGlobalSecondaryIndex({
      indexName: 'TaskSubmissionsIndex',
      partitionKey: { name: 'taskId', type: dynamodb.AttributeType.STRING },
    });

    this.submissionsTable.addGlobalSecondaryIndex({
      indexName: 'WorkerSubmissionsIndex',
      partitionKey: { name: 'workerId', type: dynamodb.AttributeType.STRING },
    });

    // Assignments Table
    this.assignmentsTable = new dynamodb.Table(this, 'AssignmentsTable', {
      partitionKey: { name: 'assignmentId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'expiresAt',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.assignmentsTable.addGlobalSecondaryIndex({
        indexName: 'WorkerAssignmentsIndex',
        partitionKey: { name: 'workerId', type: dynamodb.AttributeType.STRING },
    });

    // Wallets Table
    this.walletsTable = new dynamodb.Table(this, 'WalletsTable', {
      partitionKey: { name: 'walletId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Workers Table
    this.workersTable = new dynamodb.Table(this, 'WorkersTable', {
      partitionKey: { name: 'workerId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Requesters Table
    this.requestersTable = new dynamodb.Table(this, 'RequestersTable', {
        partitionKey: { name: 'requesterId', type: dynamodb.AttributeType.STRING },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Disputes Table
    this.disputesTable = new dynamodb.Table(this, 'DisputesTable', {
      partitionKey: { name: 'disputeId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Transactions Table
    this.transactionsTable = new dynamodb.Table(this, 'TransactionsTable', {
      partitionKey: { name: 'transactionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
