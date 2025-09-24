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

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  
  // If no args, show usage
  if (args.length === 0) {
    console.log('🔍 Usage examples:');
    console.log('  yarn dev "q=Circular Quay&format=json"');
    console.log('  yarn dev (will show missing parameter error)');
    console.log('');
  }
  
  const queryString = args[0] || '';
  const queryParams: Record<string, string> = {};
  
  // Parse query string
  if (queryString) {
    const params = new URLSearchParams(queryString);
    for (const [key, value] of params.entries()) {
      queryParams[key] = value;
    }
  }
  
  return {
    path: '/',
    method: 'GET',
    queryParams
  };
}

// Main function to run the handler
async function runLocal() {
  try {
    console.log('🚀 Running Address Lambda function locally...\n');
    
    const { path, method, queryParams } = parseArgs();
    
    // Create a mock event
    const event = createMockEvent(path, method, undefined, queryParams);
    
    console.log('📝 Query Parameters:', queryParams);
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