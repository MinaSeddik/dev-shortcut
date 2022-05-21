# Spring Cache


- [The Cache Abstraction?](#The_Cache_Abstraction)
- [Documentation](#Documentation)
- [Cache Providers](#Cache_Providers)
- [Spring Cache Logging](#Spring_Cache_Logging)
- [Enable Caching](#Enable_Caching)
- [Use Caching With Annotations](#Use_Caching_With_Annotations)
    - [@Cacheable](#Cacheable) 
    - [@CachePut](#CachePut) 
    - [@CacheEvict](#CacheEvict) 
    - [Customizing Key Generation](#Customizing_Key_Generation) 
    - [@Caching](#Caching) 
    - [@CacheConfig](#CacheConfig) 
    - [Condition parameter](#Condition_Parameter) 



## <a name='The_Cache_Abstraction'> The Cache Abstraction? </a>

use the Caching Abstraction in Spring, and generally improve the performance of our system.

The core caching abstraction provided by Spring resides in the spring-context module. So when using Maven, our pom.xml should contain the following dependency:

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>5.3.3</version>
</dependency>
```

Interestingly, there is another module named spring-context-support, which sits on top of the spring-context module and provides a few more CacheManagers backed by the likes of EhCache or Caffeine. If we want to use those as our cache storage, then we need to use the spring-context-support module instead:

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context-support</artifactId>
    <version>5.3.3</version>
</dependency>
```

Since the spring-context-support module transitively depends on the spring-context module, there is no need for a separate dependency declaration for the spring-context.

### spring-boot

If we use Spring Boot, then we can utilize the **spring-boot-starter-cache** starter package to easily add the caching dependencies:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
    <version>2.4.0</version>
</dependency>
```

Under the hood, the starter brings the **spring-context-support** module.



## <a name='Documentation'> Documentation </a>

**https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#io.caching**


## <a name='Cache_Providers'> Cache Providers </a>

Spring Boot supports several cache providers.    
If Spring Boot finds a cache provider on the classpath, it tries to find a default configuration for this provider. 
If it doest find a provider, it configures the **Simple provider**, which is just a **ConcurrentHashMap**.

If you have not defined a bean of type CacheManager or a CacheResolver named cacheResolver , Spring Boot tries to detect the following providers (in the indicated order):
1. Generic
2. JCache (JSR-107) (EhCache 3, Hazelcast, Infinispan, and others)
3. EhCache 2.x
4. Hazelcast
5. Infinispan
6. Couchbase
7. Redis
8. Caffeine
9. Cache2k
10. Simple   (***default provider***)

for more info, visit:      
https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#io.caching


## <a name='Spring_Cache_Logging'> Spring Cache Logging </a>

in **applications.properties**

```bash
logging.level.org.springframework.cache=TRACE
```

example:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%msg%n</pattern>
        </encoder>
    </appender>

    <logger name="org.springframework.cache" level="trace">
        <appender-ref ref="STDOUT" />
    </logger>
</configuration>
```


## <a name='Enable_Caching'> Enable Caching </a>


We can enable the caching feature simply by adding the **@EnableCaching** annotation to any of the configuration classes:

Example:

```java
@Configuration
@EnableCaching
public class CachingConfig {

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("addresses");
    }
}
```

another example:

```java
@Component
public class SimpleCacheCustomizer 
  implements CacheManagerCustomizer<ConcurrentMapCacheManager> {

    @Override
    public void customize(ConcurrentMapCacheManager cacheManager) {
        cacheManager.setCacheNames(asList("users", "transactions"));
    }
}
```

yet another one:

```java
@Configuration
@EnableCaching
public class CachingConfig {

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();
        cacheManager.setCaches(Arrays.asList(
          new ConcurrentMapCache("directory"), 
          new ConcurrentMapCache("addresses")));
        return cacheManager;
    }
}
```

by xml configuration:
```xml
<beans>
    <cache:annotation-driven />

    <bean id="cacheManager" class="org.springframework.cache.support.SimpleCacheManager">
        <property name="caches">
            <set>
                <bean 
                  class="org.springframework.cache.concurrent.ConcurrentMapCacheFactoryBean" 
                  name="addresses"/>
            </set>
        </property>
    </bean>
</beans>
```

## <a name='Use_Caching_With_Annotations'> Use Caching With Annotations </a>

### <a name='Cacheable'> @Cacheable </a>

The simplest way to enable caching behavior for a method is to demarcate it with @Cacheable, and parameterize it with the name of the cache where the results would be stored:

```java
@Cacheable("addresses")
public String getAddress(Customer customer) {
...
}
```


- The getAddress() call will first check the cache addresses before actually invoking the method and then caching the result.
- The value is found in the cache, and the method will not be executed.

While in most cases one cache is enough, the Spring framework also supports multiple caches to be passed as parameters:

```java
@Cacheable({"addresses", "directory"})
public String getAddress(Customer customer) {...}
```

The data in the cache is stored using a key-value pattern.   
**Spring Cache uses the parameters of the method as key and the return value as a value in the cache.**

```java
@Service
class CarService {

  public Car saveCar(Car car) {
    return carRepository.save(car);
  }

  @Cacheable(value = "cars")
  public Car get(UUID uuid) {
    return carRepository.findById(uuid)
      .orElseThrow(() -> new IllegalStateException("car not found"));
  }
   
  // other methods omitted. 
}
```

In the following example, we have cached the return value of the method studentInfo() in cacheStudentInfo, and id is the unique key that identifies each entry in the cache.

```java
@Cacheable(value="cacheStudentInfo", key="#id")  
public List studentInfo()  
{  
//some code   
return studentDetails;  
}  
```

### <a name='CachePut'> @CachePut </a>

**pdate the entries whenever we alter them.**

With the @CachePut annotation, we can update the content of the cache without interfering with the method execution. That is, the method will always be executed and the result cached:

**The difference between @Cacheable and @CachePut is that @Cacheable will skip running the method, whereas @CachePut will actually run the method and then put its results in the cache.**

```java
@Service
class CarService {

  @CachePut(value = "cars", key = "#car.id")
  public Car update(Car car) {
    if (carRepository.existsById(car.getId())) {
      return carRepository.save(car);
    }
    throw new IllegalArgumentException("A car must have an id");
  }
  
  // other methods omitted.
}
```

**The body of the update() method will always be executed.** 
Spring will put the result of the method into the cache. In this case, we also defined the key that should be used to update the data in the cache.

### <a name='CacheEvict'> @CacheEvict </a>

@CacheEvict annotation to indicate the removal of one or more/all values so that fresh values can be loaded into the cache again:


Remove all entries from the cache
```java
@CacheEvict(value="addresses", allEntries=true)
public String deleteAddress(Address address) {...}
```

we use **allEntries=true** to remove all entries


```java
@Service
class CarService {

  @CacheEvict(value = "cars", key = "#uuid")
  public void delete(UUID uuid) {
    carRepository.deleteById(uuid);
  }
  // Other methods omitted.
}
```

```java
@CacheEvict(key="#student.stud_name")  
public String deleteNames(Student student)   
{  
//some code  
} 
```

### <a name='Customizing_Key_Generation'> Customizing Key Generation </a>

Spring Cache uses **SimpleKeyGenerator** to calculate the key to be used for retrieving or updating an item in the cache from the method parameters. It’s also possible to define a custom key generation by specifying a **SpEL expression** in the key attribute of the @Cacheable annotation.

If that is not expressive enough for our use case, we can use a different key generator. For this, we implement the interface KeyGenerator and declare an instance of it as a Spring bean:

```java
@Configuration
@EnableCaching
class EmbeddedCacheConfig {

  @Bean
  public KeyGenerator carKeyGenerator() {
    return new CarKeyGenerator();
  }

  // other methods omitted
}
```

and use it like this
```java
@Service
class CarService {

  @Cacheable(value = "cars", keyGenerator = "carKeyGenerator")   // use custom keyGenerator
  public Car get(UUID uuid) {
    return carRepository.findById(uuid)
        .orElseThrow(() -> new IllegalStateException("car not found"));
  }
   
   // other methods omitted. 
}
```

### <a name='Caching'> @Caching </a>

What if we want to use multiple annotations of the same type for caching a method? 

Let's look at an **incorrect example**:
```java
@CacheEvict("addresses")
@CacheEvict(value="directory", key=customer.name)
public String getAddress(Customer customer) {...}
```


The workaround to the above issue would be:
```java
@Caching(evict = { 
  @CacheEvict("addresses"), 
  @CacheEvict(value="directory", key="#customer.name") })
public String deleteAddress(Address address) {...}
```

we can **group multiple caching annotations with @Caching**, and use it to implement our own customized caching logic.


### <a name='CacheConfig'> @CacheConfig </a>

With the @CacheConfig annotation, we can **streamline some of the cache configuration into a single place at the class level**, so that we don't have to declare things multiple times:

```java
@CacheConfig(cacheNames={"addresses"})
public class CustomerDataService {

    @Cacheable
    public String getAddress(Customer customer) {...}
```

### <a name='Condition_Parameter'> Condition parameter </a>

using a condition parameter that takes a SpEL expression

```java
@CachePut(value="addresses", condition="#customer.name=='Tom'")
public String getAddress(Customer customer) {...}
```


We can also control the caching based on the output of the method rather than the input via the **unless** parameter:

```java
@CachePut(value="addresses", unless="#result.length()<64")
public String getAddress(Customer customer) {...}
```



