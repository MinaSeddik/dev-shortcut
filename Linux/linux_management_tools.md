# Linux Management tools

- [Disk Management commands](#disk_tools)
- [Memory Management commands](#memory_tools)
- [Process Management commands](#process_tools)
- [Networking commands](#networking_tools)


## <a name='disk_tools'> Disk Management commands </a>

```
sudo fdisk -l
```

For resize and partition
```
sudo cfdisk
```

```
sudo parted -l
```

```
lsblk
```

```
blkid
```

```
df -hT
df -kh
```

```
du -sh /home/mina   # summery
du -ah /home/mina   # all files and directories
du -sh /home/mina
```

Fo input/output state
```
iostat
iostat sda      # sda is the device name
iostat -d sda sdb 2   # Monitor I/O statistics for specific devices (e.g., sda and sdb) every 2 seconds
iostat sda sdb 5 10   # Monitor I/O statistics for specific devices (e.g., sda and sdb) every 5 seconds for a total of 10 updates
iostat -c  # Display only CPU-related statistics
iostat -t  # Display I/O statistics for all devices and include a timestamp for each report



```


## <a name='memory_tools'> Memory Management commands </a>

```
sudo cat /proc/meminfo 
```


```
free
free -m      # display memory in mega unit
free -g      # display memory in giga unit
free -s 2    # display memory with delay 2 seconds
```

```
vmstat -w
vmstat -w 3   # display stat with delay 3 seconds
```

```
top
```


```
htop
```

## <a name='process_tools'> Process Management commands </a>

```
lscpu
```

```
top
```
press **'o'** to filter by column

ex:
```
COMMAND=java

PID=728957
```

```
mpstat -P ALL 1
```

```
htop
```


```
ps
ps -aux
```

```
kill -L
kill -9 <pid>
```


## <a name='networking_tools'> Networking commands </a>

```
ifconfig 
ifconfig wlo1
```

```
ip addr 
```

```
traceroute google.com  
```

It's better to use netstat with **sudo**
```
sudo netstat         
sudo netstat -a       # all ports and connections regardless of their state (LISTEN, ESTABLISHED, ...)
sudo netstat -at      # all TCP ports
sudo netstat -au      # all UDP ports
sudo netstat -l       # listening ports only
sudo netstat -lt      # all listening TCP ports 
sudo netstat -tp      # -p for PID, -t for tcp connection
sudo netstat -atpn    # resolve port number
```

```
ip addr
```

```
telnet 192.158.56.158 8080
```

```
ping 162.101.89.208 
```

```
nslookup www.google.com 
```

```
dig google.com
```

```
nmap 192.168.1.4
```

```
sudo wireshark 
```

