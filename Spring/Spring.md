# Spring Framework


- [IoC Containers and Dependency Injection](#ioc_dependency_injection) 
- [Spring ApplicationContext](#spring_context)
  - [Configuring Beans in the Container](#configuring_beans)
  - [Types of ApplicationContext](#applicationContext_types)
- [ContextLoaderListener vs DispatcherServlet](#listener_servlet_dispatcher)  
- **Best Practice:** Project Structure and Naming Convension
- @Lazy loading vs @Eager Loading
- @Scope
- @Profile - *Handling different config file (local, dev, qa, uat, prod)*
- @Async
- @Scheduled
- @Value
- @Transaction
- @Autowire, @Qualifier, @Primary and @Required
- @Componant, @Service and @Repository 
- @Conroller, @ResponseBody vs @RestController
- @Configuration @ComponantScan and @Bean
- @Condition and @ConditionOnProperty
- @PostConstractor
- @InitBinder
- @RequestParam vs @PathVariable
- HttpMessageConverter 


## <a name='ioc_dependency_injection'> IoC Containers and Dependency Injection </a>

One of the main features of the Spring framework is the IoC (Inversion of Control) container. 
The Spring IoC container is responsible for managing the objects of an application. 
It uses dependency injection to achieve inversion of control.

The interfaces **BeanFactory** and **ApplicationContext** represent the Spring IoC container. 
Here, BeanFactory is the root interface for accessing the Spring container. 
It provides basic functionalities for managing beans.

the ApplicationContext is a sub-interface of the BeanFactory. 
Therefore, it offers all the functionalities of BeanFactory.



## <a name='spring_context'> Spring ApplicationContext </a>

As we know, the primary job of the ApplicationContext is to manage beans  
As such, an application must provide the bean configuration to the ApplicationContext container.   
A Spring bean configuration consists of one or more bean definitions. 


### <a name='configuring_beans'> Configuring Beans in the Container </a>

Spring supports different ways of configuring beans
#### 1. Java-Based Configuration
*uses @Bean-annotated methods within a @Configuration class.*

ex:
```java
    @Configuration
    public class AccountConfig {
    
      @Bean
      public AccountService accountService() {
        return new AccountService(accountRepository());
      }
    
      @Bean
      public AccountRepository accountRepository() {
        return new AccountRepository();
      }
    
    }
```

#### 2. Annotation-Based Configuration  
annotation-based configuration via XML configuration. Then we use a set of annotations on our Java classes, methods, constructors, or fields to configure beans. Some examples of these annotations are @Component, @Controller, @Service, @Repository, @Autowired, and @Qualifier.

First, we'll create the XML configuration, user-bean-config.xml, to enable annotations
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:context="http://www.springframework.org/schema/context"
  xsi:schemaLocation="http://www.springframework.org/schema/beans
    http://www.springframework.org/schema/beans/spring-beans.xsd
    http://www.springframework.org/schema/context
    http://www.springframework.org/schema/context/spring-context.xsd">
  
  <context:annotation-config/>
  <context:component-scan base-package="com.baeldung.applicationcontext"/>

</beans>
```

Second, we'll create the UserService class and define it as a Spring bean using the @Component annotation:
```java
@Component
public class UserService {
  // user service code
}
```

a simple test case to test this configuration:
```java
ApplicationContext context = new ClassPathXmlApplicationContext("applicationcontext/user-bean-config.xml");
UserService userService = context.getBean(UserService.class);
assertNotNull(userService);
```

#### 3. XML-Based Configuration

we do all bean mappings in an XML configuration file.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="
    http://www.springframework.org/schema/beans 
    http://www.springframework.org/schema/beans/spring-beans.xsd">
	  
  <bean id="accountService" class="com.baeldung.applicationcontext.AccountService">
    <constructor-arg name="accountRepository" ref="accountRepository" />
  </bean>
	
  <bean id="accountRepository" class="com.baeldung.applicationcontext.AccountRepository" />
</beans>
```

### <a name='applicationContext_types'> Types of ApplicationContext </a>

#### 1. AnnotationConfigApplicationContext

It can take classes annotated with @Configuration, @Component, and JSR-330 metadata as input.
```java
ApplicationContext context = new AnnotationConfigApplicationContext(AccountConfig.class);
AccountService accountService = context.getBean(AccountService.class);
```

#### 2. AnnotationConfigWebApplicationContext

We may use this class when we configure Spring's ContextLoaderListener servlet listener or a Spring MVC DispatcherServlet in a web.xml file.

```java
public class MyWebApplicationInitializer implements WebApplicationInitializer {

  public void onStartup(ServletContext container) throws ServletException {
    AnnotationConfigWebApplicationContext context = new AnnotationConfigWebApplicationContext();
    context.register(AccountConfig.class);
    context.setServletContext(container);

    // servlet configuration
  }
}
```


#### 3. XmlWebApplicationContext

 configuring this container is like the AnnotationConfigWebApplicationContext class only, which means we can configure it in web.xml, 
 or implement the WebApplicationInitializer interface:
 
```java
public class MyXmlWebApplicationInitializer implements WebApplicationInitializer {

  public void onStartup(ServletContext container) throws ServletException {
    XmlWebApplicationContext context = new XmlWebApplicationContext();
    context.setConfigLocation("/WEB-INF/spring/applicationContext.xml");
    context.setServletContext(container);

    // Servlet configuration
  }

```

#### 4. FileSystemXMLApplicationContext

load an XML-based Spring configuration file from the file system

```java
String path = "C:/myProject/src/main/resources/applicationcontext/account-bean-config.xml";

ApplicationContext context = new FileSystemXmlApplicationContext(path);
AccountService accountService = context.getBean("accountService", AccountService.class);
```


#### 5. ClassPathXmlApplicationContext

load an XML configuration file from the classpath

```java
ApplicationContext context = new ClassPathXmlApplicationContext("applicationcontext/account-bean-config.xml");
AccountService accountService = context.getBean("accountService", AccountService.class);
```


## <a name='listener_servlet_dispatcher'> ContextLoaderListener vs DispatcherServlet </a>

### Root and child contexts
- Spring can have multiple contexts at a time. One of them will be root context, and all other contexts will be child contexts.
- All child contexts can access the beans defined in root context; but opposite is not true. Root context cannot access child contexts beans.

#### DispatcherServlet – Child application contexts

**DispatcherServlet** is essentially a Servlet (it extends HttpServlet) whose primary purpose is to handle incoming web requests matching the configured URL pattern. It take an incoming URI and find the right combination of controller and view.

in web.xml deployment descriptor file
```xml
<servlet>
  <servlet-name>employee-services</servlet-name>
  <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
  <init-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>classpath:employee-services-servlet.xml</param-value>
  </init-param>
  <load-on-startup>1</load-on-startup>
</servlet>
```

If you do not provide configuration file then it will load its own configuration file using [servlet_name]-servlet.xml.

Web applications can define multiple number of DispatcherServlet entries. Each servlet will operate in its own namespace, loading its own application context with mappings, handlers, etc.

It means that each DispatcherServlet has access to web application context. Until specified, each DispatcherServlet creates own internal web application context.


#### ContextLoaderListener – Root application context

**ContextLoaderListener** creates the root application context and will be shared with child contexts created by all DispatcherServlet contexts. You can have only one entry of this in web.xml.
in web.xml deployment descriptor file
```xml
<listener>
  <listener-class>
    org.springframework.web.context.ContextLoaderListener
  </listener-class>
</listener>
  
<context-param>
  <param-name>contextConfigLocation</param-name>
  <param-value>/WEB-INF/spring/applicationContext.xml</param-value>
</context-param>
```


The context of ContextLoaderListener contains beans that globally visible, like services, repositories, infrastructure beans, etc. After the root application context is created, it’s stored in ServletContext as an attribute, the name is:

> in org/springframework/web/context/ContextLoader.java

```java
servletContext.setAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE, this.context);
 
//Where attibute is defined in /org/springframework/web/context/WebApplicationContext.java as
 
WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE = WebApplicationContext.class.getName() + ".ROOT";

```

To get root application context in Spring controller, you can use WebApplicationContextUtils class.

> in Controller.java
```java
@Autowired
ServletContext context; 
 
ApplicationContext ac = WebApplicationContextUtils.getWebApplicationContext(context);
 
if(ac == null){
  return "root application context is null";
}
```

#### ContextLoaderListener vs DispatcherServlet

![alt text](./ContextLoaderListener-vs-DispatcherServlet.png)

1. ContextLoaderListener creates root application context.
2. DispatcherServlet entries create one child application context per servlet entry.
3. Child contexts can access beans defined in root context.
4. Beans in root context cannot access beans in child contexts (directly).
5. All contexts are added to ServletContext.
6. You can access root context using WebApplicationContextUtils class.


For more details about ContextLoaderListener and DispatcherServlet;   
check out [tomcat web container listener](../Tomcat/README.md#listener) and [tomcat web container servlet](../Tomcat/README.md#servlet)

