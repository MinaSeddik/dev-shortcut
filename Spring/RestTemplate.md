# RestTemplate


- [Use GET to Retrieve Resources](#Use_GET_to_Retrieve_Resources)
- [Use POST to Create a Resources](#Use_POST_to_Create_Resources)
- [Use PUT to Update a Resource](#Use_PUT_to_Update_Resource)
- [Use DELETE to Remove a Resource](#Use_DELETE_to_Remove_Resource)
- [Configure Timeout](#Configure_Timeout)
- [Handle Basic Auth](#Handle_Basic_Auth)
- [Handle Bearer Token](#Handle_Bearer_Token)
- [Disable SSL Verification](#Disable_SSL_Verification)
- [Add SSL Certificate](#Add_SSL_Certificate)
- [Request/Response Logging](#Request_Response_Logging)
- [RestTemplate With HTTP Message Converters](#HTTP_message_converters) 



## <a name='Use_GET_to_Retrieve_Resources'> Use GET to Retrieve Resources </a>

#### GET Plain JSON

```java
RestTemplate restTemplate = new RestTemplate();
String fooResourceUrl = "http://localhost:8080/spring-rest/foos";
ResponseEntity<String> response = restTemplate.getForEntity(fooResourceUrl + "/1", String.class);
Assertions.assertEquals(response.getStatusCode(), HttpStatus.OK);
```

Notice that we have full access to the HTTP response, so we can do things like check the status code to make sure the operation was successful or work with the actual body of the response:

```java
ObjectMapper mapper = new ObjectMapper();
JsonNode root = mapper.readTree(response.getBody());
JsonNode name = root.path("name");
Assertions.assertNotNull(name.asText());
```


#### GET POJO Instead of JSON

```java
public class Foo implements Serializable {
    private long id;

    private String name;
    // standard getters and setters
}
```

```java
Foo foo = restTemplate.getForObject(fooResourceUrl + "/1", Foo.class);
Assertions.assertNotNull(foo.getName());
Assertions.assertEquals(foo.getId(), 1L);
```

#### GET with query parameters


```java
HttpHeaders headers = new HttpHeaders();
headers.set(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);
HttpEntity<?> entity = new HttpEntity<>(headers);

String urlTemplate = UriComponentsBuilder.fromHttpUrl(url)
        .queryParam("msisdn", "{msisdn}")
        .queryParam("email", "{email}")
        .queryParam("clientVersion", "{clientVersion}")
        .queryParam("clientType", "{clientType}")
        .queryParam("issuerName", "{issuerName}")
        .queryParam("applicationName", "{applicationName}")
        .encode()
        .toUriString();

Map<String, ?> params = new HashMap<>();
params.put("msisdn", msisdn);
params.put("email", email);
params.put("clientVersion", clientVersion);
params.put("clientType", clientType);
params.put("issuerName", issuerName);
params.put("applicationName", applicationName);

HttpEntity<String> response = restTemplate.exchange(
        urlTemplate,
        HttpMethod.GET,
        entity,
        String.class,
        params
);

Foo foo = restTemplate.getForObject(urlTemplate.toUriString(), Foo.class);
```



#### GET with path parameters

```java
Map<String, String> vars = new HashMap<>();
vars.put("hotel", "42");
vars.put("room", "21");

restTemplate.getForObject("http://example.com/hotels/{hotel}/rooms/{room}", String.class, vars);
```


## <a name='Use_POST_to_Create_Resources'> Use POST to Create a Resources </a>

#### The postForObject() API

```java
RestTemplate restTemplate = new RestTemplate();

HttpEntity<Foo> request = new HttpEntity<>(new Foo("bar"));
Foo foo = restTemplate.postForObject(fooResourceUrl, request, Foo.class);
Assertions.assertNotNull(foo);
Assertions.assertEquals(foo.getName(), "bar");
```

#### The exchange() API

```java
RestTemplate restTemplate = new RestTemplate();
HttpEntity<Foo> request = new HttpEntity<>(new Foo("bar"));
ResponseEntity<Foo> response = restTemplate.exchange(fooResourceUrl, HttpMethod.POST, request, Foo.class);
 
Assertions.assertEquals(response.getStatusCode(), HttpStatus.CREATED);
 
Foo foo = response.getBody();
 
Assertions.assertNotNull(foo);
Assertions.assertEquals(foo.getName(), "bar");
```



```java
@Test
public void givenConsumingJson_whenReadingTheFoo_thenCorrect() {
    String URI = BASE_URI + "foos/{id}";

    RestTemplate restTemplate = new RestTemplate();
    restTemplate.setMessageConverters(getJsonMessageConverters());

    HttpHeaders headers = new HttpHeaders();
    headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
    HttpEntity<String> entity = new HttpEntity<String>(headers);

    ResponseEntity<Foo> response = 
      restTemplate.exchange(URI, HttpMethod.GET, entity, Foo.class, "1");
    Foo resource = response.getBody();

    assertThat(resource, notNullValue());
}

private List<HttpMessageConverter<?>> getJsonMessageConverters() {
    List<HttpMessageConverter<?>> converters = new ArrayList<>();
    converters.add(new MappingJackson2HttpMessageConverter());
    return converters;
}
```


#### Submit Form Data

First, we need to set the Content-Type header to **application/x-www-form-urlencoded**

Step (1)
```java
HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
```

Step (2)
```java
MultiValueMap<String, String> map= new LinkedMultiValueMap<>();
map.add("id", "1");
```

Step (3)
```java
HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
```

Step (4)
```java
ResponseEntity<String> response = restTemplate.postForEntity(fooResourceUrl+"/form", request , String.class);
Assertions.assertEquals(response.getStatusCode(), HttpStatus.CREATED);
```


#### Uploading a Single File

First, we need to set the Content-Type header to **multipart/form-data**

Step (1)
```java
HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.MULTIPART_FORM_DATA);
```

Step (2)
```java
MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
body.add("file", getTestFile());
```

Step (3)
```java
HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
```

Step (4)
```java
HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

String serverUrl = "http://localhost:8082/spring-rest/fileserver/singlefileupload/";

RestTemplate restTemplate = new RestTemplate();
ResponseEntity<String> response = restTemplate.postForEntity(serverUrl, requestEntity, String.class);
```

File and file name
Step (5)
```java
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.MULTIPART_FORM_DATA);

    LinkedMultiValueMap<String, String> pdfHeaderMap = new LinkedMultiValueMap<>();
    pdfHeaderMap.add("Content-disposition", "form-data; name=filex; filename=" + file.getOriginalFilename());
    pdfHeaderMap.add("Content-type", "application/pdf");
    HttpEntity<byte[]> doc = new HttpEntity<byte[]>(file.getBytes(), pdfHeaderMap);

    LinkedMultiValueMap<String, Object> multipartReqMap = new LinkedMultiValueMap<>();
    multipartReqMap.add("filex", doc);

    HttpEntity<LinkedMultiValueMap<String, Object>> reqEntity = new HttpEntity<>(multipartReqMap, headers);
    ResponseEntity<MyResponse> resE = restTemplate.exchange(uri, HttpMethod.POST, reqEntity, MyResponse.class);
```

Note
Then, your controller method can handle the uploaded file with the following argument:

```java
@RequestParam("filex") MultipartFile file
```


## <a name='Use_PUT_to_Update_Resource'> Use PUT to Update a Resource </a>


#### Simple PUT With exchange()

```java
Foo updatedInstance = new Foo("newName");
updatedInstance.setId(createResponse.getBody().getId());
String resourceUrl = fooResourceUrl + '/' + createResponse.getBody().getId();
HttpEntity<Foo> requestUpdate = new HttpEntity<>(updatedInstance, headers);
template.exchange(resourceUrl, HttpMethod.PUT, requestUpdate, Void.class);
```


#### PUT With exchange() and a Request Callback

Let's make sure we prepare the callback, where we can set all the headers we need as well as a request body:

```java
RequestCallback requestCallback(final Foo updatedInstance) {
    return clientHttpRequest -> {
        ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(clientHttpRequest.getBody(), updatedInstance);
        clientHttpRequest.getHeaders().add(
          HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
        clientHttpRequest.getHeaders().add(
          HttpHeaders.AUTHORIZATION, "Basic " + getBase64EncodedLogPass());
    };
}
```

Next, we create the Resource with a POST request:
```java
ResponseEntity<Foo> response = restTemplate
  .exchange(fooResourceUrl, HttpMethod.POST, request, Foo.class);
Assertions.assertEquals(response.getStatusCode(), HttpStatus.CREATED);
```


```java
Foo updatedInstance = new Foo("newName");
updatedInstance.setId(response.getBody().getId());
String resourceUrl =fooResourceUrl + '/' + response.getBody().getId();
restTemplate.execute(
  resourceUrl, 
  HttpMethod.PUT, 
  requestCallback(updatedInstance), 
  clientHttpResponse -> null);
```


## <a name='Use_DELETE_to_Remove_Resource'> Use DELETE to Remove a Resource </a>


```java
String entityUrl = fooResourceUrl + "/" + existingResource.getId();
restTemplate.delete(entityUrl);
```


## <a name='Configure_Timeout'> Configure Timeout </a>

```java
RestTemplate restTemplate = new RestTemplate(getClientHttpRequestFactory());

private ClientHttpRequestFactory getClientHttpRequestFactory() {
    int timeout = 5000;
    HttpComponentsClientHttpRequestFactory clientHttpRequestFactory
      = new HttpComponentsClientHttpRequestFactory();
    clientHttpRequestFactory.setConnectTimeout(timeout);
    return clientHttpRequestFactory;
}
```


```java
private ClientHttpRequestFactory getClientHttpRequestFactory() {
    int timeout = 5000;
    RequestConfig config = RequestConfig.custom()
      .setConnectTimeout(timeout)
      .setConnectionRequestTimeout(timeout)
      .setSocketTimeout(timeout)
      .build();


    CloseableHttpClient client = HttpClientBuilder
      .create()
      .setDefaultRequestConfig(config)
      .build();
    return new HttpComponentsClientHttpRequestFactory(client);
}
```

## <a name='Handle_Basic_Auth'> Handle Basic Auth </a>

#### Manual Management of the Authorization HTTP Header


```java
private HttpHeaders createHttpHeaders(String user, String password)
{
    String notEncoded = user + ":" + password;
    String encodedAuth = "Basic " + Base64.getEncoder().encodeToString(notEncoded.getBytes());
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.add("Authorization", encodedAuth);
    return headers;
}
```

OR

```java
HttpHeaders createHeaders(String username, String password){
   return new HttpHeaders() {{
         String auth = username + ":" + password;
         byte[] encodedAuth = Base64.encodeBase64(auth.getBytes(Charset.forName("US-ASCII")) );
         String authHeader = "Basic " + new String( encodedAuth );
         set( "Authorization", authHeader );
      }};
}
```

Furthermore, sending a request is just as simple:

```java
restTemplate.exchange(uri, HttpMethod.POST, new HttpEntity<T>(createHeaders(username, password)), clazz);
```

#### Automatic Management of the Authorization HTTP Header

```java
public class HttpComponentsClientHttpRequestFactoryBasicAuth 
  extends HttpComponentsClientHttpRequestFactory {

    HttpHost host;

    public HttpComponentsClientHttpRequestFactoryBasicAuth(HttpHost host) {
        super();
        this.host = host;
    }

    protected HttpContext createHttpContext(HttpMethod httpMethod, URI uri) {
        return createHttpContext();
    }
    
    private HttpContext createHttpContext() {
        AuthCache authCache = new BasicAuthCache();

        BasicScheme basicAuth = new BasicScheme();
        authCache.put(host, basicAuth);

        BasicHttpContext localcontext = new BasicHttpContext();
        localcontext.setAttribute(HttpClientContext.AUTH_CACHE, authCache);
        return localcontext;
    }
}
```

```java
restTemplate.getInterceptors().add(new BasicAuthorizationInterceptor("username", "password"));
```

```java
restTemplate.exchange("http://localhost:8082/spring-security-rest-basic-auth/api/foos/1", HttpMethod.GET, null, Foo.class);
```

you may need the following maven dependency

```xml
<dependency>
   <groupId>org.apache.httpcomponents</groupId>
   <artifactId>httpclient</artifactId>
   <version>4.5.3</version>
</dependency>

<dependency>
   <groupId>commons-codec</groupId>
   <artifactId>commons-codec</artifactId>
   <version>1.10</version>
</dependency>
```
## <a name='Handle_Bearer_Token'> Handle Bearer Token </a>

```java
HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.APPLICATION_JSON);
headers.set("Authorization", "Bearer "+accessToken);

HttpEntity<String> entity = new HttpEntity<String>(requestJson,headers);
String result = restTemplate.postForObject(url, entity, String.class);
```


## <a name='Disable_SSL_Verification'> Disable SSL Verification </a>

```java
@Bean
public RestTemplate restTemplate() 
                throws KeyStoreException, NoSuchAlgorithmException, KeyManagementException {
    TrustStrategy acceptingTrustStrategy = (X509Certificate[] chain, String authType) -> true;

    SSLContext sslContext = org.apache.http.ssl.SSLContexts.custom()
                    .loadTrustMaterial(null, acceptingTrustStrategy)
                    .build();

    SSLConnectionSocketFactory csf = new SSLConnectionSocketFactory(sslContext);

    CloseableHttpClient httpClient = HttpClients.custom()
                    .setSSLSocketFactory(csf)
                    .build();

    //---------------------------------------------------------
    
    // Spring 3.1 
    HttpComponentsClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory();
    
    // Spring 4 
    HttpComponentsAsyncClientHttpRequestFactory requestFactory = new HttpComponentsAsyncClientHttpRequestFactory();

    //---------------------------------------------------------

    requestFactory.setHttpClient(httpClient);
    RestTemplate restTemplate = new RestTemplate(requestFactory);
    return restTemplate;
 }
```


## <a name='Add_SSL_Certificate'> Add SSL Certificate </a>

```java
KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
keyStore.load(new FileInputStream(new File(keyStoreFile)),
  keyStorePassword.toCharArray());

SSLConnectionSocketFactory socketFactory = new SSLConnectionSocketFactory(
  new SSLContextBuilder()
    .loadTrustMaterial(null, new TrustSelfSignedStrategy())
    .loadKeyMaterial(keyStore, keyStorePassword.toCharArray())
    .build(),
    NoopHostnameVerifier.INSTANCE);

HttpClient httpClient = HttpClients.custom().setSSLSocketFactory(
  socketFactory).build();

ClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory(
  httpClient);
RestTemplate restTemplate = new RestTemplate(requestFactory);
MyRecord record = restTemplate.getForObject(uri, MyRecord.class);
LOG.debug(record.toString());
```


## <a name='Request_Response_Logging'> Request/Response Logging </a>


#### Basic Logging

```bash
logging.level.org.springframework.web.client.RestTemplate=DEBUG
```

Output:
```
o.s.w.c.RestTemplate - HTTP POST http://localhost:8082/spring-rest/persons
o.s.w.c.RestTemplate - Accept=[text/plain, application/json, application/*+json, */*]
o.s.w.c.RestTemplate - Writing [my request body] with org.springframework.http.converter.StringHttpMessageConverter
o.s.w.c.RestTemplate - Response 200 OK
```


#### Logging Body With a RestTemplate Interceptor

> **WARINING: As the interceptor consumes the response stream, our client application will see an empty response body.**

```java
public class LoggingInterceptor implements ClientHttpRequestInterceptor {

    static Logger LOGGER = LoggerFactory.getLogger(LoggingInterceptor.class);

    @Override
    public ClientHttpResponse intercept(HttpRequest req, byte[] reqBody, ClientHttpRequestExecution ex) throws IOException {
        LOGGER.debug("Request body: {}", new String(reqBody, StandardCharsets.UTF_8));
        ClientHttpResponse response = ex.execute(req, reqBody);
        InputStreamReader isr = new InputStreamReader(response.getBody(), StandardCharsets.UTF_8);
        String body = new BufferedReader(isr).lines().collect(Collectors.joining("\n"));
        LOGGER.debug("Response body: {}", body);
        return response;
    }
}
```

#### Using Interceptor With RestTemplate

**As the interceptor consumes the response stream, our client application will see an empty response body.
To avoid that, we should use BufferingClientHttpRequestFactory: it buffers stream content into memory. This way, it can be read twice: once by our interceptor, and a second time by our client application:**
  

```java
ClientHttpRequestFactory factory = 
        new BufferingClientHttpRequestFactory(new SimpleClientHttpRequestFactory());
        RestTemplate restTemplate = new RestTemplate(factory);
```
However, the use of this factory involves a performance drawback,

```java
List<ClientHttpRequestInterceptor> interceptors = restTemplate.getInterceptors();
if (CollectionUtils.isEmpty(interceptors)) {
    interceptors = new ArrayList<>();
}
interceptors.add(new LoggingInterceptor());
restTemplate.setInterceptors(interceptors);
```


A mentioned before, the use of BufferingClientHttpRequestFactory has a serious drawback: it undoes the benefits of streaming. As a consequence, loading the entire body data into memory could expose our application to performance issues. Worse, it can lead to OutOfMemoryError.

To prevent this, one possible option is to assume that these verbose logs would be turned off when the data volume scales up, which typically happens in production. For example, we can use a buffered RestTemplate instance only if DEBUG level is enabled on our logger:


```java
RestTemplate restTemplate = null;
if (LOGGER.isDebugEnabled()) {
    ClientHttpRequestFactory factory 
    = new BufferingClientHttpRequestFactory(new SimpleClientHttpRequestFactory());
    restTemplate = new RestTemplate(factory);
} else {
    restTemplate = new RestTemplate();
}
```

Similarly, we'll ensure that our interceptor only reads the response when DEBUG logging is enabled:

```java
if (LOGGER.isDebugEnabled()) {
    InputStreamReader isr = new InputStreamReader(response.getBody(), StandardCharsets.UTF_8);
    String body = new BufferedReader(isr)
        .lines()
        .collect(Collectors.joining("\n"));
    LOGGER.debug("Response body: {}", body);
}
```



## <a name='HTTP_message_converters'> RestTemplate With HTTP Message Converters </a>

- Retrieving the Resource With No Accept Header 
```xml
@Test
public void whenRetrievingAFoo_thenCorrect() {
    String URI = BASE_URI + "foos/{id}";

    RestTemplate restTemplate = new RestTemplate();
    Foo resource = restTemplate.getForObject(URI, Foo.class, "1");

    assertThat(resource, notNullValue());
}
```


- Retrieving a Resource With application/xml Accept Header 
```java
@Test
public void givenConsumingXml_whenReadingTheFoo_thenCorrect() {
    String URI = BASE_URI + "foos/{id}";

    RestTemplate restTemplate = new RestTemplate();
    restTemplate.setMessageConverters(getXmlMessageConverters());

    HttpHeaders headers = new HttpHeaders();
    headers.setAccept(Collections.singletonList(MediaType.APPLICATION_XML));
    HttpEntity<String> entity = new HttpEntity<>(headers);

    ResponseEntity<Foo> response = 
      restTemplate.exchange(URI, HttpMethod.GET, entity, Foo.class, "1");
    Foo resource = response.getBody();

    assertThat(resource, notNullValue());
}

private List<HttpMessageConverter<?>> getXmlMessageConverters() {
    XStreamMarshaller marshaller = new XStreamMarshaller();
    marshaller.setAnnotatedClasses(Foo.class);
    MarshallingHttpMessageConverter marshallingConverter = 
      new MarshallingHttpMessageConverter(marshaller);

    List<HttpMessageConverter<?>> converters = new ArrayList<>();
    converters.add(marshallingConverter);
    return converters;
}
```

- Retrieving a Resource With application/json Accept Header 
```xml
@Test
public void givenConsumingJson_whenReadingTheFoo_thenCorrect() {
    String URI = BASE_URI + "foos/{id}";

    RestTemplate restTemplate = new RestTemplate();
    restTemplate.setMessageConverters(getJsonMessageConverters());

    HttpHeaders headers = new HttpHeaders();
    headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
    HttpEntity<String> entity = new HttpEntity<String>(headers);

    ResponseEntity<Foo> response = 
      restTemplate.exchange(URI, HttpMethod.GET, entity, Foo.class, "1");
    Foo resource = response.getBody();

    assertThat(resource, notNullValue());
}

private List<HttpMessageConverter<?>> getJsonMessageConverters() {
    List<HttpMessageConverter<?>> converters = new ArrayList<>();
    converters.add(new MappingJackson2HttpMessageConverter());
    return converters;
}
```


