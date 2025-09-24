import { handler } from './lambdas/address';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

// Simple mock event creator
const createMockEvent = (
  path = '/',
  method = 'GET',
  body?: any,
  queryParams?: Record<string, string>
): APIGatewayProxyEventV2 => ({
  version: '2.0',
  routeKey: '$default',
  rawPath: path,
  rawQueryString: queryParams ? new URLSearchParams(queryParams).toString() : '',
  headers: {
    'content-type': 'application/json',
    'user-agent': 'local-dev',
  },
  requestContext: {
    accountId: '123456789012',
    apiId: 'local-dev',
    domainName: 'localhost',
    domainPrefix: 'localhost',
    http: {
      method,
      path,
      protocol: 'HTTP/1.1',
      sourceIp: '127.0.0.1',
      userAgent: 'local-dev',
    },
    requestId: `local-${Date.now()}`,
    routeKey: '$default',
    stage: 'local',
    time: new Date().toISOString(),
    timeEpoch: Date.now(),
  },
  body: body ? JSON.stringify(body) : undefined,
  isBase64Encoded: false,
  queryStringParameters: queryParams || {},
  pathParameters: {},
});

// Main function to run the handler
async function runLocal() {
  try {
    console.log('🚀 Running Lambda function locally...\n');
    
    // Create a mock event - you can customize this as needed
    const event = createMockEvent(
      process.argv[2] || '/',           // path from command line arg
      process.argv[3] || 'GET',         // method from command line arg
      process.argv[4] ? JSON.parse(process.argv[4]) : undefined  // body from command line arg
    );
    
    console.log('📝 Mock Event:', JSON.stringify(event, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Call the handler
    const result = await handler(event, {} as any, {} as any);
    
    console.log('✅ Lambda Response:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error running Lambda:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runLocal();
}

export { runLocal, createMockEvent };