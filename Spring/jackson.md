# JSON Jackson Annotations


### [Spring integration](#Spring_integration)

## Jackson Annotations:

##### Jackson Serialization Annotations  
- [@JsonAnyGetter](#JsonAnyGetter) 
- [@JsonGetter](#JsonGetter) 
- [@JsonPropertyOrder](#JsonPropertyOrder) 
- [@JsonRawValue](#JsonRawValue) 
- [@JsonValue](#JsonValue) 
- [@JsonRootName](#JsonRootName) 
- [@JsonSerialize](#JsonSerialize) 


##### Jackson Deserialization Annotations
- [@JsonCreator](#JsonCreator) 
- [@JacksonInject ](#JacksonInject) 
- [@JsonAnySetter](#JsonAnySetter) 
- [@JsonSetter](#JsonSetter) 
- [@JsonDeserialize](#JsonDeserialize) 
- [@JsonAlias](#JsonAlias) 


##### Jackson Property Inclusion Annotations
- [@JsonIgnoreProperties](#JsonIgnoreProperties) 
- [@JsonIgnore](#JsonIgnore) 
- [@JsonIgnoreType ](#JsonIgnoreType) 
- [@JsonInclude](#JsonInclude) 
- [@JsonAutoDetect](#JsonAutoDetect) 


##### Jackson General Annotations
- [@JsonProperty](#JsonProperty) 
- [@JsonFormat](#JsonFormat) 
- [@JsonUnwrapped](#JsonUnwrapped) 


## <a name='Spring_integration'> Spring integration </a>


When using JSON format, Spring Boot will use an ObjectMapper instance to serialize responses and deserialize requests.

By default, the Spring Boot configuration will disable the following:
- MapperFeature.DEFAULT_VIEW_INCLUSION
- DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES
- SerializationFeature.WRITE_DATES_AS_TIMESTAMPS

```java
public class Coffee {

    private String name;
    private String brand;
    private LocalDateTime date;

   //getters and setters

```

By default, it will be serialized as 
```json
{
  "name": null,
  "brand": "Lavazza",
  "date": "2020-11-16T10:21:35.974"
}
```

But, We would like to exclude null values and to have a custom date format (dd-MM-yyyy HH:mm). 
to be like
```json
{
  "brand": "Lavazza",
  "date": "04-11-2020 10:34"
}
```

### Customizing the Default ObjectMapper

#### Application Properties and Custom Jackson Module

The simplest way to configure the mapper is via application properties.

Here's the general structure of the configuration:
> spring.jackson.<category_name>.<feature_name>=true,false

As an example, here's what we'll add to disable SerializationFeature.WRITE_DATES_AS_TIMESTAMPS:
```bash
spring.jackson.serialization.write-dates-as-timestamps=false
```

also
```bash
spring.jackson.default-property-inclusion=always, non_null, non_absent, non_default, non_empty
```

Check spring-boot documentation
> **https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#howto.spring-mvc.customize-jackson-objectmapper**

Configuring the environment variables is the simplest approach. 
**The downside of this approach is that we can't customize advanced options like having a custom date format for LocalDateTime.**

At this point, we'll obtain this result:
```json
{
  "brand": "Lavazza",
  "date": "2020-11-16T10:35:34.593"
}
```

In order to achieve our goal, we'll register a new JavaTimeModule with our custom date format:
```java
@Configuration
@PropertySource("classpath:coffee.properties")
public class CoffeeRegisterModuleConfig {

    @Bean
    public Module javaTimeModule() {
        JavaTimeModule module = new JavaTimeModule();
        module.addSerializer(LOCAL_DATETIME_SERIALIZER);
        return module;
    }
}
```

Spring Boot will automatically register any bean of type com.fasterxml.jackson.databind.Module. Here's our final result:
```json
{
  "brand": "Lavazza",
  "date": "16-11-2020 10:43"
}
```

#### Jackson2ObjectMapperBuilderCustomizer

```java
@Bean
public Jackson2ObjectMapperBuilderCustomizer jsonCustomizer() {
    return builder -> builder.serializationInclusion(JsonInclude.Include.NON_NULL)
      .serializers(LOCAL_DATETIME_SERIALIZER);
}
```

```java
@Bean
@Primary
public ObjectMapper objectMapper() {
    JavaTimeModule module = new JavaTimeModule();
    module.addSerializer(LOCAL_DATETIME_SERIALIZER);
    return new ObjectMapper()
      .setSerializationInclusion(JsonInclude.Include.NON_NULL)
      .registerModule(module);
}
```

```java
@Bean
public Jackson2ObjectMapperBuilder jackson2ObjectMapperBuilder() {
    return new Jackson2ObjectMapperBuilder().serializers(LOCAL_DATETIME_SERIALIZER)
      .serializationInclusion(JsonInclude.Include.NON_NULL);
}
```

According to the Jackson2ObjectMapperBuilder documentation, it will also register some modules if they're present on the classpath:

- jackson-datatype-jdk8: support for other Java 8 types like Optional
- jackson-datatype-jsr310: support for Java 8 Date and Time API types
- jackson-datatype-joda: support for Joda-Time types
- jackson-module-kotlin: support for Kotlin classes and data classes


The advantage of this approach is that the Jackson2ObjectMapperBuilder offers a simple and intuitive way to build an ObjectMapper.


#### MappingJackson2HttpMessageConverter

```java
@Bean
public MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter() {
    Jackson2ObjectMapperBuilder builder = new Jackson2ObjectMapperBuilder().serializers(LOCAL_DATETIME_SERIALIZER)
      .serializationInclusion(JsonInclude.Include.NON_NULL);
    return new MappingJackson2HttpMessageConverter(builder.build());
}
```


## <a name='JsonAnyGetter'> @JsonAnyGetter </a>
allows for the flexibility of using a Map field as standard properties.

```java
public class ExtendableBean {
    public String name;
    private Map<String, String> properties;

    @JsonAnyGetter
    public Map<String, String> getProperties() {
        return properties;
    }
}
```

```json
{
    "name":"My bean",
    "attr2":"val2",
    "attr1":"val1"
}
```

```java
@Test
public void whenSerializingUsingJsonAnyGetter_thenCorrect()
  throws JsonProcessingException {
 
    ExtendableBean bean = new ExtendableBean("My bean");
    bean.add("attr1", "val1");
    bean.add("attr2", "val2");

    String result = new ObjectMapper().writeValueAsString(bean);
 
    assertThat(result, containsString("attr1"));
    assertThat(result, containsString("val1"));
}
```

We can also use the optional argument enabled as false to disable @JsonAnyGetter(). In this case, the Map will be converted as JSON and will appear under the properties variable after serialization.


## <a name='JsonGetter'> @JsonGetter </a>

@JsonGetter annotation is an alternative to the @JsonProperty annotation, which marks a method as a getter method.

```java
public class MyBean {
    public int id;
    private String name;

    @JsonGetter("name")
    public String getTheName() {
        return name;
    }
}
```


```java
@Test
public void whenSerializingUsingJsonGetter_thenCorrect()
  throws JsonProcessingException {
 
    MyBean bean = new MyBean(1, "My bean");

    String result = new ObjectMapper().writeValueAsString(bean);
 
    assertThat(result, containsString("My bean"));
    assertThat(result, containsString("1"));
}
```

## <a name='JsonPropertyOrder'> @JsonPropertyOrder </a>

specify the order of properties on serialization.

```java
@JsonPropertyOrder({ "name", "id" })
public class MyBean {
    public int id;
    public String name;
}
```

output:
```json
{
    "name":"My bean",
    "id":1
}
```


```java
@Test
public void whenSerializingUsingJsonPropertyOrder_thenCorrect()
  throws JsonProcessingException {
 
    MyBean bean = new MyBean(1, "My bean");

    String result = new ObjectMapper().writeValueAsString(bean);
    assertThat(result, containsString("My bean"));
    assertThat(result, containsString("1"));
}
```

We can also use @JsonPropertyOrder(alphabetic=true) to order the properties alphabetically. In that case, the output of serialization will be:

```json
{
    "id":1,
    "name":"My bean"
}
```

## <a name='JsonRawValue'> @JsonRawValue </a>

instruct Jackson to serialize a property exactly as is.

```java
public class RawBean {
    public String name;

    @JsonRawValue
    public String json;
}
```


output:
```json
{
    "name":"My bean",
    "json":{
        "attr":false
    }
}
```


```java
@Test
public void whenSerializingUsingJsonRawValue_thenCorrect()
  throws JsonProcessingException {
 
    RawBean bean = new RawBean("My bean", "{\"attr\":false}");

    String result = new ObjectMapper().writeValueAsString(bean);
    assertThat(result, containsString("My bean"));
    assertThat(result, containsString("{\"attr\":false}"));
}
```


## <a name='JsonValue'> @JsonValue </a>

indicates a single method that the library will use to serialize the entire instance.

For example, in an enum, we annotate the getName with @JsonValue so that any such entity is serialized via its name:

```java
public enum TypeEnumWithValue {
    TYPE1(1, "Type A"), TYPE2(2, "Type 2");

    private Integer id;
    private String name;

    // standard constructors

    @JsonValue
    public String getName() {
        return name;
    }
}
```

```java
@Test
public void whenSerializingUsingJsonValue_thenCorrect()
  throws JsonParseException, IOException {
 
    String enumAsString = new ObjectMapper()
      .writeValueAsString(TypeEnumWithValue.TYPE1);

    assertThat(enumAsString, is(""Type A""));
}
```


## <a name='JsonRootName'> @JsonRootName </a>

@JsonRootName annotation is used, if wrapping is enabled, to specify the name of the root wrapper to be used.

Wrapping means that instead of serializing a User to something like:

```json
{
    "id": 1,
    "name": "John"
}
```

It's going to be wrapped like this:

```json
{
    "User": {
        "id": 1,
        "name": "John"
    }
}
```

```java
@JsonRootName(value = "user")
public class UserWithRoot {
    public int id;
    public String name;
}
```

```java
@Test
public void whenSerializingUsingJsonRootName_thenCorrect() throws JsonProcessingException {
 
    UserWithRoot user = new User(1, "John");

    ObjectMapper mapper = new ObjectMapper();
    mapper.enable(SerializationFeature.WRAP_ROOT_VALUE);
    String result = mapper.writeValueAsString(user);

    assertThat(result, containsString("John"));
    assertThat(result, containsString("user"));
}
```

output:
```json
{
    "user":{
        "id":1,
        "name":"John"
    }
}
```



side note for xml
```java
@JsonRootName(value = "user", namespace="users")
public class UserWithRootNamespace {
    public int id;
    public String name;

    // ...
}
```

output:
```xml
<user xmlns="users">
    <id xmlns="">1</id>
    <name xmlns="">John</name>
    <items xmlns=""/>
</user>
```


## <a name='JsonSerialize'> @JsonSerialize </a>

@JsonSerialize indicates a custom serializer to use when marshalling the entity.


```java
public class EventWithSerializer {
    public String name;

    @JsonSerialize(using = CustomDateSerializer.class)
    public Date eventDate;
}
```

```java
public class CustomDateSerializer extends StdSerializer<Date> {

    private static SimpleDateFormat formatter = new SimpleDateFormat("dd-MM-yyyy hh:mm:ss");

    public CustomDateSerializer() { 
        this(null); 
    } 

    public CustomDateSerializer(Class<Date> t) {
        super(t); 
    }

    @Override
    public void serialize(Date value, JsonGenerator gen, SerializerProvider arg2) throws IOException, JsonProcessingException {
        gen.writeString(formatter.format(value));
    }
}
```

```java
@Test
public void whenSerializingUsingJsonSerialize_thenCorrect() throws JsonProcessingException, ParseException {
 
    SimpleDateFormat df = new SimpleDateFormat("dd-MM-yyyy hh:mm:ss");

    String toParse = "20-12-2014 02:30:00";
    Date date = df.parse(toParse);
    EventWithSerializer event = new EventWithSerializer("party", date);

    String result = new ObjectMapper().writeValueAsString(event);
    assertThat(result, containsString(toParse));
}
```


## <a name='JsonCreator'> @JsonCreator </a>

use the @JsonCreator annotation to tune the constructor/factory used in deserialization.

It's very useful when we need to deserialize some JSON that doesn't exactly match the target entity we need to get

Let's look at an example. Say we need to deserialize the following JSON:


```json
{
    "id":1,
    "theName":"My bean"
}
```

```java
public class BeanWithCreator {
    public int id;
    public String name;

    @JsonCreator
    public BeanWithCreator(@JsonProperty("id") int id, @JsonProperty("theName") String name) {
        this.id = id;
        this.name = name;
    }
}
```


```java
@Test
public void whenDeserializingUsingJsonCreator_thenCorrect() throws IOException {
 
    String json = "{\"id\":1,\"theName\":\"My bean\"}";

    BeanWithCreator bean = new ObjectMapper()
      .readerFor(BeanWithCreator.class)
      .readValue(json);
    assertEquals("My bean", bean.name);
}
```

## <a name='JacksonInject'> @JacksonInject </a>

@JacksonInject indicates that a property will get its value from the injection and not from the JSON data.

```java
public class BeanWithInject {

    @JacksonInject
    public int id;
    
    public String name;
}
```



```java
@Test
public void whenDeserializingUsingJsonInject_thenCorrect()throws IOException {
 
    String json = "{\"name\":\"My bean\"}";
    
    InjectableValues inject = new InjectableValues.Std()
      .addValue(int.class, 1);
    BeanWithInject bean = new ObjectMapper().reader(inject)
      .forType(BeanWithInject.class)
      .readValue(json);
    
    assertEquals("My bean", bean.name);
    assertEquals(1, bean.id);
}
```


## <a name='JsonAnySetter'> @JsonAnySetter </a>

allows us the flexibility of using a Map as standard properties. On deserialization, the properties from JSON will simply be added to the map.

```java
public class ExtendableBean {
    public String name;
    private Map<String, String> properties;

    @JsonAnySetter
    public void add(String key, String value) {
        properties.put(key, value);
    }
}
```

```json
{
    "name":"My bean",
    "attr2":"val2",
    "attr1":"val1"
}
```

```java
@Test
public void whenDeserializingUsingJsonAnySetter_thenCorrect() throws IOException {
    String json = "{\"name\":\"My bean\",\"attr2\":\"val2\",\"attr1\":\"val1\"}";

    ExtendableBean bean = new ObjectMapper()
      .readerFor(ExtendableBean.class)
      .readValue(json);
    
    assertEquals("My bean", bean.name);
    assertEquals("val2", bean.getProperties().get("attr2"));
}
```


## <a name='JsonSetter'> @JsonSetter </a>

an alternative to @JsonProperty that marks the method as a setter method.

This is incredibly useful when we need to read some JSON data, but the target entity class doesn't exactly match that data, and so we need to tune the process to make it fit.

```java
public class MyBean {
    public int id;
    private String name;

    @JsonSetter("name")
    public void setTheName(String name) {
        this.name = name;
    }
}
```


```java
@Test
public void whenDeserializingUsingJsonSetter_thenCorrect()
  throws IOException {
 
    String json = "{\"id\":1,\"name\":\"My bean\"}";

    MyBean bean = new ObjectMapper()
      .readerFor(MyBean.class)
      .readValue(json);
    assertEquals("My bean", bean.getTheName());
}
```

## <a name='JsonDeserialize'> @JsonDeserialize </a>

indicates the use of a custom deserializer.

```java
public class EventWithSerializer {
    public String name;

    @JsonDeserialize(using = CustomDateDeserializer.class)
    public Date eventDate;
}
```

```java
public class CustomDateDeserializer extends StdDeserializer<Date> {

    private static SimpleDateFormat formatter = new SimpleDateFormat("dd-MM-yyyy hh:mm:ss");

    public CustomDateDeserializer() { 
        this(null); 
    } 

    public CustomDateDeserializer(Class<?> vc) { 
        super(vc); 
    }

    @Override
    public Date deserialize(JsonParser jsonparser, DeserializationContext context) throws IOException {
        
        String date = jsonparser.getText();
        try {
            return formatter.parse(date);
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
    }
}
```


```java
@Test
public void whenDeserializingUsingJsonDeserialize_thenCorrect() throws IOException {
 
    String json = "{"name":"party","eventDate":"20-12-2014 02:30:00"}";

    SimpleDateFormat df
      = new SimpleDateFormat("dd-MM-yyyy hh:mm:ss");
    EventWithSerializer event = new ObjectMapper()
      .readerFor(EventWithSerializer.class)
      .readValue(json);
    
    assertEquals(
      "20-12-2014 02:30:00", df.format(event.eventDate));
}
```


## <a name='JsonAlias'> @JsonAlias </a>

defines one or more alternative names for a property during deserialization

```java
public class AliasBean {
    @JsonAlias({ "fName", "f_name" })
    private String firstName;   
    private String lastName;
}
```


```java
@Test
public void whenDeserializingUsingJsonAlias_thenCorrect() throws IOException {
    String json = "{\"fName\": \"John\", \"lastName\": \"Green\"}";
    AliasBean aliasBean = new ObjectMapper().readerFor(AliasBean.class).readValue(json);
    assertEquals("John", aliasBean.getFirstName());
}
```


## <a name='JsonIgnoreProperties'> @JsonIgnoreProperties </a>

is a class-level annotation that marks a property or a list of properties that Jackson will ignore.

```java
@JsonIgnoreProperties({ "id" })
public class BeanWithIgnore {
    public int id;
    public String name;
}
```


```java
@Test
public void whenSerializingUsingJsonIgnoreProperties_thenCorrect()
  throws JsonProcessingException {
 
    BeanWithIgnore bean = new BeanWithIgnore(1, "My bean");

    String result = new ObjectMapper()
      .writeValueAsString(bean);
    
    assertThat(result, containsString("My bean"));
    assertThat(result, not(containsString("id")));
}
```

To ignore any unknown properties in JSON input without exception, we can set ignoreUnknown=true of @JsonIgnoreProperties annotation.


## <a name='JsonIgnore'> @JsonIgnore </a>

In contrast, the @JsonIgnore annotation is used to mark a property to be ignored at the field level.

```java
public class BeanWithIgnore {
    @JsonIgnore
    public int id;

    public String name;
}
```

```java
@Test
public void whenSerializingUsingJsonIgnore_thenCorrect() throws JsonProcessingException {
 
    BeanWithIgnore bean = new BeanWithIgnore(1, "My bean");

    String result = new ObjectMapper().writeValueAsString(bean);
    
    assertThat(result, containsString("My bean"));
    assertThat(result, not(containsString("id")));
}
```


## <a name='JsonIgnoreType'> @JsonIgnoreType </a>

marks all properties of an annotated type to be ignored.

```java
public class User {
    public int id;
    public Name name;

    @JsonIgnoreType
    public static class Name {
        public String firstName;
        public String lastName;
    }
}
```


```java
@Test
public void whenSerializingUsingJsonIgnoreType_thenCorrect() throws JsonProcessingException, ParseException {
 
    User.Name name = new User.Name("John", "Doe");
    User user = new User(1, name);

    String result = new ObjectMapper().writeValueAsString(user);

    assertThat(result, containsString("1"));
    assertThat(result, not(containsString("name")));
    assertThat(result, not(containsString("John")));
}
```


## <a name='JsonInclude'> @JsonInclude </a>

use @JsonInclude to exclude properties with empty/null/default values.


excluding nulls from serialization:

```java
@JsonInclude(Include.NON_NULL)
public class MyBean {
    public int id;
    public String name;
}
```


```java
public void whenSerializingUsingJsonInclude_thenCorrect() throws JsonProcessingException {
 
    MyBean bean = new MyBean(1, null);

    String result = new ObjectMapper()
      .writeValueAsString(bean);
    
    assertThat(result, containsString("1"));
    assertThat(result, not(containsString("name")));
}
```


## <a name='JsonAutoDetect'> @JsonAutoDetect </a>

can override the default semantics of which properties are visible and which are not.


let's enable serializing private properties:

```java
@JsonAutoDetect(fieldVisibility = Visibility.ANY)
public class PrivateBean {
    private int id;
    private String name;
}
```


```java
@Test
public void whenSerializingUsingJsonAutoDetect_thenCorrect() throws JsonProcessingException {
 
    PrivateBean bean = new PrivateBean(1, "My bean");

    String result = new ObjectMapper().writeValueAsString(bean);
    
    assertThat(result, containsString("1"));
    assertThat(result, containsString("My bean"));
}
```

## <a name='JsonProperty'> @JsonProperty </a>

indicates the property name in JSON.

```java
public class MyBean {
    public int id;
    private String name;

    @JsonProperty("name")
    public void setTheName(String name) {
        this.name = name;
    }

    @JsonProperty("name")
    public String getTheName() {
        return name;
    }
}
```

```java
@Test
public void whenUsingJsonProperty_thenCorrect() throws IOException {
    MyBean bean = new MyBean(1, "My bean");

    String result = new ObjectMapper().writeValueAsString(bean);
    
    assertThat(result, containsString("My bean"));
    assertThat(result, containsString("1"));

    MyBean resultBean = new ObjectMapper()
      .readerFor(MyBean.class)
      .readValue(result);
    assertEquals("My bean", resultBean.getTheName());
}
```

## <a name='JsonFormat'> @JsonFormat </a>

specifies a format when serializing Date/Time values.

```java
public class EventWithFormat {
    public String name;

    @JsonFormat(
      shape = JsonFormat.Shape.STRING,
      pattern = "dd-MM-yyyy hh:mm:ss")
    public Date eventDate;
}
```


```java
@Test
public void whenSerializingUsingJsonFormat_thenCorrect() throws JsonProcessingException, ParseException {
    SimpleDateFormat df = new SimpleDateFormat("dd-MM-yyyy hh:mm:ss");
    df.setTimeZone(TimeZone.getTimeZone("UTC"));

    String toParse = "20-12-2014 02:30:00";
    Date date = df.parse(toParse);
    EventWithFormat event = new EventWithFormat("party", date);
    
    String result = new ObjectMapper().writeValueAsString(event);
    
    assertThat(result, containsString(toParse));
}
```

## <a name='JsonUnwrapped'> @JsonUnwrapped </a>

defines values that should be unwrapped/flattened when serialized/deserialized.

```java
public class UnwrappedUser {
    public int id;

    @JsonUnwrapped
    public Name name;

    public static class Name {
        public String firstName;
        public String lastName;
    }
}
```

```java
@Test
public void whenSerializingUsingJsonUnwrapped_thenCorrect() throws JsonProcessingException, ParseException {
    UnwrappedUser.Name name = new UnwrappedUser.Name("John", "Doe");
    UnwrappedUser user = new UnwrappedUser(1, name);

    String result = new ObjectMapper().writeValueAsString(user);
    
    assertThat(result, containsString("John"));
    assertThat(result, not(containsString("name")));
}
```


```json
{
    "id":1,
    "firstName":"John",
    "lastName":"Doe"
}
```



