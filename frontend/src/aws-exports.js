// Template for AWS Amplify configuration
// Fill in the placeholders with your actual AWS resource details

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: "REPLACE_WITH_USER_POOL_ID",
      userPoolClientId: "REPLACE_WITH_WEB_CLIENT_ID",
    }
  },
  API: {
    REST: {
      CrowdsourcingApi: {
        endpoint: "REPLACE_WITH_API_GATEWAY_URL",
        region: "us-east-1"
      }
    }
  }
};

export default awsConfig;
