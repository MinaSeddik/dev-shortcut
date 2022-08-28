# cURL command for REST testing


##### Command-line Options 
- [Verbose](#Verbose) 
- [Output](#Output) 
- [interactive -i](#interactive) 
- [help -h](#help) 

##### HTTP Methods With curl
- [GET](#GET) 
- [POST](#POST) 
    - [File upload](#File_upload) 
- [PUT](#PUT) 
- [DELETE](#DELETE) 

##### Custom Headers and Authentication
- [Custom Headers](#Custom_Headers) 
- [Authentication](#Authentication) 

##### MISC
- [HTTPS Certificate](#HTTPS)
- [FTP Connection](#FTP_connection)
- [Download to a File](#Download_File)
- [Ranges](#Ranges)
- [Uploading](#Uploading)
- [Cookies](#Cookies)
- [Config File](#Config_File)
- [Network Interface](#Network_Interface)
- [JSON pretty-print using **jq**](#JSON_pretty_print_jq)






## <a name='Verbose'> Verbose </a>

provide helpful information such as the resolved IP address, the port we're trying to connect to, and the headers.

```bash
curl -v http://www.example.com/
```

To get even more details and information on what curl does, try using the --trace or --trace-ascii options with a given file name to log to, like this:
```bash
curl --trace trace.txt www.haxx.se
```


## <a name='Output'> Output </a>

By default, curl outputs the response body to standard output. Additionally, we can provide the output option to save to a file:

```bash
curl -o out.json http://www.example.com/index.html
```

## <a name='interactive'> interactive -i </a>

show request header

```bash
curl -i out.json http://www.example.com/index.html
```

## <a name='help'> help -h </a>

cURL -h to get all Options

```bash
curl -h
```



## <a name='GET'> GET </a>

This is the default method when making HTTP calls with curl.

```bash
curl -v http://localhost:8082/spring-rest/foos/9
```

OR


```bash
curl -X GET http://localhost:8082/spring-rest/foos/9
```

Output:
```
*   Trying ::1...
* TCP_NODELAY set
* Connected to localhost (::1) port 8082 (#0)
> GET /spring-rest/foos/9 HTTP/1.1
> Host: localhost:8082
> User-Agent: curl/7.60.0
> Accept: */*
>
< HTTP/1.1 200
< X-Application-Context: application:8082
< Content-Type: application/json;charset=UTF-8
< Transfer-Encoding: chunked
< Date: Sun, 15 Jul 2018 11:55:26 GMT
<
{
  "id" : 9,
  "name" : "TuwJ"
}* Connection #0 to host localhost left intact
```

## <a name='POST'> POST </a>

We use this method to send data to a receiving service, which means we use the data option.

```bash
curl -d 'id=9&name=luke' http://localhost:8082/spring-rest/foos/new
```
This is POST (NOT GET)

Alternatively, we can pass a file containing the request body to the data option like this:

```bash
curl -d @request.json -H "Content-Type: application/json" http://localhost:8082/spring-rest/foos/new
```

Output:
```json
{
  "timestamp" : "15-07-2018 05:57",
  "status" : 415,
  "error" : "Unsupported Media Type",
  "exception" : "org.springframework.web.HttpMediaTypeNotSupportedException",
  "message" : "Content type 'application/x-www-form-urlencoded;charset=UTF-8' not supported",
  "path" : "/spring-rest/foos/new"
}
```

**This is because curl adds the following default header to all POST requests:**
```
Content-Type: application/x-www-form-urlencoded
```

In our usage, we’d usually want to customize the headers depending on our needs.

```bash
curl -X POST -d '{"id":9,"name":"John"}' -H 'Content-Type: application/json' http://localhost:8082/spring-rest/foos/new
```


Windows command prompt has no support for single quotes like the Unix-like shells.

As a result, we'd need to replace the single quotes with double quotes, though we try to escape them wherever necessary:


```bash
curl -X POST -d "{\"id\":9,\"name\":\"jack\"}" -H "Content-Type: application/json" http://localhost:8082/spring-rest/foos/new
```
  
```bash
curl -d "name=Rafael%20Sagula&phone=3320780" http://www.where.com/guest.cgi
```  
While -d uses the application/x-www-form-urlencoded mime-type


#### <a name='File_upload'> File upload </a>    

-F accepts parameters like -F "name=contents". If you want the contents to be read from a file,
```bash
curl -F "coolfiles=@fil1.gif;type=image/gif,fil2.txt,fil3.html" http://www.post.com/postit.cgi
```
  
```bash
curl -F "file=@cooltext.txt" -F "yourname=Daniel" -F "filedescription=Cool text file with cool text inside" http://www.post.com/postit.cgi
```  


## <a name='PUT'> PUT </a>

we use the -X option.

```bash
curl -d @request.json -H 'Content-Type: application/json' -X PUT http://localhost:8080/spring-rest/foos/9
```

## <a name='DELETE'> DELETE </a>


```bash
curl -X DELETE http://localhost:8080/spring-rest/foos/9
```


## <a name='Custom_Headers'> Custom Headers </a>

```bash
curl -H "Host: host.example.com" http://example.com/
```

```bash
curl -H "User-Agent:" http://example.com/
```


```bash
curl -d @request.json -H "Content-Type: application/json"  -H "Accept: application/json" http://example.com/
```


## <a name='Authentication'> Authentication </a>

For basic authentication, we can simply embed the username and password combination inside our request using the user option:


```bash
curl --user mina:secretPassword http://example.com/
```

OR

```bash
curl -u mina:secretPassword http://example.com/
```

However, if we want to use **OAuth2** for authentication, we first need to get the access_token from our authorization service.

The service response would contain the access_token:

```json
{
  "access_token": "b1094abc0-54a4-3eab-7213-877142c33fh3",
  "token_type": "bearer",
  "refresh_token": "253begef-868c-5d48-92e8-448c2ec4bd91",
  "expires_in": 31234
}
```


Now we can use the token in our Authorization header:

```bash
curl -H "Authorization: Bearer b1094abc0-54a4-3eab-7213-877142c33fh3" http://example.com/
```


## MISC 

### <a name='HTTPS'> HTTPS Certificates </a>

Secure HTTP requires a TLS library to be installed and used when curl is built. If that is done, curl is capable of retrieving and posting documents using the HTTPS protocol.
```bash
curl https://www.secure-site.com
```

Example on how to automatically retrieve a document using a certificate with a personal password:
```bash
curl -E /path/to/cert.pem:password https://secure.site.com/
```


Use **-k** option to allow insecure connection
```bash
curl -k https://whatever.com/script.php
```

you can use specific certificate
```bash
curl --cacert my-ca.crt https://whatever.com/script.php
```

to use a real certificate of the tested website with curl, checkout
http://javamemento.blogspot.com/2015/10/using-curl-with-ssl-cert-chain.html


### <a name='FTP_connection'> FTP Connection </a>

- Get a file from FTP site:

```bash
curl ftp://ftp.funet.fi/README
```

```bash
curl ftps://files.are.secure.com/secrets.txt
```

```bash
curl --ftp-ssl ftp://files.are.secure.com/secrets.txt
```



- Get a directory listing of an FTP site:
```bash
curl ftp://ftp.funet.fi
```

- Using Passwords
```bash
curl ftp://name:passwd@machine.domain:port/full/path/to/file
```
or specify them with the -u flag like
```bash
curl -u name:passwd ftp://machine.domain:port/full/path/to/file
```

Note: specify **--ftp-ssl** option to connect to sftp



### <a name='Download_File'> Download to a File </a>

- Get a web page and store in a local file with a specific name:
```bash
curl -o thatpage.html http://www.example.com/
```

- Get a web page and store in a local file, make the local file get the name of the remote document (if no file name part is specified in the URL, this will fail):
```bash
curl -O http://www.example.com/index.html
```

- Fetch two files and store them with their remote names:
```bash
curl -O www.haxx.se/index.html -O curl.se/download.html
```


### <a name='Ranges'> Ranges </a>

- Get the first 100 bytes of a document:
```bash
curl -r 0-99 http://www.get.this/
```


### <a name='Uploading'> Uploading </a>

- HTTP - Upload all data on **stdin** to a specified HTTP site:
```bash
curl -T - http://www.upload.com/myfile
```

- HTTP - Upload data from a specified file, login with user and password:
```bash
curl -T uploadfile -u user:passwd http://www.upload.com/myfile
```

- FTP - Upload data from a specified file, login with user and password:
```bash
curl -T uploadfile -u user:passwd ftp://ftp.upload.com/myfile
```

- FTP - Upload a local file to get **appended** to the remote file:
```bash
curl -T localfile -a ftp://ftp.upload.com/remotefile
```


### <a name='Cookies'> Cookies </a>

Example, get a page that wants my name passed in a cookie:
```bash
curl -b "name=Daniel" www.sillypage.com
```

### <a name='Config_File'> Config File </a>

Curl automatically tries to read the .curlrc file (or _curlrc file on Microsoft Windows systems) from the user's home dir on startup.



Prevent curl from reading the default file by using -q as the first command line parameter, like:
```bash
curl -q www.thatsite.com
```


### <a name='Network_Interface'> Network Interface </a>

Get a web page from a server using a specified port for the interface:


```bash
curl --interface eth0:1 http://www.example.com/
```

```bash
curl --interface 192.168.1.10 http://www.example.com/
```


## <a name='JSON_pretty_print_jq'> JSON pretty-print using jq </a>

it can be helpful to pipe the response through jq to pretty-print it. The simplest jq program is the expression ., which takes the input and produces it unchanged as output.

```bash
curl 'https://api.github.com/repos/stedolan/jq/commits?per_page=5' | jq '.'
```

```bash
curl 'https://api.github.com/repos/stedolan/jq/commits?per_page=5' | jq 
```

#### Installation on Ubuntu

It is possible to perform sudo apt-get install jq however you need to inform the system where to find jq

step (1): Open your sources file in a text editor:
```bash
sudo vim /etc/apt/sources.list
```

step (2): Add the following line to the end of that file
```bash
deb http://us.archive.ubuntu.com/ubuntu vivid main universe
```

Note:   
**vivid** is Ubuntu 15.04 distribution code name

- Use **focal** for Ubuntu 20.04 LTS distribution code name
```bash
deb http://us.archive.ubuntu.com/ubuntu vivid main universe
```
OR set the ubuntu version name according to your running operating system

To get Ubuntu distribution code name  
You can just source (the source command is a dot `.`) the `/etc/os-release` and you'll have access to all the variables defined there:
```bash
$ . /etc/os-release
$ echo "$VERSION"
14.04, Trusty Tahr
```
 
step (3): Then re-index apt-get so that it can find jq:
```bash
sudo apt-get update
```

step (4): Then do the normal install and you should be the proud new user of jq!
```bash
 sudo apt-get install jq
```

