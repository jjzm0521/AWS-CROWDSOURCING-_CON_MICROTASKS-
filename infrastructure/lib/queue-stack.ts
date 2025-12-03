import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class QueueStack extends cdk.Stack {
  public readonly availableTasksQueue: sqs.Queue;
  public readonly availableTasksDlq: sqs.Queue;
  public readonly submissionQueue: sqs.Queue;
  public readonly submissionDlq: sqs.Queue;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Dead Letter Queue
    this.availableTasksDlq = new sqs.Queue(this, 'AvailableTasksDLQ', {
      retentionPeriod: cdk.Duration.days(14),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Available Tasks Queue
    this.availableTasksQueue = new sqs.Queue(this, 'AvailableTasksQueue', {
      visibilityTimeout: cdk.Duration.seconds(300), // Match lambda timeout usually
      deadLetterQueue: {
        queue: this.availableTasksDlq,
        maxReceiveCount: 3,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Submission DLQ
    this.submissionDlq = new sqs.Queue(this, 'SubmissionDLQ', {
      retentionPeriod: cdk.Duration.days(14),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Submission Queue
    this.submissionQueue = new sqs.Queue(this, 'SubmissionQueue', {
      visibilityTimeout: cdk.Duration.seconds(300),
      deadLetterQueue: {
        queue: this.submissionDlq,
        maxReceiveCount: 3,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
