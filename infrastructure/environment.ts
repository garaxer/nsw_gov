import { App } from "aws-cdk-lib";
import { GovStackProps } from "./gov-stack";

export enum AwsEnvironment {
  Production = "prod",
}

const stackPropsDict: Record<AwsEnvironment, GovStackProps> = {
  [AwsEnvironment.Production]: {
    stageName: "prod",
    env: {
      account: "447259991240",
      region: "ap-southeast-2",
    },
  },
};

const getStackProps = (app: App) => {
  const account =
    (app.node.tryGetContext("accountId") as string) ?? process.env.ACCOUNT_ID;
  const region =
    (app.node.tryGetContext("region") as string) ?? "ap-southeast-2";
  const stage =
    (app.node.tryGetContext("stage") as string) ??
    process.env.DEFAULT_STAGE ??
    "prod";

  const config = stackPropsDict[stage as AwsEnvironment];

  const stackName = `nsw-address-${config.stageName}`;
  return {
    stackName,
    env: { account, region },
    ...config,
  };
};

export default getStackProps;
