# Lombok Java


- Java is the most popular object-oriented programming language but it has some drawbacks. The major drawback is to write lots of **boilerplate** code.


- Drop the dependency in the **provided** scope 
```xml
<dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.18.20</version>
        <scope>provided</scope>
    </dependency>
```



## Annotations

| Annotations       | Description                |
| :---         |    :----                                                       |
| **@AllArgsConstructor**           |   Generates an all-args constructor.                                     |
| **@Builder**                      |   The builder annotation creates a so-called 'builder' aspect to the class that is annotated or the class that contains a member which is annotated with @Builder.                                     |
| **@Builder.Default**              |   The field annotated with @Default must have an initializing expression; that expression is taken as the default to be used if not explicitly set during building.                                     |
| **@Builder.ObtainVia**            |   Put on a field (in case of @Builder on a type) or a parameter (for @Builder on a constructor or static method) to indicate how Lombok should obtain a value for this field or parameter given an instance; this is only relevant if toBuilder is true.                                     |
| **@Cleanup**                      |   Ensures the variable declaration that you annotate will be cleaned up by calling its close method, regardless of what happens.                                     |
| **@CustomLog**                    |   Causes Lombok to generate a logger field based on a custom logger implementation.                                     |
| **@Data**                         |   Generates getters for all fields, a useful toString method, and hashCode and equals implementations that check all non-transient fields.                                     |
| **@EqualsAndHashCode**            |   Generates implementations for the equals and hashCode methods inherited by all objects, based on relevant fields.                                     |
| **@EqualsAndHashCode.Exclude**    |   If present, do not include this field in the generated equals and hashCode methods.                                     |
| **@EqualsAndHashCode.Include**    |   Configure the behavior of how this member is treated in the equals and hashCode implementation; if on a method, include the method's return value as part of calculating hashCode/equality.                                     |
| **@Generated**                    |   Lombok will eventually automatically add this annotation to all generated constructors, methods, fields, and types.                                     |
| **@Getter**                       |   Put on any field to make Lombok build a standard getter.                                     |
| **@NoArgsConstructor**            |   Generates a no-args constructor.                                      |
| **@NonNull**                      |   If put on a parameter, Lombok will insert a null-check at the start of the method /constructor's body, throwing a NullPointerException with the parameter's name as a message.                                    |
| **@RequiredArgsConstructor**      |   Generates a constructor with required arguments.                                   |
| **@Setter**                       |   Put on any field to make Lombok build a standard setter.                                     |
| **@Singular**                     |   The singular annotation is used together with @Builder to create single element 'add' methods in the builder for collections.                                     |
| **@SneakyThrows**                 |   @SneakyThrow will avoid javac's insistence that you either catch or throw onward any checked exceptions that statements in your method body declare they generate.                                     |
| **@Synchronized**                 |   Almost exactly like putting the 'synchronized' keyword on a method, except will synchronize on a private internal Object, so that other code not under your control doesn't meddle with your thread management by locking on your own instance.                                     |
| **@ToString**                     |   Generates an implementation for the toString method inherited by all objects, consisting of printing the values of relevant fields.                                     |
| **@ToString.Exclude**             |   If present, do not include this field in the generated toString.                                     |
| **@ToString.Include**             |   Configure the behavior of how this member is rendered in the toString; if on a method, include the method's return value in the output.                                     |
| **@val**                          |   Use val as the type of any local variable declaration (even in a for-each statement), and the type will be inferred from the initializing expression.                                      |
| **@Value**                        |   Generates a lot of code that fits with a class that is a representation of an immutable entity.                                     |
| **@var**                          |   Use var as the type of any local variable declaration (even in a for statement), and the type will be inferred from the initializing expression (any further assignments to the variable are not involved in this type inference).                                     |
| **@With**                         |   Put on any field to make Lombok build a 'with' - a withX method that produces a clone of this object (except for 1 field which gets a new value).                                     |



### Examples

```java
@Entity
@Getter @Setter @NoArgsConstructor // <--- THIS is it
public class User implements Serializable {

    private @Id Long id; // will be set when persisting

    private String firstName;
    private String lastName;
    private int age;

    public User(String firstName, String lastName, int age) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
    }
}
```

```java
public class LoginResult {

    private final Instant loginTs;

    private final String authToken;
    private final Duration tokenValidity;
    
    private final URL tokenRefreshUrl;

    // constructor taking every field and checking nulls

    // read-only accessor, not necessarily as get*() form
}
```

```java
@RequiredArgsConstructor
@Accessors(fluent = true) @Getter
public class LoginResult {

    private final @NonNull Instant loginTs;

    private final @NonNull String authToken;
    private final @NonNull Duration tokenValidity;
    
    private final @NonNull URL tokenRefreshUrl;

```

```java
// Imagine fields were no longer final now
return new LoginResult()
  .loginTs(Instant.now())
  .authToken("asdasd")
  . // and so on
```



#### The Builder Pattern

```java
public class ApiClientConfiguration {

    private String host;
    private int port;
    private boolean useHttps;

    private long connectTimeout;
    private long readTimeout;

    private String username;
    private String password;

    // Whatever other options you may thing.

    // Empty constructor? All combinations?

    // getters... and setters?
}
```

```java
@Builder
public class ApiClientConfiguration {

    // ... everything else remains the same

}
```


```java
ApiClientConfiguration config = 
    ApiClientConfiguration.builder()
        .host("api.server.com")
        .port(443)
        .useHttps(true)
        .connectTimeout(15_000L)
        .readTimeout(5_000L)
        .username("myusername")
        .password("secret")
    .build();
```


#### Checked Exceptions Burden

```java
public String resourceAsString() {
    try (InputStream is = this.getClass().getResourceAsStream("sure_in_my_jar.txt")) {
        BufferedReader br = new BufferedReader(new InputStreamReader(is, "UTF-8"));
        return br.lines().collect(Collectors.joining("\n"));
    } catch (IOException | UnsupportedCharsetException ex) {
        // If this ever happens, then its a bug.
        throw new RuntimeException(ex); <--- encapsulate into a Runtime ex.
    }
}
```


```java
@SneakyThrows
public String resourceAsString() {
    try (InputStream is = this.getClass().getResourceAsStream("sure_in_my_jar.txt")) {
        BufferedReader br = new BufferedReader(new InputStreamReader(is, "UTF-8"));
        return br.lines().collect(Collectors.joining("\n"));
    } 
}
```


#### Annotate Our Class to Get a Logger

```java
public class ApiClientConfiguration {

    private static Logger LOG = LoggerFactory.getLogger(ApiClientConfiguration.class);

    // LOG.debug(), LOG.info(), ...

}
```


```java
@Slf4j      // or: @Log @CommonsLog @Log4j @Log4j2 @XSlf4j
public class ApiClientConfiguration {

    // log.debug(), log.info(), ...

}
```




































































