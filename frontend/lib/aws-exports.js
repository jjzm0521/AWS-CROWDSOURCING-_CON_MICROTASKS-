const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_yDzCwJzig", // Requester Pool
      userPoolClientId: "7bjc5e1mtkeg5fbtbekhu1u4gr",
    }
  },
  API: {
    REST: {
      CrowdsourcingApi: {
        endpoint: "https://llz2lc3n-j.execute-api.us-east-1.amazonaws.com/prod/",
        region: "us-east-1"
      }
    }
  }
};

export default awsConfig;
