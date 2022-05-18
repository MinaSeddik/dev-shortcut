# RestTemplate

- [RestTemplate With HTTP Message Converters](#HTTP_message_converters) 




### <a name='HTTP_message_converters'> RestTemplate With HTTP Message Converters </a>

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
```xml
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

