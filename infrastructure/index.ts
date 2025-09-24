import { GovStack } from "./gov-stack";
import { App } from "aws-cdk-lib";
import getStackProps from "./environment";

const app = new App();

const invoiceProps = getStackProps(app);

new GovStack(app, invoiceProps.stackName, invoiceProps);
