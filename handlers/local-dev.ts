import { handler } from './lambdas/address';
import { APIGatewayProxyEventV2, APIGatewayProxyResult, APIGatewayProxyResultV2, Callback, Context } from 'aws-lambda';

// Simple mock event creator
const createMockEvent = (
  path = '/',
  method = 'GET',
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
      accountId: '',
      apiId: '',
      domainName: '',
      domainPrefix: '',
      http: {
          method,
          path: '',
          protocol: '',
          sourceIp: '',
          userAgent: ''
      },
      requestId: '',
      routeKey: '',
      stage: '',
      time: '',
      timeEpoch: 0
  },
  body: undefined,
  isBase64Encoded: false,
  queryStringParameters: queryParams ?? {},
  pathParameters: {},
});

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  
  // If no args, show usage
  if (args.length === 0) {
    console.log('Usage examples:');
    console.log('  yarn dev "q=346 PANORAMA AVENUE BATHURST"');
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
    console.log('Running Address Lambda function locally...\n');
    
    const { path, method, queryParams } = parseArgs();
    
    // Create a mock event
    const event = createMockEvent(path, method, queryParams);
    
    console.log('Query Parameters:', queryParams);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Call the handler
    const result = await handler(event, {} as Context, {} as Callback<APIGatewayProxyResultV2<APIGatewayProxyResult>>);
    
    console.log('Lambda Response:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error running Lambda:', error);
    process.exit(1);
  }
}

runLocal();
