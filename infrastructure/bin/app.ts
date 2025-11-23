#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DataStack } from '../lib/data-stack';
import { AuthStack } from '../lib/auth-stack';
import { StorageStack } from '../lib/storage-stack';
import { QueueStack } from '../lib/queue-stack';
import { BackendStack } from '../lib/backend-stack';

const app = new cdk.App();

const dataStack = new DataStack(app, 'CrowdsourcingDataStack', {});

const authStack = new AuthStack(app, 'CrowdsourcingAuthStack', {});

const storageStack = new StorageStack(app, 'CrowdsourcingStorageStack', {});

const queueStack = new QueueStack(app, 'CrowdsourcingQueueStack', {});

new BackendStack(app, 'CrowdsourcingBackendStack', {
  tasksTable: dataStack.tasksTable,
  submissionsTable: dataStack.submissionsTable,
  assignmentsTable: dataStack.assignmentsTable,
  walletsTable: dataStack.walletsTable,
  workersTable: dataStack.workersTable,
  disputesTable: dataStack.disputesTable,
  transactionsTable: dataStack.transactionsTable,
  requesterUserPool: authStack.requesterUserPool,
  workerUserPool: authStack.workerUserPool,
  availableTasksQueue: queueStack.availableTasksQueue,
});
