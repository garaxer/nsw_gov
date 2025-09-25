import { GovStack } from "./gov-stack";
import { App } from "aws-cdk-lib";
import getStackProps from "./environment";

const app = new App();

const stackProps = getStackProps(app);

new GovStack(app, stackProps.stackName, stackProps);
