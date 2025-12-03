#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DataStack } from '../lib/data-stack';
import { AuthStack } from '../lib/auth-stack';
import { StorageStack } from '../lib/storage-stack';
import { QueueStack } from '../lib/queue-stack';
import { BackendStack } from '../lib/backend-stack';

const app = new cdk.App();

// Define el entorno de AWS explícitamente para todos los stacks
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const dataStack = new DataStack(app, 'CrowdsourcingDataStack', { env });

const authStack = new AuthStack(app, 'CrowdsourcingAuthStack', { env });

const storageStack = new StorageStack(app, 'CrowdsourcingStorageStack', { env });

const queueStack = new QueueStack(app, 'CrowdsourcingQueueStack', { env });

new BackendStack(app, 'CrowdsourcingBackendStack', {
  env, // Asegúrate de pasar el entorno aquí también
  tasksTable: dataStack.tasksTable,
  submissionsTable: dataStack.submissionsTable,
  assignmentsTable: dataStack.assignmentsTable,
  walletsTable: dataStack.walletsTable,
  workersTable: dataStack.workersTable,
  requestersTable: dataStack.requestersTable,
  disputesTable: dataStack.disputesTable,
  transactionsTable: dataStack.transactionsTable,
  requesterUserPool: authStack.requesterUserPool,
  workerUserPool: authStack.workerUserPool,
  availableTasksQueue: queueStack.availableTasksQueue,
  submissionQueue: queueStack.submissionQueue,
  taskAssetsBucket: storageStack.taskAssetsBucket,
});
