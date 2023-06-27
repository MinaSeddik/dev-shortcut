# Benchmarking with wrk


## Example

```
wrk -t12 -c400 -d30s --latency http://127.0.0.1:8080/index.html
```

This runs a benchmark for 30 seconds (-d30s), 
using 12 threads (-t12), and keeping 400 per thread (-c400) HTTP connections open. The output after running it looks something like this:
```
Running 30s test @ http://localhost:8080/index.html
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency   635.91us    0.89ms  12.92ms   93.69%
    Req/Sec    56.20k     8.07k   62.00k    86.54%
Latency Distribution
  50% 250.00us
  75% 491.00us
  90% 700.00us
  99% 5.80ms  
22464657 requests in 30.00s, 17.76GB read
Requests/sec: 748868.53
Transfer/sec:    606.33MB
```


## Running with lua script

```
wrk -c1 -t1 -d5s -s ./my-script.lua --latency http://localhost:8000
```



