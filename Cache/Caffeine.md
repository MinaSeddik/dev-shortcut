# Caffeine Cache

- [Caffeine versus Guava cache](#Caffeine_versus_Guava_cache)
- [Eviction Policies](#Eviction_Policies)
- [Documentation](#Documentation)
- [spring integration (without annotation)](#spring_integration_no_annotation)
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


## <a name='Documentation'> Documentation </a>

**https://github.com/ben-manes/caffeine/wiki**


## <a name='spring_integration_no_annotation'> spring integration (without annotation) </a>

```java

public class CacheStore<T> {
    private Cache<String, T> cache;

    //Constructor to build Cache Store
    public CacheStore(int expiryDuration, TimeUnit timeUnit) {
        LoadingCache<String, Value> graphs = Caffeine.newBuilder()
                                                    .maximumSize(10000)
                                                    .expireAfterWrite(Duration.ofMinutes(5))
                                                    .refreshAfterWrite(Duration.ofMinutes(1))
                                                    .build(key -> createExpensiveValue(key));
    }

    //Method to fetch previously stored record using record key
    public T get(String key) {
        return cache.getIfPresent(key);
    }

    //Method to put a new record in Cache Store with record key
    public void add(String key, T value) {
        if(key != null && value != null) {
            cache.put(key, value);
            System.out.println("Record stored in " + value.getClass().getSimpleName() + " Cache with Key = " + key);
        }
    }

    public void remove(String key) {
        return cache.invalidate(key);
    }

    public void removeAll() {
        return cache.invalidateAll();
    }

}
```


```java
@Configuration
public class CacheStoreBeans {

    @Bean
    public CacheStore<Employee> employeeCache() {
        return new CacheStore<Employee>(120, TimeUnit.SECONDS);
    }

    @Bean
    public CacheStore<Department> employeeCache() {
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

**https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#io.caching.provider.caffeine**

Caffeine is a Java 8 rewrite of Guava’s cache that supersedes support for Guava. If Caffeine is present, a CaffeineCacheManager (provided by the spring-boot-starter-cache “Starter”) is auto-configured. Caches can be created on startup by setting the spring.cache.cache-names property and can be customized by one of the following (in the indicated order):

1. A cache spec defined by spring.cache.caffeine.spec
2. A com.github.benmanes.caffeine.cache.CaffeineSpec bean is defined
3. A com.github.benmanes.caffeine.cache.Caffeine bean is defined

For instance, the following configuration creates cache1 and cache2 caches with a maximum size of 500 and a time to live of 10 minutes


in **pom.xml**
```xml
 <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-cache</artifactId>
 </dependency>
 <dependency>
            <groupId>com.github.ben-manes.caffeine</groupId>
            <artifactId>caffeine</artifactId>
 </dependency>
```

in **application.properties**
```
spring.cache.type=caffeine
spring.cache.cache-names=cache1,cache2
spring.cache.caffeine.spec=maximumSize=500,expireAfterAccess=600s
```

If a com.github.benmanes.caffeine.cache.CacheLoader bean is defined, it is automatically associated to the CaffeineCacheManager. Since the CacheLoader is going to be associated with all caches managed by the cache manager, it must be defined as CacheLoader<Object, Object>. The auto-configuration ignores any other generic type.


#### Set a different specification per cache using caffeine in spring boot?


```java
@Bean
public CaffeineCache cacheA() {
    return new CaffeineCache("CACHE_A",
            Caffeine.newBuilder()
                    .expireAfterAccess(1, TimeUnit.DAYS)
                    .build());
}

@Bean
public CaffeineCache cacheB() {
    return new CaffeineCache("CACHE_B",
            Caffeine.newBuilder()
                    .expireAfterWrite(7, TimeUnit.DAYS)
                    .recordStats()
                    .build());
}
```

Just expose your custom caches as beans. They are automatically added to the **CaffeineCacheManager**


```java
@Configuration
@EnableCaching
public class CachingConfig {

    @Bean
    public CaffeineCache cacheA() {
        return new CaffeineCache("CACHE_A",
                Caffeine.newBuilder()
                        .expireAfterAccess(1, TimeUnit.DAYS)
                        .build());
    }
    
    @Bean
    public CaffeineCache cacheB() {
        return new CaffeineCache("CACHE_B",
                Caffeine.newBuilder()
                        .expireAfterWrite(7, TimeUnit.DAYS)
                        .recordStats()
                        .build());
    }
}
```

OR



```java
@Configuration
@EnableCaching
public class CachingConfig {

    public CaffeineCache cacheA() {
        return new CaffeineCache("CACHE_A",
                Caffeine.newBuilder()
                        .expireAfterAccess(1, TimeUnit.DAYS)
                        .build());
    }

    public CaffeineCache cacheB() {
        return new CaffeineCache("CACHE_B",
                Caffeine.newBuilder()
                        .expireAfterWrite(7, TimeUnit.DAYS)
                        .recordStats()
                        .build());
    }

    @Bean                       // <--- need to be tested 
    public CacheManager cacheManager() {
        CaffeineCacheManager caffeineCacheManager = new CaffeineCacheManager();
        caffeineCacheManager.registerCustomCache(cacheA());
        caffeineCacheManager.registerCustomCache(cacheB());
        return caffeineCacheManager;
    }

}
```

Finally follow [**spring-cache documentations**](../Spring/spring-cache.md)


