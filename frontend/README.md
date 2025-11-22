# Frontend Application

This directory is reserved for the React application for the Crowdsourcing Platform.

## Recommended Setup

1.  Initialize React app:
    ```bash
    npx create-react-app . --template typescript
    ```
2.  Install AWS Amplify libraries:
    ```bash
    npm install aws-amplify @aws-amplify/ui-react
    ```

## Architecture connection

The frontend will connect to the backend APIs deployed via the CDK infrastructure.
Configuration details (API Endpoints, Cognito User Pool IDs) should be passed to the frontend via environment variables or a generated configuration file.
