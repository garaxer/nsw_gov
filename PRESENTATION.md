# NSW Address Lookup Lambda - Presentation

**Interview Assessment - 10 Minute Demo**

---

## 1. Live Demo (2-3 minutes)

### Production Function URL
**Base URL:** `https://hgbf7pmilz2pgjdv6zffsgntpq0amngi.lambda-url.ap-southeast-2.on.aws/`

### Demo Queries
```bash
# Valid address - Bathurst
?q=346%20PANORAMA%20AVENUE%20BATHURST

# Valid address - Sydney CBD  
?q=1%20MARTIN%20PLACE%20SYDNEY

# Show caching - repeat same query (faster response)
?q=346%20PANORAMA%20AVENUE%20BATHURST

# Error handling - invalid address
?q=INVALID%20ADDRESS%20THAT%20DOES%20NOT%20EXIST

# Error handling - missing parameter
(no query parameter)
```

**Key Points to Highlight:**
- Fast response times (~500ms first call, ~50ms cached)
- Proper JSON structure with all required fields
- Error handling with appropriate HTTP status codes
- CORS headers for browser compatibility

---

## 2. Architecture Overview (2-3 minutes)

### Request Flow
```
Client Request → Lambda Function URL → Handler → Service → Clients → NSW APIs
                                          ↓
                                    LRU Cache (50 items)
                                          ↓
                                    Response with headers
```

### Key Components

**Handler (`lambdas/address.ts`)**
- Parameter validation (`q`, `query`, `address`)
- CORS preflight handling (OPTIONS)
- Error handling with proper HTTP codes

**Service Layer (`services/addressService.ts`)**
- Coordinates API calls with `Promise.all`
- Data extraction and transformation
- Wrapped with LRU cache for performance

**Client Layer (`clients/nsw-api.ts`)**
- Retry logic (timeout + 429 handling)
- Schema validation with Zod
- Proper error propagation

**APIs Used:**
1. **NSW Geocoded Addressing** → lat/lng coordinates
2. **NSW Administrative Boundaries** → suburb + electoral district

---

## 3. Code Quality & Testing (2 minutes)

### Test Coverage
```bash
# Unit tests
npm test                    # Core logic, mocked APIs
                           
# Integration tests (opt-in)
npm run test:e2e           # Real API calls - flaky in CI
```

**Test Structure:**
- **Unit tests:** Mock external APIs, test core logic
- **E2E tests:** Real API integration (marked opt-in due to flakiness)
- **Handler tests:** Full Lambda simulation with mock events

### Code Quality
- **TypeScript** with strict config
- **ESLint** with no warnings allowed
- **Structured error handling** with custom error classes
- **Schema validation** for API responses
- **Logging** with AWS Lambda Powertools

---

## 4. Infrastructure (1-2 minutes)

### AWS CDK Stack (`infrastructure/gov-stack.ts`)
```typescript
const lambda = new NodejsFunction(this, `${stageName}-address-handler`, {
  functionName: `${stageName}-address-handler`,
  entry: path.join(__dirname, "..", "handlers", "lambdas", "address.ts"),
  timeout: cdk.Duration.seconds(30),
  runtime: awsLambda.Runtime.NODEJS_22_X,
});

const functionUrl = lambda.addFunctionUrl({
  authType: awsLambda.FunctionUrlAuthType.NONE,
});
```

**Deployment:**
```bash
cd infrastructure
npm run build && npm run deploy
```

**Outputs:**
- Function URL automatically generated
- Stage-based naming (`prod-address-handler`)
- CloudFormation managed infrastructure

---

## 5. Performance Optimizations (1 minute)

### LRU Cache Implementation
- **In-memory cache** persists across warm Lambda invocations
- **50 item capacity** with automatic eviction
- **Case-insensitive keys** (normalized to uppercase)
- **~90% faster** for repeat queries during traffic bursts

### HTTP Client Optimizations
- **Timeout handling** (8s default)
- **Retry logic** for 429 rate limits and timeouts
- **Concurrent API calls** with Promise.all
- **Connection reuse** across warm invocations

---

## 6. Improvement Backlog (1 minute)

### Completed ✅
- ✅ LRU cache for performance
- ✅ Retry functionality with timeouts
- ✅ CORS preflight handling
- ✅ Comprehensive error handling
- ✅ Schema validation
- ✅ Unit + integration tests

### Future Enhancements 🚧
- **Request IDs** for better tracing
- **CloudFront CDN** for global edge caching  
- **Rate limiting** per client IP
- **Exponential backoff** with jitter
- **Graceful degradation** if geocoding fails
- **API versioning** for backwards compatibility
- **Authentication** for production use

---

## 7. Questions & Discussion

**Technical Decisions Made:**
- Chose Function URLs over API Gateway (simpler, faster cold starts)
- LRU cache over external Redis (lower latency, simpler architecture)
- Promise.all for concurrent API calls (faster response times)
- Zod for schema validation (type safety + runtime checks)

**Production Considerations:**
- Function is currently public (no auth)
- Integration tests are opt-in due to API dependency
- Cache is per-container (not shared across instances)
- No monitoring/alerting configured

---

## Demo URLs for Testing

**Working Examples:**
- [Bathurst Address](https://hgbf7pmilz2pgjdv6zffsgntpq0amngi.lambda-url.ap-southeast-2.on.aws/?q=346%20PANORAMA%20AVENUE%20BATHURST)
- [Sydney Address](https://hgbf7pmilz2pgjdv6zffsgntpq0amngi.lambda-url.ap-southeast-2.on.aws/?q=1%20MARTIN%20PLACE%20SYDNEY)

**Error Examples:**
- [Invalid Address](https://hgbf7pmilz2pgjdv6zffsgntpq0amngi.lambda-url.ap-southeast-2.on.aws/?q=INVALID%20ADDRESS)
- [Missing Parameter](https://hgbf7pmilz2pgjdv6zffsgntpq0amngi.lambda-url.ap-southeast-2.on.aws/)