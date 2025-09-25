import { handler } from '../../lambdas/address';
import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';

// Mock event creator for e2e testing
const createEvent = (query?: string): APIGatewayProxyEventV2 => ({
  version: '2.0',
  routeKey: '$default',
  rawPath: '/',
  rawQueryString: query ? `q=${encodeURIComponent(query)}` : '',
  headers: { 'content-type': 'application/json' },
  requestContext: {
    accountId: '123456789012',
    apiId: 'test-api',
    domainName: 'localhost',
    domainPrefix: 'localhost',
    http: {
      method: 'GET',
      path: '/',
      protocol: 'HTTP/1.1',
      sourceIp: '127.0.0.1',
      userAgent: 'test-agent',
    },
    requestId: 'test-request',
    routeKey: '$default',
    stage: 'test',
    time: new Date().toISOString(),
    timeEpoch: Date.now(),
  },
  body: undefined,
  isBase64Encoded: false,
  queryStringParameters: query ? { q: query } : undefined,
  pathParameters: undefined,
});

describe('Address Lookup E2E', () => {
  jest.setTimeout(30000);

  it.each([
    ['346 PANORAMA AVENUE BATHURST', 'BATHURST'],
    ['1 MARTIN PLACE SYDNEY', 'SYDNEY']
  ])('should handle full address lookup flow for %s', async (address, expectedDistrict) => {
    const event = createEvent(address);
    const result = await handler(event, {} as any, {} as any) as APIGatewayProxyResult;
    
    expect(result.statusCode).toBe(200);
    
    const body = JSON.parse(result.body);
    expect(body.success).toBe(true);
    expect(body.data.address).toContain(address.split(' ')[0]);
    expect(body.data.location.latitude).toBeDefined();
    expect(body.data.location.longitude).toBeDefined();
    expect(body.data.suburbName).toBe(expectedDistrict);
  });

  it('should return 400 for missing query parameter', async () => {
    const event = createEvent();
    const result = await handler(event, {} as any, {} as any) as APIGatewayProxyResult;
    
    expect(result.statusCode).toBe(400);
    
    const body = JSON.parse(result.body);
    expect(body.success).toBe(false);
    expect(body.error).toContain('Missing required parameter');
  });

  it('should return 404 for invalid address', async () => {
    const event = createEvent('INVALID ADDRESS THAT DOES NOT EXIST');
    const result = await handler(event, {} as any, {} as any) as APIGatewayProxyResult;
    
    expect(result.statusCode).toBe(404);
    
    const body = JSON.parse(result.body);
    expect(body.success).toBe(false);
    expect(body.error).toContain('No results found');
  });
});