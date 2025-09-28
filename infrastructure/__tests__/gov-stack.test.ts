import { GovStack } from '../gov-stack';
import { App } from 'aws-cdk-lib';

describe('GovStack', () => {
  it('should create stack without errors', () => {
    const app = new App();
    const stack = new GovStack(app, 'test-stack', {
      stageName: 'test',
      env: { account: '123456789012', region: 'us-east-1' }
    });
    
    expect(stack).toBeDefined();
  });
});