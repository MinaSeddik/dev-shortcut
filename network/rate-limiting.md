# Rate Limiting


- [Introduction](#Introduction)
- [HTTP API Rate Limiting Response headers](#HTTP_API_Rate_Limiting_Response_headers)
- [Rate Limiting using Bucket4j](#Rate_Limiting_using_Bucket4j)
- [Bucket4j with Spring Boot](#Bucket4j_with_Spring_Boot)




## <a name='Introduction'> Introduction </a>

- Rate limiting is a strategy to limit access to APIs. 
- It restricts the number of API calls that a client can make within a certain timeframe. 
- This helps defend the API against overuse, both unintentional and malicious.
- Rate limits are often applied to an API by tracking the IP address, or in a more business-specific way such as API keys or access tokens. 


There is several different ways when a client reaches the limit:
- Queueing the request until the remaining time period has elapsed
- Allowing the request immediately but charging extra for this request
- Or, most commonly, rejecting the request (**HTTP 429 Too Many Requests**)


Here is a Very Simple/naive RateLimiter

```java
public class SimpleRateLimiter {

    private Semaphore semaphore;
    private int maxPermits;
    private TimeUnit timePeriod;
    private ScheduledExecutorService scheduler;

    private long endsAt;
 
    public static SimpleRateLimiter create(int permits, TimeUnit timePeriod) {
        SimpleRateLimiter limiter = SimpleRateLimiter(permits, timePeriod);
        limiter.schedulePermitReplenishment();
        return limiter;
    }
 
    private SimpleRateLimiter(int permits, TimeUnit timePeriod) {
        this.semaphore = new Semaphore(permits);
        this.maxPermits = permits;
        this.timePeriod = timePeriod;
        this.endsAt = System.currentTimeMillis() + timePeriod.toMillis(amount);
    }
 
    public boolean tryAcquire() {
        // tryAcquire() – return true if a permit is available immediately and acquire it otherwise return false
        return semaphore.tryAcquire();
    }
 
    public void stop() {
        scheduler.shutdownNow();
    }

    // this method may need to be in sync with resetRateLimit()
    public int getRemainingPermitsForTimeWindow() {
        return semaphore.availablePermits();
    }

    // this method may need to be in sync with resetRateLimit()
    public long getRemainingWindowBeforeReset() {
        Duration age = Duration.between(Instant.now(), endsAt);
        return age.toMillis();
    }

    public void schedulePermitReplenishment() {
        scheduler = Executors.newScheduledThreadPool(1);
        scheduler.schedule(() -> resetRateLimit(), 1, timePeriod);
    }
    
    private void resetRateLimit(){
        semaphore.release(maxPermits - semaphore.availablePermits());    
        endsAt = System.currentTimeMillis() + timePeriod.toMillis(amount);
    }

}
```


Usage example:
```java
@Component
public class RateLimitingInterceptor extends HandlerInterceptorAdapter {
 
    private static final Logger logger = LoggerFactory.getLogger(RateLimitingInterceptor.class);
     
    @Value("${rate.limit.enabled}")
    private boolean enabled;
     
    @Value("${rate.limit.hourly.limit}")
    private int hourlyLimit;
 
    // (1) Use ConcurrentHashMap for trivial and simple implementation 
    private Map<String, Optional<SimpleRateLimiter>> limiters = new ConcurrentHashMap<>();

    // OR
    
    // (2) Use Cache like Guava, Caffine for significant implementation
    private LoadingCache<String, Optional<SimpleRateLimiter>> limiters = CacheBuilder.newBuilder()
           .expireAfterWrite(100, TimeUnit.MINUTES)
           .build(
               new CacheLoader<String, Optional<SimpleRateLimiter>>() {
                 @Override
                 public Optional<SimpleRateLimiter> load(String key) throws AnyException {
                   return createExpensiveGraph(key);
                 }
               });

    // OR
    
    // (3) Use Redis for distributed system 
    private Config config = new Config();
    config.useSingleServer().setAddress("redis://192.168.99.100:6379");
    private RedissonClient redisson = Redisson.create(config);
    private RMap<String, Optional<SimpleRateLimiter>> limiters = redisson.getMap("cacheRateLimiterMapName");
     

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!enabled) {
            return true;
        }
        String clientId = request.getHeader("Client-Id");
        // let non-API requests pass
        if (clientId == null) {
            return true;
        }

        SimpleRateLimiter rateLimiter = limiters.computeIfAbsent(clientId, clientId -> createRateLimiter(clientId));
    
        // For redis
        SimpleRateLimiter rateLimiter = limiters.putIfAbsent(clientId, createRateLimiter(clientId), 100, TimeUnit.MINUTES);



        boolean allowRequest = limiter.tryAcquire();
     
        if (!allowRequest) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        }
        response.addHeader("X-RateLimit-Limit", String.valueOf(hourlyLimit));
        response.addHeader("X-RateLimit-Remaining", rateLimiter.getRemainingPermitsForTimeWindow());
        response.addHeader("X-RateLimit-Reset", rateLimiter.getRemainingWindowBeforeReset());


        return allowRequest;
    }
     
    @PreDestroy
    public void destroy() {
        // loop and finalize all limiters
    }


    private SimpleRateLimiter createRateLimiter(String clientId){
        return new SimpleRateLimiter(100, TimeUnit.MINUTES);            
    }

}
```


## <a name='HTTP_API_Rate_Limiting_Response_headers'> HTTP API Rate Limiting Response headers </a>

Here are some examples of HTTP API Rate Limiting HTTP Response headers. Taken from four common REST APIs: Github, Vimeo, Twitter and Imgur:

#### Github Rate Limiting

> **http://developer.github.com/v3/#rate-limiting**

| HTTP Header       |    Description            |
| :---         |    :----                       |
| **X-RateLimit-Limit**     |  Request limit per hour  |
| **X-RateLimit-Remaining**     |  The number of requests left for the time window    |


#### Vimeo Rate Limiting

> **http://developer.vimeo.com/guidelines/rate-limiting**

| HTTP Header       |    Description            |
| :---         |    :----                       |
| **X-RateLimit-Limit**         |  Request limit per day / per 5 minutes  |
| **X-RateLimit-Remaining**     |  The number of requests left for the time window    |
| **X-RateLimit-Reset**         |  The remaining window before the rate limit resets in UTC epoch seconds   |



#### Twitter REST API  Rate Limiting

> **https://dev.twitter.com/docs/rate-limiting/1.1**

> Note: Twitter uses headers with similar names like Vimeo, but has another dash in each name.

| HTTP Header       |    Description            |
| :---         |    :----                       |
| **X-RateLimit-Limit**         |  Request limit per day / per 5 minutes  |
| **X-Rate-Limit-Remaining**     |  The number of requests left for the time window    |
| **X-Rate-Limit-Reset**         |  The remaining window before the rate limit resets in UTC epoch seconds   |



## <a name='Rate_Limiting_using_Bucket4j'> Rate Limiting using Bucket4j </a>

```xml
<dependency>
    <groupId>com.github.vladimir-bukhtoyarov</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>4.10.0</version>
</dependency>
```


#### Terminology

- The **Bucket** interface represents the token bucket with a maximum capacity. It provides methods such as **tryConsume** and **tryConsumeAndReturnRemaining** for consuming tokens. These methods return the result of consumption as true if the request conforms with the limits, and the token was consumed.
- The **Bandwidth** class is the key building block of a bucket – it defines the limits of the bucket. We use Bandwidth to configure the capacity of the bucket and the rate of refill.
- The **Refill** class is used to define the fixed rate at which tokens are added to the bucket. We can configure the rate as the number of tokens that would be added in a given time period. For example, 10 buckets per second or 200 tokens per 5 minutes, and so on.
- The **tryConsumeAndReturnRemaining** method in Bucket returns **ConsumptionProbe**. 
- **ConsumptionProbe** contains, along with the result of consumption, the status of the bucket such as the tokens remaining, or the time remaining until the requested tokens are available in the bucket again.



####  Refill.greedy vs Refill.intervally

##### Refill.greedy
Creates the Refill that does refill of tokens in greedy manner, it will try to add the tokens to bucket as soon as possible. 
For example "of" refill "10 tokens per 1 second" will add 1 token per each 100 millisecond, in other words refill will not wait 1 second to regenerate whole bunch of 10 tokens.

The three refills bellow do refill of tokens with same speed:
```java
  Refill.greedy(600, Duration.ofMinutes(1));
  Refill.greedy(10, Duration.ofSeconds(1));
  Refill.greedy(1, Duration.ofMillis(100));
```

##### Refill.intervally
Creates the Refill that does refill of tokens in intervally manner. "Intervally" in opposite to "greedy" will wait until whole period will be elapsed before regenerate tokens



      
#### Basic Usage

```java
Refill refill = Refill.intervally(10, Duration.ofMinutes(1));
Bandwidth limit = Bandwidth.classic(10, refill);
Bucket bucket = Bucket4j.builder()
    .addLimit(limit)
    .build();

for (int i = 1; i <= 10; i++) {
    assertTrue(bucket.tryConsume(1));
}
assertFalse(bucket.tryConsume(1));
```


```java
Bandwidth limit = Bandwidth.classic(1, Refill.intervally(1, Duration.ofSeconds(2)));
Bucket bucket = Bucket4j.builder()
    .addLimit(limit)
    .build();
assertTrue(bucket.tryConsume(1));     // first request
Executors.newScheduledThreadPool(1)   // schedule another request for 2 seconds later
    .schedule(() -> assertTrue(bucket.tryConsume(1)), 2, TimeUnit.SECONDS); 
```


```java
Bucket bucket = Bucket4j.builder()
    .addLimit(Bandwidth.classic(10, Refill.intervally(10, Duration.ofMinutes(1))))
    .addLimit(Bandwidth.classic(5, Refill.intervally(5, Duration.ofSeconds(20))))
    .build();

for (int i = 1; i <= 5; i++) {
    assertTrue(bucket.tryConsume(1));
}
assertFalse(bucket.tryConsume(1));
```


#### Applying Rate Limit

```java
@RestController
class AreaCalculationController {

    private final Bucket bucket;

    public AreaCalculationController() {
        Bandwidth limit = Bandwidth.classic(20, Refill.greedy(20, Duration.ofMinutes(1)));
        this.bucket = Bucket4j.builder()
            .addLimit(limit)
            .build();
    }

    //..

    public ResponseEntity<AreaV1> rectangle(@RequestBody RectangleDimensionsV1 dimensions) {
        if (bucket.tryConsume(1)) {
            return ResponseEntity.ok(new AreaV1("rectangle", dimensions.getLength() * dimensions.getWidth()));
        }
    
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
    }

}
```


#### API Clients and Pricing Plan

Let's introduce pricing plans for more business-centered rate limits.

Pricing plans help us monetize our API. Let's assume that we have the following plans for our API clients:
- Free: 20 requests per hour per API client
- Basic: 40 requests per hour per API client
- Professional: 100 requests per hour per API client

```java
enum PricingPlan {
    FREE {
        Bandwidth getLimit() {
            return Bandwidth.classic(20, Refill.intervally(20, Duration.ofHours(1)));
        }
    },
    BASIC {
        Bandwidth getLimit() {
            return Bandwidth.classic(40, Refill.intervally(40, Duration.ofHours(1)));
        }
    },
    PROFESSIONAL {
        Bandwidth getLimit() {
            return Bandwidth.classic(100, Refill.intervally(100, Duration.ofHours(1)));
        }
    };
    //..

    static PricingPlan resolvePlanFromApiKey(String apiKey) {
        if (apiKey == null || apiKey.isEmpty()) {
            return FREE;
        } else if (apiKey.startsWith("PX001-")) {
            return PROFESSIONAL;
        } else if (apiKey.startsWith("BX001-")) {
            return BASIC;
        }
        return FREE;
    }

}
```


```java
class PricingPlanService {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    public Bucket resolveBucket(String apiKey) {
        return cache.computeIfAbsent(apiKey, this::newBucket);
    }

    private Bucket newBucket(String apiKey) {
        PricingPlan pricingPlan = PricingPlan.resolvePlanFromApiKey(apiKey);
        return Bucket4j.builder()
            .addLimit(pricingPlan.getLimit())
            .build();
    }
}
```


```java
@RestController
class AreaCalculationController {

    private PricingPlanService pricingPlanService;

    public ResponseEntity<AreaV1> rectangle(@RequestHeader(value = "X-api-key") String apiKey, @RequestBody RectangleDimensionsV1 dimensions) {

        Bucket bucket = pricingPlanService.resolveBucket(apiKey);
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        if (probe.isConsumed()) {
            return ResponseEntity.ok()
                .header("X-Rate-Limit-Remaining", Long.toString(probe.getRemainingTokens()))
                .body(new AreaV1("rectangle", dimensions.getLength() * dimensions.getWidth()));
        }
        
        long waitForRefill = probe.getNanosToWaitForRefill() / 1_000_000_000;
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
            .header("X-Rate-Limit-Retry-After-Seconds", String.valueOf(waitForRefill))
            .build();
    }
}
```

#### Using Spring MVC Interceptor

```java
public class RateLimitInterceptor implements HandlerInterceptor {

    private PricingPlanService pricingPlanService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) 
      throws Exception {
        String apiKey = request.getHeader("X-api-key");
        if (apiKey == null || apiKey.isEmpty()) {
            response.sendError(HttpStatus.BAD_REQUEST.value(), "Missing Header: X-api-key");
            return false;
        }

        Bucket tokenBucket = pricingPlanService.resolveBucket(apiKey);
        ConsumptionProbe probe = tokenBucket.tryConsumeAndReturnRemaining(1);
        if (probe.isConsumed()) {
            response.addHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
            return true;
        } else {
            long waitForRefill = probe.getNanosToWaitForRefill() / 1_000_000_000;
            response.addHeader("X-Rate-Limit-Retry-After-Seconds", String.valueOf(waitForRefill));
            response.sendError(HttpStatus.TOO_MANY_REQUESTS.value(),
              "You have exhausted your API Request Quota"); 
            return false;
        }
    }
}
```

## <a name='Bucket4j_with_Spring_Boot'> Bucket4j with Spring Boot </a>


```java
@Configuration
public class RedisConfig  {
    
    @Bean
    public Config config() {
        Config config = new Config();
        config.useSingleServer().setAddress("redis://localhost:6379");
        return config;
    }
    
    @Bean
    public CacheManager cacheManager(Config config) {
        CacheManager manager = Caching.getCachingProvider().getCacheManager();
        cacheManager.createCache("cache", RedissonConfiguration.fromConfig(config));
        return cacheManager;
    }

    @Bean
    ProxyManager<String> proxyManager(CacheManager cacheManager) {
        return new JCacheProxyManager<>(cacheManager.getCache("cache"));
    }
}
```

Create and Cache Buckets using ProxyManager
We created the proxy manager for the purpose of storing buckets on Redis. Once a bucket is created, it needs to be cached on Redis and does not need to be created again.

To make this happen, we will replace the Bucket4j.builder() with proxyManager.builder(). ProxyManager will take care of caching the buckets and not creating them again.

ProxyManager's builder takes two parameters – a key against which the bucket will be cached and a configuration object that it will use to create the bucket.

```java
@Service
public class RateLimiter {
    //autowiring dependencies
    
    public Bucket resolveBucket(String key) {
        Supplier<BucketConfiguration> configSupplier = getConfigSupplierForUser(key);
        
        // Does not always create a new bucket, but instead returns the existing one if it exists.
        return buckets.builder().build(key, configSupplier);
    }

    private Supplier<BucketConfiguration> getConfigSupplierForUser(String key) {
        User user = userRepository.findById(userId);
        Refill refill = Refill.intervally(user.getLimit(), Duration.ofMinutes(1));
        Bandwidth limit = Bandwidth.classic(user.getLimit(), refill);
        return () -> (BucketConfiguration.builder()
                .addLimit(limit)
                .build());
    }
}
```

```java
@GetMapping("/user/{id}")
public String getInfo(@PathVariable("id") String id) {
    // gets the bucket for the user
    Bucket bucket = rateLimiter.resolveBucket(id);
    
    // tries to consume a token from the bucket
    if (bucket.tryConsume(1)) {
        return "Hello " + id;
    } else {
        return "Rate limit exceeded";
    }
}
```