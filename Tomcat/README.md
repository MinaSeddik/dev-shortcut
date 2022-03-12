# Tomcat Apache Server


- [Tomcat Installation Notes](#installation)


- [Tomcat Web deployment descriptor](#deployment_descriptor)
- [Tomcat Web Container Listener](#listener)
- [Tomcat Web Container Servlet](#servlet)



- [git add](#git_add)
- [git rm](#git_rm)
- [git commit](#git_commit)
- [git status](#git_status)
- [git log](#git_log)



## <a name='installation'> Tomcat Installation Notes </a>

- Java SDK or Java JRE must be installed before tomcat so that i can work probably  
  - To check Java installation on **Windows**:
    ```
    env JAVA_HOME
    env JRE_HOME
    ```  
           
    To set JAVA_HOME and JRE_HOME, do the following:
    > Right click My Computer and select Properties.
    >> On the Advanced tab, select Environment Variables, and then edit JAVA_HOME to point to where the JDK software is located, for example, C:\Program Files\Java\jdk1.6.0_02
    
   - To check Java installation on **Linux**:
    ```
    echo $JAVA_HOME
    echo $JRE_HOME
    ```  
       
    To set JAVA_HOME and JRE_HOME, do the following:
    > - find /usr/lib/jvm/java-1.x.x-openjdk
    > - sudo vi /etc/profile  
    > - Press 'i' to get in insert mode  
    > - Add :
    >> $ export JAVA_HOME="path that you found"   
       $ export PATH=$JAVA_HOME/bin:$PATH   
       $ source /etc/profile
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
     ***Do the same for JRE***
     
     
- The default installation port of tomcat is **8080**
- Check the tomcat server on http://localhost:8080 

- Tomcat - **CATALINA_HOME** and **CATALINA_BASE** variables
  - The **CATALINA_HOME** and **CATALINA_BASE** environment variables are used to specify the location of Apache Tomcat 
  - If you are running multiple instances of Tomcat on a single host you should set **CATALINA_BASE** to be equal to the .../tomcat_instance1 or .../tomcat_instance2 directory as appropriate for each instance and the **CATALINA_HOME** environment variable to the common Tomcat installation whose files will be shared between the two instances.
  - The **CATALINA_BASE** environment is optional if you are running a single Tomcat instance on the host and will default to **CATALINA_HOME** in that case. If you are running multiple instances as you are it should be provided.
    - To check Java installation on **Windows**:
      ```
      env CATALINA_HOME
      env CATALINA_BASE
      ```  
     
     - To check Java installation on **Linux**:
       ```
       env CATALINA_HOME
       env CATALINA_BASE
       ```  
       
- start/stop tomcat
  - **tomcat start/stop** vs **catalina.sh run/stop**
  - catalina.sh run starts tomcat in the foreground, displaying the logs on the console that you started it. Hitting Ctrl-C will terminate tomcat.
  - startup.sh will start tomcat in the background. You'll have to **tail -f logs/catalina.out** to see the logs.
  - Both will do the same things, apart from the foreground/background distinction.   
      ```
      CATALINA_HOME/bin/startup.bat       <-- Windows
      CATALINA_HOME/bin/shutdown.bat      <-- Windows
      
      CATALINA_HOME/bin/startup.sh      <-- Linux
      CATALINA_HOME/bin/shutdown.sh     <-- Linux
      ```
         
- Install tomcat as a **Service**
  - On **Windows**
    ```
    C:\Java\Apache Tomcat 8.5.9\bin> service install
    ```
    - Run **Cntl+R**, then type **services.msc** and make sure that tomcat service is running and Automatic
   
  - On **Linux**
    ```
    systemctl status tomcat8
    ```
    
    > systemctl **[status | enable | disable | start | stop | restart | reload ]** tomcat8
                                                                     


## <a name='deployment_descriptor'> Tomcat Web deployment descriptor </a>

In a java web application a file named web.xml is known as deployment descriptor. 
It is a xml file and <web-app> is the root element for it. 
When a request comes web server uses web.xml file to map the URL of the request to the specific code that handle the request.

File path: **CATALINA_BASE/webapp/WEB-INF/web.xml**


## <a name='listener'> Tomcat Web Container Listener </a>

As already mentioned, tomcat is a Java web container.  
Sometimes we need to listen to this web container events like *OnStartup* or *OnDestroy* 

The listener is something sitting there and wait for specified event happened

The ***ServletContextListener*** is what you want, it will run your code before the web application is started.

example:
```java
package com.mkyong.listener;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

public class MyAppServletContextListener implements ServletContextListener{

	
    //Run this before web application is started
	@Override
	public void contextInitialized(ServletContextEvent arg0) {
		System.out.println("Web Application started");	
	}

	@Override
	public void contextDestroyed(ServletContextEvent arg0) {
		System.out.println("Web Application destroyed");
	}
	
}
```


Put it in the deployment descriptor web.xml  
```xml
<web-app ...>

   <listener>
	<listener-class>
             com.mkyong.listener.MyAppServletContextListener 
        </listener-class>
   </listener>

</web-app>
```


Starting Tomcat….

>//...
> Dec 2, 2009 10:11:46 AM org.apache.catalina.core.StandardEngine start
> INFO: Starting Servlet Engine: Apache Tomcat/6.0.20
> 
> Web Application started     <-------------- Your code here, before we application --->
> 
> Dec 2, 2009 10:11:46 AM org.apache.coyote.http11.Http11Protocol start
> INFO: Starting Coyote HTTP/1.1 on http-8080
> //...
> INFO: Server startup in 273 ms



## <a name='servlet'> Tomcat Web Container Servlet Example </a>

A servlet is a class which responds to a particular type of network request - most commonly an HTTP request. Basically servlets are usually used to implement web applications

```java
// Import required java libraries
import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;

// Extend HttpServlet class
public class SimpleServlet extends HttpServlet {
 
   private String message;
    
   @Override
   public void init() throws ServletException {
      // Do required initialization
      message = "Hello World";
   }

   @Override
   public void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
      
      // Set response content type
      response.setContentType("text/html");

      // get Servlet parameter  
      String emailValue = getServletContext().getInitParameter("email");  

      // Actual logic goes here.
      PrintWriter out = response.getWriter();
      out.println("<h1>" + message + "</h1>");
      out.println("<p>" + emailValue + "</p>");
  
   }

   @Override
   public void destroy() {
      // do nothing.
   }
}
```


Put it in the deployment descriptor web.xml  
```xml
<web-app ...>

    <servlet>
       <servlet-name>simple-servlet</servlet-name>
       <servlet-class>SimpleServlet</servlet-class>
    </servlet>
    
    <servlet-mapping>
       <servlet-name>simple-servlet</servlet-name>
       <url-pattern>/HelloWorld</url-pattern>
    </servlet-mapping>

    <context-param>
			<param-name>email</param-name>
			<param-value>admin@email.com</param-value>
	</context-param>

</web-app>
```

run it from the web browser
> http://localhost:8080/HelloWorld






```
project
│   README.md
│   file001.txt    
│
└─── folder1
│   │   file011.txt
│   │   file012.txt
│   │
│   └───subfolder1
│       │   file111.txt
│       │   file112.txt
│       │   ...
│   
└───folder2
    │   file021.txt
    │   file022.txt
```


