# Guava Cache

- [What is Guava Cache](#What_is_Guava_Cache)
- [Eviction Policies](#Eviction_Policies)
- [Documentation](#Documentation)
- [spring integration](#spring_integration)
- [spring-boot integration](#spring-boot_integration)


## <a name='What_is_Guava_Cache'> What is Guava Cache </a>

Guava Cache is a library provided by Google to implement a simple in-process Cache Store. Guava Cache is an incremental cache, more like ConcurrentMap, with an additional feature that invalidates entries automatically upon certain configurable expiry conditions.

**Guava caches are segmented into concurrencyLevel different hash tables to allow multiple concurrent reads and writes. The default concurrencyLevel is 4. Basically, if your maximumSize is set to 100, then that actually only results in each of the four segments getting a maximumSize of 25.**   
This is why the maximumSize documentation states:

> Note that the cache may evict an entry before this limit is exceeded. As the cache size grows close to the maximum, the cache evicts entries that are less likely to be used again.


## <a name='Eviction_Policies'> Eviction Policies </a>

1. Eviction by Size
2. Eviction by Time - TTL expireAfterAccess
3. Eviction by Time - TTL expireAfterWrite


```java
LoadingCache<Key, Value> cache = CacheBuilder.newBuilder()
       .maximumSize(1000)    
       .expireAfterWrite(10, TimeUnit.MINUTES)
       .removalListener(MY_LISTENER)
       .build(
           new CacheLoader<Key, Value>() {
             @Override
             public value load(Key key) throws AnyException {
               return createExpensiveGraph(key);
             }
           });
```


## <a name='Documentation'> Documentation </a>

**https://github.com/google/guava/wiki/CachesExplained**

## <a name='spring_integration'> spring integration </a>

```java
public class CacheStore<T> {
    private Cache<String, T> cache;

    //Constructor to build Cache Store
    public CacheStore(int expiryDuration, TimeUnit timeUnit) {
        cache = CacheBuilder.newBuilder()
                .expireAfterWrite(expiryDuration, timeUnit)
                .concurrencyLevel(Runtime.getRuntime().availableProcessors())
                .build();
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

**Caffeine** is a Java 8 rewrite of **Guava**’s cache that supersedes support for **Guava**.
You can use [**Caffeine**](./Caffeine.md) instead




