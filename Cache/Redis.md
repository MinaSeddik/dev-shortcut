# Redis Cache

- [Caffeine versus Guava cache](#Caffeine_versus_Guava_cache)
- [Eviction Policies](#Eviction_Policies)



- [spring integration](#spring_integration)
- [spring-boot integration](#spring-boot_integration)


## <a name='Caffeine_versus_Guava_cache'> Caffeine versus Guava cache </a>

- The main difference is because Caffeine uses **ring buffers** to record & replay events, whereas Guava uses **ConcurrentLinkedQueue**. The intent was always to migrate Guava over and it made sense to start simpler, but unfortunately there was never interest in accepting those changes. The ring buffer approach avoids allocation, is bounded (lossy), and cheaper to operate against.
- Caffeine optimizes for size-based and also gains an improved hash table, whereas Guava handles reference caching more elegantly.
- Caffeine doesn't create its own threads for maintenance or expiration. It does defer the cost to the commonPool, which slightly improves user-facing latencies but not throughput.


To use Caffeine, We need to add the caffeine dependency to our pom.xml:
```xml
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
    <version>2.5.5</version>
</dependency>
```


## <a name='Eviction_Policies'> Eviction Policies </a>

1. Eviction by Size             **maximumSize(100)**  <-- max 100 entry
2. Eviction by Time - TTL       **expireAfterAccess(5, TimeUnit.MINUTES)**
3. Eviction by Time - TTL       **expireAfterWrite(1, TimeUnit.MINUTES)**
3. Custom policy — an expiration time is calculated for each entry individually by the Expiry implementation


```java
Cache<Key, Value> cache = Caffeine.newBuilder()
                                  .expireAfterWrite(1, TimeUnit.MINUTES)
                                  .maximumSize(100)
                                  .build();
```

```java
cache = Caffeine.newBuilder().expireAfter(new Expiry<Key, Value>() {
    @Override
    public long expireAfterCreate(Key key, Value value, long currentTime) {
        return value.getData().length() * 1000;
    }
    @Override
    public long expireAfterUpdate(Key key, Value value, long currentTime, long currentDuration) {
        return currentDuration;
    }
    @Override
    public long expireAfterRead(Key key, Value value, long currentTime, long currentDuration) {
        return currentDuration;
    }
}).build(k -> DataObject.get("Data for " + k));
```



## <a name='spring_integration'> spring integration </a>

```java
@Bean
public RedisTemplate<?, ?> redisTemplate(RedisConnectionFactory connectionFactory) {
  RedisTemplate<?, ?> template = new RedisTemplate<>();
  template.setConnectionFactory(connectionFactory);

  return template;
}
```

  
OR

```java
@Bean
public RedisTemplate<?, ?> redisTemplate(RedisConnectionFactory connectionFactory) {
    RedisTemplate<?, ?> redisTemplate = new RedisTemplate<>();
    redisTemplate.setKeySerializer(new StringRedisSerializer()); // or json
    redisTemplate.setValueSerializer(new GenericToStringSerializer<Long>(Long.class));
    redisTemplate.setExposeConnection(true);
    redisTemplate.setConnectionFactory(connectionFactory);
    redisTemplate.afterPropertiesSet();

    return template;
}
```
  
OR

```java
@Bean
public RedisTemplate<String, Object> redisTemplate() {
    RedisTemplate<String, Object> template = new RedisTemplate<>();
    template.setConnectionFactory(jedisConnectionFactory());
    return template;
}
```  
  
```java
@Bean 
public RedisConnectionFactory redisConnectionFactory(){
  JedisConnectionFactory jedisConnectionFactory = new JedisConnectionFactory();
  cf.setHostName("localhost");
  cf.setPort(6379);
  cf.afterPropertiesSet();
  return cf;
}
```


in **applications.properties**

```bash
spring.redis.host=localhost
spring.redis.port=6379
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration
```

OR

```bash
spring.redis.database=0
spring.redis.host=localhost
spring.redis.port=16379
spring.redis.password=mypass
spring.redis.timeout=60000
```


#### Using the redis template

```java
public class RedisCacheStore<T> {

    private RedisTemplete redisTemplete;
     
    //Method to fetch previously stored record using record key
    public T get(String key) {
        return redisTemplete.optForValue().get(key);
    }

    //Method to put a new record in Cache Store with record key
    public void add(String key, T value) {
        if(key != null && value != null) {
            redisTemplete.optForValue().set(key, value);
            System.out.println("Record stored in " + value.getClass().getSimpleName() + " Cache with Key = " + key);
        }
    }

    public void remove(String key) {
        redisTemplete.delete(key);
    }

    public void removeAll() {
        redisTemplete.delete("*");
    }

}
```


```java
@Configuration
public class CacheStoreBeans {

    @Bean
    public RedisTemplate<String, Employee> redisTemplate() {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(jedisConnectionFactory());
        return template;
    }

    @Bean
    public CacheStore<Employee> employeeCache(RestTemplete restTemplete) {
        return new CacheStore<Employee>(120, TimeUnit.SECONDS);
    }

    @Bean
    public CacheStore<Department> employeeCache(RestTemplete restTemplete) {
        return new CacheStore<Department>(120, TimeUnit.SECONDS);
    }

    // add more Cache beans as requested
}
```


```java
@RestController
public class ApiController {

    @Autowired
    EmployeeService employeeService;
    
    @Autowired
    CacheStore<Employee> employeeCache;     // (1) <----------- autowire Cache bean

    
    @GetMapping("/employee/{id}")
    public Employee searchEmployeeByID(@PathVariable String id) {
        System.out.println("Searching Employee by ID  : " + id);

        //Search Employee record in Cache
        Employee cachedEmpRecord = employeeCache.get(id);       // (2) <----------- check if the key is cached
        if(cachedEmpRecord != null) {
            System.out.println("Employee record found in cache : " + cachedEmpRecord.getName());
            return cachedEmpRecord;
        }
        
        //Fetch Employee details from backend service
        Employee EmpRecordFromBackendService = employeeService.getEmployeeByID(id);
        
        //Store Employee record in Cache
        employeeCache.add(id, EmpRecordFromBackendService);
        
        return EmpRecordFromBackendService;
    }

}
```

Notes:     
- **on update**: update the value of the cache 

```java
employeeCache.add(id, emplyee);
```

    
- **on delete**: remove cached entry   

```java
employeeCache.remove(id);
```

## <a name='spring-boot_integration'> spring-boot integration </a>

**https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#io.caching.provider.redis**

in **pom.xml**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
    <version>2.4.3</version>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
    <version>2.4.3</version>
</dependency>
```

in **application.properties**
```
spring.cache.cache-names=cache1,cache2
spring.cache.caffeine.spec=maximumSize=500,expireAfterAccess=600s
```

#### Set a different specification per cache using caffeine in spring boot?

```java
@Configuration(proxyBeanMethods = false)
public class MyRedisCacheManagerConfiguration {

    @Bean
    public RedisCacheManagerBuilderCustomizer myRedisCacheManagerBuilderCustomizer() {
        return (builder) -> builder
                .withCacheConfiguration("cache1", RedisCacheConfiguration
                        .defaultCacheConfig().entryTtl(Duration.ofSeconds(10)))
                .withCacheConfiguration("cache2", RedisCacheConfiguration
                        .defaultCacheConfig().entryTtl(Duration.ofMinutes(1)));

    }

}
```

- **Note:**   
**The default is true meaning each @Bean method will get proxied through CgLib. Each call to the method will pass through the proxy and assuming singleton scoped beans, it will return the same instance each time the method is called.   
When setting it to false no such proxy method will be created and each call to the method will create a new instance of the bean. It will act just as a factory method. This is basically the same as the so called Bean Lite Mode, or @Bean methods on non-@Configuration annotated classes.**


Here is full detailed Redis configuration
```java
@Configuration(proxyBeanMethods = false)
@EnableCaching
public class MyRedisCacheManagerConfiguration {

    @Bean
    public RedisCacheManagerBuilderCustomizer myRedisCacheManagerBuilderCustomizer() {

        ObjectMapper objectMapper = new Jackson2ObjectMapperBuilder()
                .failOnEmptyBeans(false)
                .failOnUnknownProperties(false)
                .serializationInclusion(JsonInclude.Include.NON_NULL)
//                .serializationInclusion(JsonInclude.Include.NON_EMPTY)
                .indentOutput(true)
                .dateFormat(new SimpleDateFormat("yyyy-MM-dd"))
                .modules(
                        // Optional
                        new Jdk8Module(),
                        // Dates/Times
                        new JavaTimeModule()
                )
                .featuresToDisable(
                        SerializationFeature.WRITE_DATES_AS_TIMESTAMPS,
                        DeserializationFeature.READ_DATE_TIMESTAMPS_AS_NANOSECONDS,
                        SerializationFeature.WRITE_DATE_TIMESTAMPS_AS_NANOSECONDS
                ).build();

        RedisCacheConfiguration cache3Config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(1))
                .disableCachingNullValues()
                .disableKeyPrefix()
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer(objectMapper)));


        return (builder) -> builder
                .withCacheConfiguration("cache1", RedisCacheConfiguration
                        .defaultCacheConfig().entryTtl(Duration.ofSeconds(10)))
                .withCacheConfiguration("cache2", RedisCacheConfiguration
                        .defaultCacheConfig().entryTtl(Duration.ofMinutes(1)))
                .withCacheConfiguration("cache3", cache3Config);

    }

}
```


Finally follow [**spring-cache documentations**](../Spring/spring-cache.md)


