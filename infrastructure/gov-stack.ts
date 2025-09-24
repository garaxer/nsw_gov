import * as cdk from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import path from "path";
import * as awsLambda from "aws-cdk-lib/aws-lambda";

export interface GovStackProps extends cdk.StackProps {
  stageName: string;
}

export class GovStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: GovStackProps) {
    super(scope, id, props);
    const { stageName } = props;

    const environment = {
      STAGE: stageName,
    };

    const lambda = new NodejsFunction(this, `${stageName}-address-handler`, {
      functionName: `${stageName}-address-handler`,
      entry: path.join(__dirname, "..", "handlers", "lambdas", "address.ts"),
      timeout: cdk.Duration.seconds(30),
      runtime: awsLambda.Runtime.NODEJS_22_X,
      environment,
    });

    const functionUrl = lambda.addFunctionUrl({
      authType: awsLambda.FunctionUrlAuthType.NONE,
    });

    new cdk.CfnOutput(this, `${stageName}-address-handler-url`, {
      value: functionUrl.url,
      description: "URL for the Lambda function",
      exportName: `${stageName}-address-handler-url`,
    });
  }
}
