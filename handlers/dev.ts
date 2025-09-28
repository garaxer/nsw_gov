import { createServer } from 'http';
import { URL } from 'url';
import { handler } from './lambdas/address';
import { APIGatewayProxyEventV2, Context, Callback } from 'aws-lambda';

const PORT = 3000;

const createEvent = (url: URL): APIGatewayProxyEventV2 => ({
  version: "2.0",
  routeKey: "$default",
  rawPath: url.pathname,
  rawQueryString: url.search.slice(1),
  headers: {},
  requestContext: {} as APIGatewayProxyEventV2['requestContext'],
  body: undefined,
  isBase64Encoded: false,
  queryStringParameters: Object.fromEntries(url.searchParams),
  pathParameters: {},
});

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://localhost:${PORT}`);
    console.log(`GET ${url.pathname}${url.search}`);
    
    const result = await handler(createEvent(url), {} as Context, {} as Callback);
    
    if (result && typeof result === 'object' && 'statusCode' in result) {
      res.writeHead(result.statusCode ?? 400, { 'Content-Type': 'application/json' });
      res.end(result.body);
    } else {
      res.writeHead(200);
      res.end();
    }
  } catch {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Server error' }));
  }
}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`try it out: http://localhost:${PORT}?q=346%20PANORAMA%20AVENUE%20BATHURST`);
});
