const awsExports = {
  // TODO: Replace with actual values from CDK output after deployment
  Auth: {
    region: "us-east-1",
    userPoolId: "us-east-1_PLACEHOLDER",
    userPoolWebClientId: "PLACEHOLDER",
  },
  API: {
    endpoints: [
      {
        name: "CrowdsourcingApi",
        endpoint: "https://PLACEHOLDER.execute-api.us-east-1.amazonaws.com/prod",
        region: "us-east-1",
      },
    ],
  },
};

export default awsExports;
