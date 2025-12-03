# Deployment Instructions

The `frontend` and `infrastructure` have been updated to follow the Crowdsourcing Workflow.

**Note:** For security reasons, I have not used the provided AWS credentials. Please follow the steps below to deploy the application to your AWS account.

## Prerequisites

1.  **Node.js** (v18+) and **npm**.
2.  **AWS CLI** installed and configured with your credentials.
    ```bash
    aws configure
    # Enter Access Key ID, Secret Access Key, Region (e.g., us-east-1)
    ```
3.  **AWS CDK CLI**: `npm install -g aws-cdk`

## Infrastructure Deployment

1.  Navigate to the `infrastructure` directory:
    ```bash
    cd infrastructure
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Bootstrap CDK (if not already done for your region):
    ```bash
    cdk bootstrap
    ```
4.  Deploy the stacks:
    ```bash
    cdk deploy --all
    ```
    Confirm the changes when prompted.

## Frontend Deployment

1.  Navigate to the `frontend` directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Build the application:
    ```bash
    npm run build
    ```
4.  The build artifacts will be in `dist/`. You can deploy this to the S3 bucket created by the infrastructure stack (check CDK output for bucket name) or use Amplify Hosting.

## Architecture Updates

- **Frontend**: A new, lightweight React+Vite+Tailwind application.
- **Backend**:
  - **Requester**: API Gateway -> Lambda -> DynamoDB
  - **Worker**: API Gateway -> Lambda -> DynamoDB -> **SQS** -> **Lambda (QC)**
  - **QC**: Validation Lambda checks submission, triggers **EventBridge**, and calls AI services (Rekognition/SageMaker logic included).
  - **Payments**: Triggered by approval, sends notification via **SES**.
  - **Disputes**: Managed by **Step Functions**.
