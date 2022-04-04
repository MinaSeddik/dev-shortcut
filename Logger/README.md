# Java Logging


- [Simple Logging Facade for Java (SLF4J)](#SLF4J) 
- [Log4j 2 implementation](#log4j_implementation)
- [Log Pattern](#log_pattern)
- [Log4j 2 Configuration file](#log4j_config_file)
- [RollingFileAppender](#rolling_file_appender)
- [Delete old logs with log4j2](#delete_logs)
- [SMTPAppender](#SMTP_appender)


## <a name='SLF4J'> Simple Logging Facade for Java (SLF4J) </a>

The Simple Logging Facade for Java (SLF4J) serves as a simple facade or abstraction for various logging frameworks (e.g. java.util.logging, logback, log4j) allowing the end user to plug in the desired logging framework at deployment time.


## <a name='log4j_implementation'> Log4j 2 implementation </a>


#### Log4j 1.2  (Old version, recommended NOT to use)

**slf4j-log4j12** provides a bridge between SLF4J and Log4j 1.2 so that SLF4J knows about how to log using Log4j.


#### Log4j 2  (New version, recommended to use)

If you are using Log4j 2 or later, you will need a different binding JAR than slf4j-log4j12. That binding is maintained by the Log4j project

for more info, you must read
https://logging.apache.org/log4j/2.0/log4j-slf4j-impl/index.html

### dependency in pom.xml file
```xml
    <!--Facade for logging systems-->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-api</artifactId>
        <version>1.7.36</version>
    </dependency>



    <!--Log4j 2 implementation for slf4j-->
    <dependency>
        <groupId>org.apache.logging.log4j</groupId>
        <artifactId>log4j-slf4j-impl</artifactId>
        <version>2.17.2</version>
    </dependency>

```

OR

```xml
    <!--Facade for logging systems-->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-api</artifactId>
        <version>2.0.0-alpha7</version>       <----- newer version
    </dependency>


    <!--Log4j 2 implementation for slf4j-->
    <dependency>
        <groupId>org.apache.logging.log4j</groupId>
        <artifactId>log4j-slf4j18-impl</artifactId>       <---- compatable with this newer version
        <version>2.17.2</version>
    </dependency>
```



## <a name='log_pattern'> Log Pattern </a>

```xml

    <Appenders>
        <Console name="LogToConsole" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5level %logger{2}:%L - %msg%n"/>
        </Console>
    </Appenders>

    <!-- %d for date -->
    <!-- %d{yyyy-MM-dd HH:mm:ss.SSS}   re-format the default date -->
    <!-- [%t]   thread name -->
    <!-- %-5level   log level -->
    <!-- %logger{36}   prints packages.class & 36 means the max depth of packages -->
    <!-- %L  prints line number -->
    <!-- %msg   prints the logged message -->
    <!-- %n   prints new line -->
```


## <a name='log4j_config_file'> Log4j 2 Configuration file </a>


#### Config File Name

File Name: **log4j2.xml**

#### Config File Location

File Location: **src/main/resources/log4j2.xml**

#### Config File specifications


```xml
<Configuration status="WARN">     <!-- status is the level of the internal Log4J events -->


    <Appenders>
        <Console name="ConsoleAppender" target="SYSTEM_OUT">
            <PatternLayout pattern="%d [%t] %-5level %logger{36} - %msg%n%throwable"/>
        </Console>
    
     <!-- we can add more  appenders -->
    
    </Appenders>
    
    

    <Loggers>
        <Root level="ERROR">
            <AppenderRef ref="ConsoleAppender"/>
        </Root>
    </Loggers>

</Configuration>
```


- **Configuration:** The root element of a Log4J 2 configuration file and attribute status is the level of the internal Log4J events, that we want to log
- **Appenders:** This element is holding one or more appenders. Here we'll configure an appender that outputs to the system console at standard out
- **Loggers:** This element can consist of multiple configured Logger elements. 
With the special **Root** tag, you can configure a nameless standard logger that will receive all log messages from the application. 
Each logger can be set to a minimum log level
- **AppenderRef:** This element defines a reference to an element from the Appenders section. 
Therefore the attribute ‘ref‘ is linked with an appenders ‘name‘ attribute



####  Loggers and Root Logger
 
Logger is associated with a package or sometimes with a particular class. Package/class of a logger is defined by the attribute **"name"**.
 A logger logs messages in its package and also in all the child packages and their classes. 
 The only exception is the **root** logger that logs messages for the all classes in the application.

**Good Practice**
- My application appender must **NOT** declared in the Root, off course 
I don't want to log all classes in the app included those in the libraries. 
So It should be declared in **Logger** tag


**Additivity**
To explain this clearly, consider this scenario:

You've configured a total of three appenders in your application.   
One for the package com.demo.moduleone and one for com.demo.moduletwo and one root logger for com.demo. The log4j configuration will look something like this (showing only the appender configuration, excluding other details)

```
log4j.category.com.demo.moduleone = INFO, moduleOneFileAppender
log4j.category.com.demo.moduletwo = INFO, moduleTwoFileAppender
log4j.rootLogger = INFO, rootFileAppender
```

The Log4j loggers are following hierarchies. ie, A log4j logger is said to be an ancestor of another logger if its name followed by a dot is a prefix of the descendant logger name. A log4j logger is said to be a parent of a child logger if there are no ancestors between itself and the descendant logger.

So, as per the hierarchy, our rootFileAppender is the parent appender for both moduleOneFileAppender and moduleTwoAppender. So, all the log messages that are coming to the child appenders will be propagated to the parent appenders too. So, in our scenario, the log messages from the package com.demo.moduleone will be sent to the moduleOneFileAppender plus the rootFileAppender. The same applies to the com.demo.moduletwo also. This leads to write the same log message in two different location.

**How to avoid this redundancy?**   
In order to avoid this redundancy, we can use Log4j additivity. 
Just set the additivity property of an Log4j logger to **false** and then the log messages which are coming to that logger will not be propagated to it's parent loggers.


```xml

<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="INFO">  <!-- status logger is used internally by log4j2 components -->


    <Appenders>

        <!-- Console Logger -->
        <Console name="LogToConsole" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5level %logger{2}:%L - %msg%n"/>
        </Console>


        <!-- Rolling over based on Log File Size -->
        <RollingFile name="RollingFile" fileName="${log-path}/application.log"
                     filePattern="${log-path}/application.%i.log.gz">
            <PatternLayout>
                <pattern>%d{dd/MMM/yyyy HH:mm:ss,SSS}- %c{1}: %m%n</pattern>
            </PatternLayout>
            <Policies>
                <SizeBasedTriggeringPolicy size="1 MB"/>
            </Policies>
            <DefaultRolloverStrategy max="5"/>
        </RollingFile>

    </Appenders>


    <Loggers>

        <!-- log specific package only -->
        <!-- avoid duplicated logs with additivity=false -->
        <Logger name="com.myapp" level="info" additivity="false">   <-- It logs only my app packages and will not send logs to the parent (Root)
            <AppenderRef ref="RollingFile"/>      <!-- My file appender must be here (not in the root), off course I don't want to log all classess in the app included those in the libraries. -->
            <AppenderRef ref="LogToConsole"/>
        </Logger>

        <!-- Root logger(s) that logs messages for the all classes in the application. -->
        <Root level="trace">
            <AppenderRef ref="LogToConsole" />     <-- trace all classess in the classpath, since it is Root
        </Root>
    </Loggers>


</Configuration>
```

####  Appenders 

just examples and not limited to:

- ConsoleAppender
- [RollingFileAppender](#rolling_file_appender)   *(most used appender)*
- [SMTPAppender](#SMTP_appender)   *(may be useful)*
- FileAppender
- JDBCAppender
- Syslog Appender
- JMS Appender
- KafkaAppender



## <a name='rolling_file_appender'> RollingFileAppender </a>


### Rolling based on Date and Time

You can use the TimeBasedTriggeringPolicy to rollover the log file **based on the date and time pattern used in <FilePattern/>** element as follows.

```xml
<RollingFile name="RollingFile">
  <FileName>C:/log/mylog.log</FileName>
  <FilePattern>C:/log/time-based-logs/%d{yyyy-MM-dd-hh-mm}.log.gz</FilePattern>
  <PatternLayout>
    <Pattern>%d{yyyy-MMM-dd HH:mm:ss a} [%t] %-5level %logger{36} - %msg%n</Pattern>
  </PatternLayout>
  <Policies>
    <TimeBasedTriggeringPolicy interval="2" />
  </Policies>
  <DefaultRolloverStrategy max="5" />
</RollingFile>
```


| DATE/TIME Pattern       |    Description            |    Intervale Attribute Example  |
| :---         |    :----                    |:----     |
| **%d{yyyy-MM-dd-hh-mm}.log.gz**     | Roll the log files every minutes  | If interval=2, rollovers will occur every 2nd minutes. **E.g.** - 2017-07-26-09-57.log.gz, 2017-07-26-09-59.log.gz, 2017-07-26-10-01.log.gz, 2017-07-26-10-03.log.gz etc.. |
| **%d{yyyy-MM-dd-hh}.log.gz**     | Roll the log files hourly |  If interval=4, rollovers will occur every 4 hours.   **E.g.** - 2017-07-26-09.log.gz, 2017-07-26-10.log.gz, 2017-07-26-11.log.gz etc..
| **%d{yyyy-MM-dd}.log.gz**     |  Roll the log files daily |  If interval=1, rollovers will occur every day.    **E.g.**  - 2017-07-26.log.zip, 2017-07-27.log.zip etc..


**Note:**

To use the **max** attribute in **<DefaultRolloverStrategy max="5" />**, 

- The **<DefaultRolloverStrategy>** element define a rollover strategy that will keep up to 5 files per period.
- Example: 
    - If we specify the **TimeBasedTriggeringPolicy** policy to be daily roll over and **DefaultRolloverStrategy max="5"** then It will keep only 5 files per day and remove the others
- The DefaultRolloverStrategy will use the date pattern specified in the filePattern if a TimeBasedTriggeringPolicy is specified. To use the max attribute, specify a %i pattern in the filePattern, and add <SizeBasedTriggeringPolicy size="20 MB" /> to the rollover policies. (Or some other size of course.)

- Use env variable to specifiy the log directory
- Example:
```xml
<FilePattern>${log-path}/%d{yyyy-MM-dd-hh-mm}.log.gz</FilePattern>
```

we use **${log-path}** for log path

- We can achieve log files by date like this
```
filePattern="${log-path}/$${date:yyyy-MM}/app-%d{MM-dd-yyyy}-%i.log.gz"
```



example:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration>
<Appenders>

    <!-- Console Appender -->
    <Console name="Console" target="SYSTEM_OUT">
        <PatternLayout pattern="%d{yyyy-MMM-dd HH:mm:ss a} [%t] %-5level %logger{36} - %msg%n" />
    </Console>

    <!-- Rolling File Appender -->
    <RollingFile name="RollingFile">
        <FileName>C:\Users\mina\Desktop\logs\application.log</FileName>
        <FilePattern>C:\Users\mina\Desktop\logs\%d{yyyy-MM-dd-hh-mm}-%i.log.gz</FilePattern>
        <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5level %logger{2}:%L - %msg%n"/>
        <Policies>
            <TimeBasedTriggeringPolicy interval="1" />
        </Policies>
        <DefaultRolloverStrategy max="5" />
    </RollingFile>

</Appenders>
<Loggers>
    <Logger name="logging" level="debug" additivity="false">
        <AppenderRef ref="RollingFile" />
        <AppenderRef ref="Console" />
    </Logger>
    <Root level="trace">
        <AppenderRef ref="Console" />
    </Root>
</Loggers>
</Configuration>
```

##### log every Minute

```xml
    <!-- Rolling File Appender -->
    <RollingFile name="RollingFile">
        <FileName>C:\Users\mina\Desktop\logs\application.log</FileName>
        <FilePattern>C:\Users\mina\Desktop\logs\%d{yyyy-MM-dd-hh-mm}.log.gz</FilePattern>    <--- every minute
        <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5level %logger{2}:%L - %msg%n"/>
        <Policies>
            <TimeBasedTriggeringPolicy interval="1" />              <--- every minute
        </Policies>
        <DefaultRolloverStrategy max="5" />
    </RollingFile>
```




##### log every Hour


```xml
    <!-- Rolling File Appender -->
    <RollingFile name="RollingFile">
        <FileName>C:\Users\mina\Desktop\logs\application.log</FileName>
        <FilePattern>C:\Users\mina\Desktop\logs\%d{yyyy-MM-dd-hh}.log.gz</FilePattern>    <--- every hour
        <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5level %logger{2}:%L - %msg%n"/>
        <Policies>
            <TimeBasedTriggeringPolicy interval="1" />              <--- every hour
        </Policies>
        <DefaultRolloverStrategy max="5" />
    </RollingFile>
```

##### log every day


```xml
    <!-- Rolling File Appender -->
    <RollingFile name="RollingFile">
        <FileName>C:\Users\mina\Desktop\logs\application.log</FileName>
        <FilePattern>C:\Users\mina\Desktop\logs\%d{yyyy-MM-dd}.log.gz</FilePattern>    <--- every day
        <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5level %logger{2}:%L - %msg%n"/>
        <Policies>
            <TimeBasedTriggeringPolicy interval="1" />              <--- every day
        </Policies>
        <DefaultRolloverStrategy max="5" />
    </RollingFile>
```



### Rolling based on Size

You can use the SizeBasedTriggeringPolicy to rollover the log file **based on the date and time pattern used in <FilePattern/>** element as follows.


```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="INFO">  <!-- status logger is used internally by log4j2 components -->


    <Appenders>
        <Console name="LogToConsole" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5level %logger{2}:%L - %msg%n"/>
        </Console>

        <!-- Rolling over based on Log File Size-->
        <RollingFile name="RollingFile">
            <FileName>C:\Users\mina\Desktop\logs\application.log</FileName>
            <FilePattern>C:\Users\mina\Desktop\logs\application.%d{yyyy-MM-dd}-%i.log.gz</FilePattern>
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5level %logger{2}:%L - %msg%n"/>
            <Policies>
                <SizeBasedTriggeringPolicy size="500 MB"/>
            </Policies>
            <DefaultRolloverStrategy max="5"/>
        </RollingFile>

    </Appenders>


    <Loggers>
        <!-- avoid duplicated logs with additivity=false -->
        <Logger name="org.logging" level="debug" additivity="false">
            <AppenderRef ref="RollingFile"/>
            <AppenderRef ref="LogToConsole"/>
        </Logger>
        <Root level="trace">
            <AppenderRef ref="LogToConsole"/>
        </Root>
    </Loggers>


</Configuration>
```


### Rollover based on Log Size and Date Time

```xml
<RollingFile
  name="RollingFile"
  fileName="C:\Users\mina\Desktop\logs\application.log"
  filePattern="C:\Users\mina\Desktop\logs\application.%d{dd-MMM}-%i.log.gz"
  ignoreExceptions="false">
  <PatternLayout>
      <Pattern>%d{yyyy-MM-dd HH:mm:ss} %-5p %m%n</Pattern>
  </PatternLayout>
  <Policies>
      <OnStartupTriggeringPolicy />
        <SizeBasedTriggeringPolicy size="10 MB" />
        <TimeBasedTriggeringPolicy />
  </Policies>
  <DefaultRolloverStrategy max="5" />
</RollingFile>
```



## <a name='delete_logs'> Delete old logs with log4j2 </a>

You can control which files are deleted by any combination of:

- Name (matching a glob or a regex)
- Age ("delete if 14 days old or older")
- Count ("keep only the most recent 3")
- Size ("keep only the most recent files up to 500MB")


for more info 
https://logging.apache.org/log4j/2.x/manual/appenders.html#CustomDeleteOnRollover


Example: 
```xml
<RollingFile name="rollingFile" 
      fileName="/path/app.log"
      filePattern="/path/app.%d{yyyy-MM-dd}.log"
      ignoreExceptions="false">
. . .
      <DefaultRolloverStrategy>
        <!--
          * only files in the log folder, no sub folders
          * only rolled over log files (name match)
          * only files that are 4 days old or older
        -->
        <Delete basePath="C:\Users\mina\Desktop\logs\" maxDepth="1">
          <IfFileName glob="*.log.gz" />
          <IfLastModified age="4d" />
        </Delete>
      </DefaultRolloverStrategy>
 . . .

<RollingFile>
```


This will delete the log files end in ".log.gz" **AND** last modified 4 days.



## <a name='SMTP_appender'> SMTPAppender </a>

- Add mail dependency in pom.xml

```xml
<dependency>
    <groupId>com.sun.mail</groupId>
    <artifactId>javax.mail</artifactId>
    <version>1.6.2</version>
</dependency>
```

- It is good practice to place the SMTP logger in Root logger to log any error in the application and libraries

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN">
    <Appenders>
        <RollingRandomAccessFile name="LogToRollingRandomAccessFile" fileName="logs/app.log"
                filePattern="logs/$${date:yyyy-MM}/app-%d{MM-dd-yyyy}-%i.log.gz">
            <PatternLayout>
                <Pattern>%d %p %c{1.} [%t] %m%n</Pattern>
            </PatternLayout>
            <Policies>
                <TimeBasedTriggeringPolicy/>
                <SizeBasedTriggeringPolicy size="1 MB"/>
            </Policies>
            <DefaultRolloverStrategy max="10"/>
        </RollingRandomAccessFile>

        <SMTP>
            <name>LogToMail</name>
            <subject>Error Log From Log4j</subject>
            <to>dest_email@gmail.com</to>
            <from>sender_email@gmail.com</from>
            <smtpHost>smtp.gmail.com</smtpHost>
            <smtpUsername>sender_email@gmail.com</smtpUsername>
            <smtpPassword>XXXXX</smtpPassword>
            <smtpProtocol>smtps</smtpProtocol>
            <smtpPort>465</smtpPort>
            <ignoreExceptions>false</ignoreExceptions>
            <bufferSize>100</bufferSize>
            <HtmlLayout charset="UTF-8" locationInfo="true"/>
            <ThresholdFilter level="ERROR"/>
            <smtpDebug>true</smtpDebug>                 <-- set it true if you want to debug email sending (default is false)
        </SMTP>

    </Appenders>
    <Loggers>
        <Logger name="com.mypackage" level="debug" additivity="false">   <-- additivity = false means don't send the same message to the parent logger (Root logger)
            <AppenderRef ref="LogToRollingRandomAccessFile"/>
            <AppenderRef ref="LogToConsole"/>
        </Logger>
        <Root level="error">                               
            <AppenderRef ref="LogToMail"/>    
        </Root>
    </Loggers>
</Configuration>

```

**Note:**
If the email will be sent from **gmail** account, then this account should configure **Less secure app access** as follow:
1. Go to google account (Account -> Security)
2. go to **Less secure app access**
3. it must be ON  -> **Allow less secure apps: ON**   (the default value is OFF)



