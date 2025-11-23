const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_PLACEHOLDER",
      userPoolClientId: "PLACEHOLDER",
    }
  },
  API: {
    REST: {
      CrowdsourcingApi: {
        endpoint: "https://PLACEHOLDER.execute-api.us-east-1.amazonaws.com/prod",
        region: "us-east-1"
      }
    }
  }
};

export default awsConfig;
