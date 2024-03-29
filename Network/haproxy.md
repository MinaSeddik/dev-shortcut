# HAProxy Load Balancer and Reverse Proxy


- [Configuration Example](#Configuration_Example)

## <a name='Configuration_Example'> Configuration Example </a>


```
frontend httpsandhttp
   bind *:80
   bind *:443 ssl crt /Users/HusseinNasser/proxy/haproxy.pem alpn h2,http/1.1
  # bind *:443 
   timeout client 60s
   mode http
   acl app1 path_end -i /app1
   acl app2 path_end -i /app2
   http-request deny if { path -i -m beg /admin }  
   use_backend app1Servers if app1
   use_backend app2Servers if app2
   http-response set-header Strict-Transport-Security max-age=16000000;\ includeSubDomains;\ preload;
   default_backend allservers


backend app1Servers
   timeout connect 10s
   timeout server 10s
   balance source
   mode http
   server server2222 127.0.0.1:2222
   server server3333 127.0.0.1:3333
   
backend app2Servers
   timeout connect 10s
   timeout server 300s
   mode http
   server server4444 127.0.0.1:4444
   server server5555 127.0.0.1:5555 
  
   
backend allservers
   timeout connect 10s
   timeout server 100s
   mode http
   server server2222 127.0.0.1:2222
   server server3333 127.0.0.1:3333
   server server4444 127.0.0.1:4444
   server server5555 127.0.0.1:5555
```

frontend myapp
bind :443 ssl crt /path/to/cert.crt alpn h2,http/1.1
mode http