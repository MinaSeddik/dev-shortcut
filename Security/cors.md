# Cross-Origin Resource Sharing - CORS


- [Cross-Origin Requests](#Cross_Origin_Requests)
- [CORS-enabled REST API](#CORS_enabled_REST_API)



## <a name='Cross_Origin_Requests'> Cross-Origin Requests </a>

#### Introduction
- Cross-origin requests, in short, are HTTP requests where the origin and the target of the request are different. This is the case, for instance, when a web application is served from one domain and the browser sends an AJAX request to a server in another domain.

#### Same-origin policy
**The same-origin policy is a critical security mechanism that restricts how a document or script loaded by one origin can interact with a resource from another origin.**

- **Definition of an origin**: Two URLs have the same origin if the protocol, port (if specified), and host are the same for both

- The following table gives examples of origin comparisons with the URL http://store.company.com/dir/page.html:

| URL                                               | Outcome           |  Reason                       |
| :---                                              |    :---:          | :----                         |
| http://store.company.com/dir2/other.html          | **Same origin**   |  Only the path differs        |
| http://store.company.com/dir/inner/another.html   | **Same origin**   |  Only the path differs        |
| https://store.company.com/page.html               | **Failure**       |  Different protocol           |
| http://store.company.com:81/dir/page.html         | **Failure**       |  Different port (http:// is port 80 by default)       |
| http://news.company.com/dir/page.html             | **Failure**       |  Different host               |


- Often, the host that serves the JS (e.g. example.com) is different from the host that serves the data (e.g. api.example.com). In such a case, CORS enables cross-domain communication.
- To manage cross-origin requests, the **server** needs to enable a particular mechanism known as CORS, or Cross-Origin Resource Sharing
- The first step in CORS is an **OPTIONS** request to determine whether the target of the request supports it. This is called a **pre-flight** request.

#### The pre-flight request

The server can then respond to the pre-flight request with a collection of headers:
- **Access-Control-Allow-Origin**: Defines which origins may have access to the resource. A ‘*' represents any origin
- **Access-Control-Allow-Methods**: Indicates the allowed HTTP methods for cross-origin requests
- **Access-Control-Allow-Headers**: Indicates the allowed request headers for cross-origin requests
- **Access-Control-Max-Age**: Defines the expiration time of the result of the cached preflight request


## <a name='CORS_enabled_REST_API'> CORS-enabled REST API </a>


```java
@RestController
@CrossOrigin("http://localhost:4200")
public class ResourceController {

    @GetMapping("/user")
    public String user(Principal principal) {
        return principal.getName();
    }
}
```
The **@CrossOrigin** annotation makes sure that our APIs are accessible only from the origin mentioned in its argument.

#### Securing Our REST API

Now, secure our REST API with Spring Security:
```java
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
                .anyRequest().authenticated()
                .and()
            .httpBasic();
    }
}
```

#### Pre-flight Request

> **curl -v -H "Access-Control-Request-Method: GET" -H "Origin: http://localhost:4200" -X OPTIONS http://localhost:8080/user**

Output: 
```
< HTTP/1.1 401
...
< WWW-Authenticate: Basic realm="Realm"
...
< Vary: Origin
< Vary: Access-Control-Request-Method
< Vary: Access-Control-Request-Headers
< Access-Control-Allow-Origin: http://localhost:4200
< Access-Control-Allow-Methods: POST
< Access-Control-Allow-Credentials: true
< Allow: GET, HEAD, POST, PUT, DELETE, TRACE, OPTIONS, PATCH
...
```

From the output of this command, we can see that the request was denied with a **401**.


#### Enable CORS in Spring Security

```java
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        // ...
        http.cors();
    }
}
```
The **cors()** method will add the Spring-provided **CorsFilter** to the application context which in turn bypasses the authorization checks for OPTIONS requests.

#### Filter based CORS support 
```java
@Configuration
public class MyConfiguration {

	@Bean
	public FilterRegistrationBean corsFilter() {
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowCredentials(true);
		config.addAllowedOrigin("http://domain1.com");
		config.addAllowedHeader("*");
		config.addAllowedMethod("*");
		source.registerCorsConfiguration("/**", config);
		FilterRegistrationBean bean = new FilterRegistrationBean(new CorsFilter(source));
		bean.setOrder(0);
		return bean;
	}

}
```


#### @CrossOrigin on the Controller

```java
@CrossOrigin(origins = "http://example.com", maxAge = 3600)
@RestController
@RequestMapping("/account")
public class AccountController {

    @RequestMapping(method = RequestMethod.GET, path = "/{id}")
    public Account retrieve(@PathVariable Long id) {
        // ...
    }

    @RequestMapping(method = RequestMethod.DELETE, path = "/{id}")
    public void remove(@PathVariable Long id) {
        // ...
    }
}
```
This time, we added @CrossOrigin on the class level. So, both retrieve() and remove() methods have it enabled. We can customize the configuration by specifying the value of one of the annotation attributes: origins, methods, allowedHeaders, exposedHeaders, allowCredentials, or maxAge.


```java
@CrossOrigin(maxAge = 3600)
@RestController
@RequestMapping("/account")
public class AccountController {

    @CrossOrigin("http://example.com")
    @RequestMapping(method = RequestMethod.GET, "/{id}")
    public Account retrieve(@PathVariable Long id) {
        // ...
    }

    @RequestMapping(method = RequestMethod.DELETE, path = "/{id}")
    public void remove(@PathVariable Long id) {
        // ...
    }
}
```
Spring will combine attributes from both annotations to create a merged CORS configuration.

Here, both methods will have a maxAge of 3,600 seconds, the method remove() will allow all origins, and the method retrieve() will only allow origins from http://example.com.


#### Spring Global CORS Configuration

By default, all origins and GET, HEAD and POST methods are allowed.

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**");
    }
}
```
The example above enables CORS requests from any origin to any endpoint in the application.

- To lock this down a bit more, the registry.addMapping method returns a CorsRegistration object, which we can use for additional configuration. There’s also an allowedOrigins method that lets us specify an array of allowed origins. This can be useful if we need to load this array from an external source at runtime.
- Additionally, there are also allowedMethods, allowedHeaders, exposedHeaders, maxAge and allowCredentials that we can use to set the response headers and customization options.


#### CORS With Spring Security
If we use Spring Security in our project, we must take an extra step to make sure it plays well with CORS. That's because CORS needs to be processed first. Otherwise, Spring Security will reject the request before it reaches Spring MVC.

```java
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.cors().and()...
    }
}
```
CORS requests are automatically dispatched to the various registered HandlerMappings. They handle CORS preflight requests and intercept CORS simple and actual requests using a CorsProcessor implementation (DefaultCorsProcessor by default) to add the relevant CORS response headers (such as Access-Control-Allow-Origin).

CorsConfiguration allows us to specify how the CORS requests should be processed, including allowed origins, headers and methods, among others. We can provide it in various ways:

