import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class StorageStack extends cdk.Stack {
  public readonly frontendBucket: s3.Bucket;
  public readonly taskAssetsBucket: s3.Bucket;
  public readonly resultsExportsBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Frontend Bucket
    this.frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true, // WARNING: For dev simplicity. In prod use CloudFront OAI.
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS, // Allow bucket policies
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Task Assets Bucket
    this.taskAssetsBucket = new s3.Bucket(this, 'TaskAssetsBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    });

    // Results Exports Bucket
    this.resultsExportsBucket = new s3.Bucket(this, 'ResultsExportsBucket', {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
    });
  }
}
