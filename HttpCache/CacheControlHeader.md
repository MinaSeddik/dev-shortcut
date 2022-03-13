# HTTP Cache

Cache Control is a mechanism to improve performance and responsiveness when serving HTTP

- Allowing each resource to define its caching policy via the Cache-Control header.
- The Cache-Control header defines who can cache the response, under which conditions, and for how long.


### Cache locations
1. Browser cache (by the client)
2. Proxy cache (by ISP or by an organization)
3. Reverse proxy

### Caching Headers
1. expires
    - exists before HTTP 1.1
    - might used for backward comparability
    - the value is absolute expiry date
    - example
        > Expires: Sat, 13 May 2017 07:00:00 GMT 
2. pragma
    - exists before HTTP 1.1
    - might used for backward comparability
    - only possible value is **no-cache**
3. Cache-control
    - introduced in HTTP 1.1
    - common and best way to control caching
    - **prefered caching header** and widely used
    -  It is multi-value header:
        - **private** means only cached in the client
            - example
                > Cache-control: private
        - **public** means can be cached in the proxies and CDN (in addition of the clients)
            - example
                > Cache-control: public
        - **no-store** means content is not to be cached
            - example
                > Cache-control: no-store                    
        - **no-cache** means content can be cached but must be validated from the server (see validators Headers)
            - example
                > Cache-control: no-cache
        - **max-age** means content can be cached for a given number of seconds
            - example
                > Cache-control: max-age=3600     
        - **s-max-age** shard cache places (proxies)
            - example
                > Cache-control: s-max-age=3600 
        - **must-revalidate** means the stale content should NOT be served in the client side and must be revalidate from the server 
            - example
                > Cache-control: max-age=3600, must-revalidate 
        - **proxy-revalidate** means the stale content should NOT be served in the proxy side and must be revalidate from the server 
            - example
                > Cache-control: max-age=3600, proxy-revalidate 
                                       
example (1): 
> Cache-control: max-age=3600, public  
>>this means can be cached by browsers or any proxies for 3600 seconds only

example (2):
> Cache-control: max-age=3600, private                   
>>this means can be cached only by browsers for 3600 seconds only                     
                     
example (2):
> Cache-control: max-age=600, s-max-age=3600                   
>>this means can be cached by browsers for 600 seconds only (max-age), but cached by proxies for 3600 seconds only (s-max-age)
  
  
  
                      
### Validators Headers
1. **etag** stands for entity tags, It is a unique identifier associated to a resource
    client will use this etag with **If-None-Match** header to the server, then the server matches this etag with the etag of the content  
    If there is a mismatch, the server will notify the client to get the new content
    > Server
    >> Cache-control: max-age: 3600, Public  

    >> ETag: "j89jkhdfgljksd678gdsf6g8dsfg"
    
    > Client
    >> If-None-Match: "j89jkhdfgljksd678gdsf6g8dsfg"

2. **Last-Modified** It is the date and time of the last modification of the content  
    In subsequent requests, the browser sends the value of this Last-Modified header in the If-Modified-Since header
     > Server
     >> Cache-Control : public, max-age=3600
        
     >>Last-Modified: Mon, 03 Jun 2020 11:35:28 GMT 

     >Client  
     >> If-Modified-Since: Mon, 03 Jun 2020 11:35:28 GMT
     
If the token hasn't changed or if the content hasn't been modified since the last modified time, 
then a **304 - Not modified** response is generated.     
**304 - Not modified** response tells the browser that the resource in its local cache hasn't changed on the server, and its cache lifetime can be renewed for another 300 seconds.     
This saves time and bandwidth.


### Best Strategy for caching

#### 1. Light Caching

   - for html, rss and dynamic content  
   >  Cache-control: Private, no-cache 

   Only cached on client side (the browser), and should be validates with the server
    

#### 2. Aggressive Caching

   - for css, javascripts and images  
   >  Cache-control: Public, max-age=31556926 

   Could be cached on client side and proxies for a year  
   Google generally recommends a time longer than 6 months or even a year for such content
    

#### Fingerprint filename (Cache busting)
   the build system generates file anme for each build and inject it to the HTML file  
   ex:
   > style.jui0236.css

[//]: # (TODO good refrence:)
for more info:  
- cache busting in angular   
    - https://medium.com/m/global-identity?redirectUrl=https%3A%2F%2Fnetbasal.com%2Fstrategies-for-cache-busting-translation-files-in-angular-86143ee14c3c#:~:text=To%20prevent%20visitors%20from%20being,of%20a%20stale%2C%20cached%20version.      
    - https://stackoverflow.com/questions/57989172/cache-busting-after-deploying-angular-8-application       

- cache busting in ReactJS
    - https://innovationm.co/cache-busting-in-react-js/    
    - https://dev.to/flexdinesh/cache-busting-a-react-app-22lk   
    
[//]: # (TODO good refrence:)      


#### Debugging HTML headers
   - use curl with -I opetion to display the headers
   ```
    curl -I http://mysite.com/path
   ```  

   - use dev too on thw web browser
    
### Handling the Cache Control Header
The Cache-Control header can be handled in the following ways:
- From within the application, adding the header to the response object, for example calling the HttpServletResponse#setHeader(String name, String value) API if you are using Java and the Servlet APIs.
- From a web server such as Apache (see mod_expires).
- From load balancers, proxies, and similar (for example, HAProxy and Nginx).
- From Meta Tags in http pages.

Usually there are two ways to set a header:
- Override the value if the header is already set.
- Add a value to the exiting values if the header is already set.




