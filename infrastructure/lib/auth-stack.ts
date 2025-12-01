import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class AuthStack extends cdk.Stack {
  public readonly requesterUserPool: cognito.UserPool;
  public readonly workerUserPool: cognito.UserPool;
  public readonly requesterUserPoolClient: cognito.UserPoolClient;
  public readonly workerUserPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Requester User Pool
    this.requesterUserPool = new cognito.UserPool(this, 'RequesterUserPool', {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.requesterUserPoolClient = this.requesterUserPool.addClient('RequesterClient', {
      authFlows: {
        userSrp: true,
      },
    });

    // Worker User Pool
    this.workerUserPool = new cognito.UserPool(this, 'WorkerUserPool', {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.workerUserPoolClient = this.workerUserPool.addClient('WorkerClient', {
      authFlows: {
        userSrp: true,
      },
    });

    // Export client IDs
    new cdk.CfnOutput(this, 'RequesterUserPoolClientId', {
      value: this.requesterUserPoolClient.userPoolClientId,
    });

    new cdk.CfnOutput(this, 'WorkerUserPoolClientId', {
      value: this.workerUserPoolClient.userPoolClientId,
    });
  }
}
