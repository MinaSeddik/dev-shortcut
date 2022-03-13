# HTTP Keep-Alive

The Keep-Alive header is a general-type header. This header is used to hint at how the connection may be used to set a timeout and a maximum amount of requests. It can also be used to allow a single TCP connection to remain open for multiple HTTP requests/responses (default HTTP connection closed after each request). It is also known as a persistent connection. Enabling keep-alive totally depends on what server you are using and what access you have.

This directive holds two comma-separated parameters timeout and max.
- The **timeout** parameter holds the minimum amount of time which is the time(in seconds) of connection has to be kept open.
The **max** parameter holds an integer number define how the number of requests can be sent to this connection before closing the connection.

example from server side
```
HTTP/1.1 200 OK
Connection: Keep-Alive
Content-Encoding: gzip
Content-Type: text/html; charset=utf-8
Date: Thu, 17 Feb 2020 18:23:13 GMT
Keep-Alive: timeout=5, max=1000
Last-Modified: Mon, 17 Feb 2020 04:32:39 GMT
Server: Apache
``` 

> Keep-Alive: timeout=5, max=1000