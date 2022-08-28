# Spring boot Framework


- [@SpringBootApplication](#spring_boot_application) 
- [spring-boot Full documentation](#spring_boot_Full_documentation)  
- [Conditions](#conditions)  

https://start.spring.io/

- Spring boot startup class

- @RunWith(SpringRunner.class)
- @SpringBootTest
- @MockBean
- @JsonTest
- @WebMvcTest
@SpringBootTest

- @JdbcTest
- @AutoConfigureTestDatabase(replace=Replace.NONE)
- RestTemplate  vs TestRestTemplate 
- Tomcat configuration (port, ssl, context path, ...)
- CommandLineRunner 
- Unit test in details: https://spring.io/guides/gs/testing-web/
- move condional annotation here ....


## <a name='spring_boot_application'> @SpringBootApplication </a>

We use this annotation to mark **the main class of a Spring Boot application** to :
```java
@SpringBootApplication
class VehicleFactoryApplication {

    public static void main(String[] args) {
        SpringApplication.run(VehicleFactoryApplication.class, args);
    }
}
```
**@SpringBootApplication** for enabling Spring Boot's auto-configuration feature.

**@SpringBootApplication** encapsulates ***@Configuration, @EnableAutoConfiguration, and @ComponentScan*** annotations with their default attributes.

**@EnableAutoConfiguration** annotation tells Spring Boot to "guess" how you will want to configure Spring, based on the jar dependencies that you have added. For example, If HSQLDB is on your classpath, and you have not manually configured any database connection beans, then Spring will auto-configure an in-memory database.

If you have been using Spring Boot for a long time, then you know that we need to annotate our Application class or Main class with quite a lot of annotations to start with, for example:

1. **@Configuration** to enable Java-based configuration
2. **@ComponentScan** to enable component scanning.
3. **@EnableAutoConfiguration** to enable Spring Boot's auto-configuration feature.
But now you can do all that by just annotating your Application class with **@SpringBootApplication**.

another example:
```
@SpringBootApplication
public class Hello implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(Hello.class);

    public static void main(String args[]) {
        SpringApplication.run(Hello.class);
    }

    @Override
    public void run(String...args) throws Exception {

        RestTemplate restTemplate = new RestTemplate();
        Country country = restTemplate.getForObject("http://www.services.groupkt.com/country/get/iso2code/US", Country.class);
        log.info(country.toString());
    }
}
```

## <a name='spring_boot_Full_documentation'> spring-boot Full documentation </a>

**https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#legal**



## <a name='conditions'> Conditions </a>

#### @ConditionalOnClass

Using these conditions, Spring will only use the marked auto-configuration bean if the class in the annotation's argument is present/absent:
```
@Configuration
@ConditionalOnClass(DataSource.class)
class MySQLAutoconfiguration {
    //...
}
```

#### @ConditionalOnBean and @ConditionalOnMissingBean

We can use these annotations when we want to define conditions based on the presence or absence of a specific bean:
```
@Bean
@ConditionalOnBean(name = "dataSource")
LocalContainerEntityManagerFactoryBean entityManagerFactory() {
    // ...
}
```

#### @ConditionalOnProperty

With this annotation, we can make conditions on the values of properties:
```
@Bean
@ConditionalOnProperty(
    name = "usemysql", 
    havingValue = "local"
)
DataSource dataSource() {
    // ...
}
```

#### @ConditionalOnResource

We can make Spring to use a definition only when a specific resource is present:
```
@ConditionalOnResource(resources = "classpath:mysql.properties")
Properties additionalProperties() {
    // ...
}
```

#### @ConditionalOnWebApplication and @ConditionalOnNotWebApplication

With these annotations, we can create conditions based on if the current application is or isn't a web application:
```
@ConditionalOnWebApplication
HealthCheckController healthCheckController() {
    // ...
}
```

#### @ConditionalExpression

We can use this annotation in more complex situations. Spring will use the marked definition when the SpEL expression is evaluated to true:
```
@Bean
@ConditionalOnExpression("${usemysql} && ${mysqlserver == 'local'}")
DataSource dataSource() {
    // ...
}
```

#### @Conditional

For even more complex conditions, we can create a class evaluating the custom condition. We tell Spring to use this custom condition with @Conditional:
```
@Service
@Conditional(Java8Condition.class)
public class Java8DependedService {
    // ...
}
```

It's used to indicate whether a given component is eligible for registration based on a defined condition.


```gitignore
class Java8Condition implements Condition {
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        return JavaVersion.getJavaVersion().equals(JavaVersion.EIGHT);
    }
}
```

- Combining Conditions
```gitignore
class Java8OrJava9 extends AnyNestedCondition {
    
    Java8OrJava9() {
        super(ConfigurationPhase.REGISTER_BEAN);
    }
    
    @Conditional(Java8Condition.class)
    static class Java8 { }
    
    @Conditional(Java9Condition.class)
    static class Java9 { }
    
}
```

```
@Service
@Conditional({IsWindowsCondition.class, Java8Condition.class})
@ConditionalOnJava(JavaVersion.EIGHT)
public class LoggingService {
    // ...
}
```



##### Declaring Conditions
The most common usage would be to include or exclude the whole configuration class:
```
@Configuration
@Conditional(IsDevEnvCondition.class)
class DevEnvLoggingConfiguration {
    // ...
}
```

Or just a single bean:
```
@Configuration
class DevEnvLoggingConfiguration {
    
    @Bean
    @Conditional(IsDevEnvCondition.class)
    LoggingService loggingService() {
        return new LoggingService();
    }
}
```

By doing so, we can base the behavior of our application on given conditions. For instance, the type of environment or specific needs of our clients. In the above example, we initialize additional logging services only for the development environment.

Another way of making the component conditional would be to place the condition directly on the component class:

```
@Service
@Conditional(IsDevEnvCondition.class)
class LoggingService {
    // ...
}
```

##### more examples: 
```
@Service
@ConditionalOnProperty(
  value="logging.enabled", 
  havingValue = "true", 
  matchIfMissing = true)
class LoggingService {
    // ...
}
```

```
@Service
@ConditionalOnExpression(
  "${logging.enabled:true} and '${logging.level}'.equals('DEBUG')"
)
class LoggingService {
    // ...
}
```

```
@Service
@ConditionalOnBean(CustomLoggingConfiguration.class)
class LoggingService {
    // ...
}
```

```
@Service
@ConditionalOnJava(JavaVersion.EIGHT)
class LoggingService {
    // ...
}
```

```
@Configuration
@ConditionalOnWarDeployment
class AdditionalWebConfiguration {
    // ...
}
```