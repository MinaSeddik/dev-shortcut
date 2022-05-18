# Spring boot Framework


- [@SpringBootApplication](#spring_boot_application) 


- [Auto-Configuration Conditions](#auto_configuration_conditions)
- Spring boot startup class

- @RunWith(SpringRunner.class)
- @SpringBootTest
- @MockBean
- @JsonTest
- @WebMvcTest
- @JdbcTest
- @AutoConfigureTestDatabase(replace=Replace.NONE)
- RestTemplate  vs TestRestTemplate 
- Tomcat configuration (port, ssl, context path, ...)
- CommandLineRunner 
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
