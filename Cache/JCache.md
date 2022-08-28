# JCache Cache

- [JCache Cache](#JCache_Cache)



## <a name='JCache_Cache'> JCache Cache </a>


- JCache is the standard caching API for Java.

To use JCache, we need to add the following dependency to our pom.xml:
```xml
<dependency>
    <groupId>javax.cache</groupId>
    <artifactId>cache-api</artifactId>
    <version>1.1.1</version>
</dependency>
```

We also need to add an implementation of the API to our pom.xml; 
for example, adding "hazelcast" cache implementation
```xml
<dependency>
    <groupId>com.hazelcast</groupId>
    <artifactId>hazelcast</artifactId>
    <version>5.1.1</version>
</dependency>
```

#### JCache Implementations
JCache is implemented by various caching solutions:
- JCache Reference Implementation
- Hazelcast
- Oracle Coherence
- Terracotta Ehcache
- Infinispan


#### Don't Use JCache 

unlike other reference implementations, 
**it's not recommended to use JCache Reference Implementation in production since it causes some concurrency issues.**

#### JCache Components

##### Cache interface 

- **get()** – takes the key of an element as a parameter and returns the value of the element; it returns null if the key does not exist in the Cache
- **getAll()** – multiple keys can be passed to this method as a Set; the method returns the given keys and associated values as a Map
- **getAndRemove()** – the method retrieves a value using its key and removes the element from the Cache
- **put()** – inserts a new item in the Cache
- **clear()** – removes all elements in the Cache
- **containsKey()** – checks if a Cache contains a particular key


##### CacheManager
CacheManager is one of the most important interfaces of the API. It enables us to establish, configure and close Caches.

##### CachingProvider
CachingProvider is an interface which allows us to create and manage the lifecycle of CacheManagers.

##### Configuration
Configuration is an interface that enables us to configure Caches. It has one concrete implementation – MutableConfiguration and a subinterface – CompleteConfiguration.

#####  Creating a Cache

```java
CachingProvider cachingProvider = Caching.getCachingProvider();
CacheManager cacheManager = cachingProvider.getCacheManager();
MutableConfiguration<String, String> config = new MutableConfiguration<>();
Cache<String, String> cache = cacheManager.createCache("simpleCache", config);
cache.put("key1", "value1");
cache.put("key2", "value2");
cacheManager.close();
```

If we do not provide any implementation of JCache in our pom.xml, the following exception will be thrown:

```
javax.cache.CacheException: No CachingProviders have been configured
```









