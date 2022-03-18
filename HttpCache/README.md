# HTTP Headers

- [HTTP Cache-Control](./CacheControlHeader.md)
- [HTTP Connection and Keep-Alive](#connections)
- [Accept](#accept)
- [Authorization](#authorization)
- [Set-Cookie](#set_cookie)
- [Cookie](#cookie)
- [Host](#host)
- [Server](#server)
- [Referer](#referer)
- [User-Agent](#user_agent)
- [ETag](#etag)
- [Location](#location)
- [Retry-After](#retry_after)
- [WWW-Authenticate](#www_authenticate)
- [Content-Length](#content_length)
- [Content-Encoding](#content_encoding)
- [Content-Type](#content_type)




## <a name='connections'> HTTP Connection and Keep-Alive </a>

It is a **Client** Header

The Keep-Alive header is a general-type header. This header is used to hint at how the connection may be used to set a timeout and a maximum amount of requests. It can also be used to allow a single TCP connection to remain open for multiple HTTP requests/responses (default HTTP connection closed after each request). It is also known as a persistent connection. Enabling keep-alive totally depends on what server you are using and what access you have.

This directive holds two comma-separated parameters timeout and max.
- The **timeout** parameter holds the minimum amount of time which is the time(in seconds) of connection has to be kept open.
The **max** parameter holds an integer number define how the number of requests can be sent to this connection before closing the connection.

example from server side
```
HTTP/1.1 200 OK
Connection: Keep-Alive                  <-----  Keep connection alive
Keep-Alive: timeout=5, max=1000         <-----  Keep connection alive for 5 secounds and max 1000 request per connection
Content-Encoding: gzip
Content-Type: text/html; charset=utf-8
Date: Thu, 17 Feb 2020 18:23:13 GMT
Keep-Alive: timeout=5, max=1000
Last-Modified: Mon, 17 Feb 2020 04:32:39 GMT
Server: Apache
``` 

#### Connections

> Connection: keep-alive

**keep-alive** This directive indicates that the client wants to keep the connection open or alive after sending the response



> Connection: close  

**close** connection directive indicates that the client wants to close the connection after sending the response




## <a name='accept'> Accept </a>

It is a **Client** Header

The Accept request-header field can be used to specify certain media types which are acceptable for the response. 
The general syntax is as follows:

```
Accept: type/subtype [q=qvalue]
```

Multiple media types can be listed separated by commas and the optional qvalue represents an acceptable quality level for accept types on a scale of 0 to 1. Following is an example


```
Accept: text/plain; q=0.5, text/html, text/x-dvi; q=0.8, text/x-c
```


## <a name='authorization'> Authorization </a>

It is a **Client** Header

The Authorization request-header field value consists of credentials containing the authentication information of the user agent for the realm of the resource being requested

```
Authorization : credentials
```

ex:
```
Authorization: BASIC Z3Vlc3Q6Z3Vlc3QxMjM=
```

## <a name='set_cookie'> Set-Cookie </a>

It is a **Server** Header

The Set-Cookie response-header field contains a name/value pair of information to retain for this URL. The general syntax is:

```
Set-Cookie: NAME=VALUE; OPTIONS
```

## <a name='cookie'> Cookie </a>

It is a **Client** Header to send cookies to the server

The Cookie request-header field value contains a name/value pair of information stored for that URL. Following is the general syntax:

```gitignore
Cookie: name=value
```

Multiple cookies can be specified separated by semicolons as follows:
```gitignore
Cookie: name1=value1;name2=value2;name3=value3
```

## <a name='host'> Host </a>

It is a **Client** Header

The Host request-header field is used to specify the Internet host and the port number of the resource being requested. The general syntax is:

```
GET /pub/WWW/ HTTP/1.1
Host: www.w3.org
```
## <a name='server'> Server </a>

It is a **Server** Header

The Server response-header field contains information about the software used by the origin server to handle the request.

```gitignore
Server : product | comment
```

ex:
```
Server: Apache/2.2.14 (Win32)
```

## <a name='referer'> Referer </a>

It is a **Client** Header

The Referer request-header field allows the client to specify the address (URI) of the resource from which the URL has been requested. The general syntax is as follows:

```
Referer: http://www.tutorialspoint.org/http/index.htm
```


## <a name='user_agent'> User-Agent </a>

It is a **Client** Header

The User-Agent request-header field contains information about the user agent originating the request.

```
User-Agent: Mozilla/4.0 (compatible; MSIE5.01; Windows NT)
```

## <a name='etag'> ETag </a>

It is a **Server** Header

The ETag response-header field provides the current value of the entity tag for the requested variant. The general syntax is:

```
ETag: "xyzzy"
ETag: W/"xyzzy"
```


## <a name='location'> Location </a>

It is a **Server** Header

The Location response-header field is used to redirect the recipient to a location other than the Request-URI for completion. 

```
Location: http://www.tutorialspoint.org/http/index.htm
```



## <a name='retry_after'> Retry-After </a>

It is a **Server** Header

The Retry-After response-header field can be used with a 503 (Service Unavailable) response to indicate how long the service is expected to be unavailable to the requesting client. The general syntax is:


```
Retry-After : HTTP-date | delta-seconds
```

examples:
```
Retry-After: Fri, 31 Dec 1999 23:59:59 GMT
Retry-After: 120
```



## <a name='www_authenticate'> WWW-Authenticate </a>

It is a **Server** Header

The WWW-Authenticate response-header field must be included in 401 (Unauthorized) response messages. The field value consists of at least one challenge that indicates the authentication scheme(s) and parameters applicable to the Request-URI.  

```
WWW-Authenticate: BASIC realm="Admin"
```



## <a name='content_length'> Content-Length </a>

The Content-Length entity-header field indicates the size of the entity-body, 
```
Content-Length: 3495
```


## <a name='content_encoding'> Content-Encoding </a>

The Content-Encoding entity-header field is used as a modifier to the media-type.  

```
Content-Encoding: gzip
```

If the content-coding of an entity in a request message is not acceptable to the origin server, the server should respond with a status code of 415 (Unsupported Media Type).


## <a name='content_type'> Content-Type </a>



The Content-Type entity-header field indicates the media type of the entity-body sent to the recipient or, in the case of the HEAD method, the media type that would have been sent, had the request been a GET. The general syntax is:

```
Content-Type: text/html; charset=ISO-8859-4
```
