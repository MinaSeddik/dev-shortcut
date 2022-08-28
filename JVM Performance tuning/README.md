# Java Performance and tuning

- [JVM flags](#jvm_flags)
- [jcmd Command](#jcmd_cmd)
- [jinfo Command](#jinfo_cmd)
- [jstack Command](#jstack_cmd)
- [jmap Command](#jmap_cmd)
- [JDK Flight Recording](#jdk_flight_recording)
- [Monitoring and Profiling tools](#monitor_profiling_tools)
- [Garbage Collector Analysis](#gc_analysis)
- [Heap dump](#heap_dumps)
- [String pool, String table and String interning](#string_pool)
- [VisualVM and JConsole remote connection](#visualvm_jconsole_remote)



## <a name='jvm_flags'> JVM flags </a>

To print All available JVM flags
```
-XX:+UnlockDiagnosticVMOptions   <--- in case of Java-8
-XX:+PrintFlagsFinal -version
```

example:
```
java other_options -XX:+PrintFlagsFinal -version
```

## <a name='jcmd_cmd'> jcmd Command </a>

### jcmd examples:
```
jcmd <process_id> help     <---- to list all available commands
jcmd <process_id> VM.uptime
jcmd <process_id> VM.system_properties
jcmd <process_id> VM.version
jcmd <process_id> VM.command_line
jcmd <process_id> VM.flags
jcmd <process_id> Thread.print
```

you can use jcmd to set JVM flag for a running process, 
under condition, this flag is writable 
> **Writable flags are labeled as {manageable}**

```
jcmd <process_id> VM.flags -all | grep manageable
```

to set a specific manageable flag
```
jcmd <process_id> VM.set_flag ConcGCThreads 4
```

also, we can use jcmd to display class histogram
```
jcmd <process_id> GC.class_histogram
```

## <a name='jinfo_cmd'> jinfo Command </a>

**jinfo** can inspect the value of an individual flag:

### jinfo examples:

```
jinfo -flag PrintGCDetails <process_id>  // the same as `-XX:+PrintGCDetails`

jinfo -flag HeapDumpPath <process_id>
```

- you can turn on / off any JVM flag

turns off PrintGCDetails
```
jinfo -flag -PrintGCDetails process_id
jinfo -flag PrintGCDetails process_id
-XX:-PrintGCDetails
```

## <a name='jstack_cmd'> jstack Command </a>

###  jstack examples:

- print thread dump - stack trace
```
jstack <process_id>
```

... Lots of output showing each thread's stack ...

## <a name='jmap_cmd'> jmap Command </a>

### jmap examples:

to print heap dump
```
jmap <process_id>
```

example:
```
jmap -dump:live,format=b,file=/path/to/heapdump-file.hprof 398452  
```

then you can use **jvisualvm** or **Eclipse Memory Analyzer (MAT)** to load the heap dump and analyse it


## <a name='jdk_flight_recording'> JDK Flight Recording </a>

- Java Flight Recorder (JFR) is a monitoring tool that collects information about the events in a Java Virtual Machine (JVM) during the execution of a Java application.
- JFR has two main concepts: **events** and **dataflow**
- For JDK 8, to be able to activate JFR, we should start the JVM with the options +UnlockCommercialFeatures and +FlightRecorder, starting from JDK 11, we may use it without activating anything.
- we shall use Java Mission Control (**jmc**) to visualize the data collected by JFR.
  > https://jdk.java.net/jmc/8/
- jmc tool offer the best Method profiling ever, very recommended to use

### Activate Java Flight Recorder from Command line

```
java -XX:+UnlockCommercialFeatures -XX:+FlightRecorder 
  -XX:StartFlightRecording=duration=200s,filename=flight.jfr path-to-main-class
```
This command launches the application and activates the recording, which starts immediately and lasts no more than 200 seconds. Collected data is saved in an output file, flight.jfr. We'll describe the other options in more detail in the next section

### Activate Java Flight Recorder with jcmd

```
jcmd <process_id> JFR.start duration=100s filename=flight.jfr
```

ex:
```
jcmd 391799 JFR.start duration=100s filename=~/flight.jfr
```
then use **jmc** tool to analyse it


## <a name='monitor_profiling_tools'> Monitoring and Profiling tools </a>

### Java Monitoring tools ***(GUI monitoring tools)***
- Java VisualVM (**jvisualvm**)   ->  https://visualvm.github.io/download.html   with Itellij plugin
- JConsole (**jconsole**)
- Java Mission Control (**jmc**)   **[JDK Flight Recording]** -> https://jdk.java.net/jmc/8/


### Profiling Tools
- **JProfiler** - *Not free and needs license*
- **Visualvm**  - >  https://visualvm.github.io/download.html   with Itellij plugin


## <a name='gc_analysis'> Garbage Collector Analysis </a>

### GC log Analysis

#### GC log - Java 8

```
-Xloggc:gc.log -XX:+PrintGCTimeStamps -XX:+UseGCLogFileRotation  -XX:NumberOfGCLogFile=8 -XX:GCLogFileSize=8m
```

That will log GC events with timestamps to correlate to other logs and limit the
retained logs to 64 MB in eight files. This logging is minimal enough that it can be
enabled even on production systems.


#### GC log - Java 11

```
-Xlog:gc*:file=gc.log:time:filecount=7,filesize=8M
```

to log into the console (like in intellij console)
-Xlog:gc*

you can analyse the gc log using
> **https://gceasy.io/**


### scriptable solution, jstat Command
```
jstat -options
jstat -gcutil <process_id> 1000  <--- display GC log info every second
jstat -gcutil 23461 1000 
```

## <a name='heap_dumps'> Heap dump </a>

### Heap Histograms

```
jcmd 8998 GC.class_histogram
jmap -histo <process_id>
jmap -histo:live <process_id>
```

### Heap Dump

```
jcmd <process_id> GC.heap_dump /path/to/heap_dump.hprof
```

OR

```
jmap -dump:live,file=/path/to/heap_dump.hprof process_id
```

### Capture a Heap Dump Automatically on Error
    
```
java -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=<file-or-dir-path>
```

then you can use **jvisualvm** or **Eclipse Memory Analyzer (MAT)** to load the heap dump and analyse it

## <a name='string_pool'> String pool, String table and String interning </a>

All string literals and constant-valued strings as defined in the source files are automatically interned when the program starts up, and additional strings can be interned using the String#intern() method.

```
jcmd <process_id> VM.stringtable
```

If we want to increase the pool size in terms of buckets, 
we can use the StringTableSize JVM option:
```
-XX:StringTableSize=131072
```
Note that the default value is **65,536** in Java 11


you can check the value 
```
XX:+PrintFlagsFinal
```

### Find the most duplicate Strings in the application

Knowing if you have a large number of duplicate strings requires heap analysis. Here’s
one way to do that with the **Eclipse Memory Analyzer**:
1. Load the heap dump
2. From the Query Browser, select Java Basics → Group By Value
3. For the objects argument, type in java.lang.String
4. Click the Finish button


To check the whole native memory sections
```
jcmd <process_id> VM.native_memory scale=MB
```
Note: in order to get native memory details, 
start the JVM with summary or detail tracking using the command line option: 
**-XX:NativeMemoryTracking=summary** or **-XX:NativeMemoryTracking=detail**.

- performance impacts of enabling Java Native Memory Tracking (NMT)
    > Get detail data: To get a more detailed view of native memory usage, start the JVM with command line option: -XX:NativeMemoryTracking=detail. This will track exactly what methods allocate the most memory. Enabling NMT will result in 5-10 percent JVM performance drop and memory usage for NMT adds 2 words to all malloc memory as malloc header. NMT memory usage is also tracked by NMT.


### Native Memory Tracking (NMT)

we should enable the native memory tracking using JVM tuning flag: -XX:NativeMemoryTracking=off|sumary|detail.
```
java -XX:NativeMemoryTracking=summary -Xms300m -Xmx300m -XX:+UseG1GC -jar app.jar
```

When NMT is enabled, we can get the native memory information at any time using the jcmd command:
```
jcmd <process_id> VM.native_memory
```

#### Total Allocations
```
Native Memory Tracking:
Total: reserved=1731124KB, committed=448152KB
```
Reserved memory represents the total amount of memory our app can potentially use. Conversely, the committed memory is equal to the amount of memory our app is using right now.

Despite allocating 300 MB of heap, the total reserved memory for our app is almost 1.7 GB, much more than that. Similarly, the committed memory is around 440 MB, which is, again, much more than that 300 MB.

#### Heap
```
Java Heap (reserved=307200KB, committed=307200KB)
          (mmap: reserved=307200KB, committed=307200KB)
```
300 MB of both reserved and committed memory, which matches our heap size settings.

#### Metaspace
```
Class (reserved=1091407KB, committed=45815KB)
      (classes #6566)
      (malloc=10063KB #8519) 
      (mmap: reserved=1081344KB, committed=35752KB)
```
Almost 1 GB reserved and 45 MB committed to loading 6566 classes.

#### Thread
```
Thread (reserved=37018KB, committed=37018KB)
       (thread #37)
       (stack: reserved=36864KB, committed=36864KB)
       (malloc=112KB #190) 
       (arena=42KB #72)
```
In total, 36 MB of memory is allocated to stacks for 37 threads – almost 1 MB per stack. JVM allocates the memory to threads at the time of creation, so the reserved and committed allocations are equal.

#### Code Cache
```
Code (reserved=251549KB, committed=14169KB)
     (malloc=1949KB #3424) 
     (mmap: reserved=249600KB, committed=12220KB)
```
Currently, almost 13 MB of code is being cached, and this amount can potentially go up to approximately 245 MB.


#### GC
```
GC (reserved=61771KB, committed=61771KB)
   (malloc=17603KB #4501) 
   (mmap: reserved=44168KB, committed=44168KB)
```
As we can see, almost 60 MB is reserved and committed to helping G1.

#### Symbol and sprint pool table
Here is the NMT report about the symbol allocations, such as the string table and constant pool:

```
Symbol (reserved=10148KB, committed=10148KB)
(malloc=7295KB #66194)
(arena=2853KB #1)

```
Almost 10 MB is allocated to symbols.

## <a name='visualvm_jconsole_remote'> VisualVM and JConsole remote connection </a>

### VisualVM over ssh

to enable JMX, start jvm process with 
```bash
    -Dcom.sun.management.jmxremote.ssl=false 
    -Dcom.sun.management.jmxremote.authenticate=false 
    -Dcom.sun.management.jmxremote.port=9010
    -Dcom.sun.management.jmxremote.rmi.port=9011
    -Djava.rmi.server.hostname=localhost
    -Dcom.sun.management.jmxremote.local.only=false
```

to enable ssh
```
ssh -i yourPermissionFile.pem -l username 101.101.101.101 -L 9010:localhost:9010 -L 9011:localhost:9011
```

and 

```
visualvm.exe -J-Dnetbeans.system_socks_proxy=localhost:9696 -J-Djava.net.useSystemProxies=true
```


### JConsole over ssh local port forwarding

Create the SSH socks proxy locally on some free port (e.g. 7777):
```
ssh -fN -D 7777 user@firewalled-host
```

Run JConsole by specifying the SOCKS proxy (e.g. localhost:7777) and the address for the JMX server (e.g. localhost:2147)
```
jconsole -J-DsocksProxyHost=localhost -J-DsocksProxyPort=7777 service:jmx:rmi:///jndi/rmi://localhost:2147/jmxrmi -J-DsocksNonProxyHosts=
```
    

As mentioned in one of the answers below, from JDK 8u60+ you also need to have the -J-DsocksNonProxyHosts= option in order to get it working.


#### Reference

> https://serce.me/posts/18-11-2020-allocate-direct/




