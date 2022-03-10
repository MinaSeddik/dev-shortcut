# SSH Key Pair 


The SSH key pair is used to authenticate the identity of a user or process that wants to access a remote system using the SSH protocol

What is Key pair ?
> A key pair is a combination of a public key that is used to encrypt data and a private key that is used to decrypt data.

What is Key pair types ?
> Currently there are 2 types of Key pair
> - **RSA**: RSA is a public-key cryptosystem that is widely used for secure data transmission
> - **Ed25519**: ED25519 is an elliptic curve based public-key system commonly used for SSH authentication.

*Ed25519 is probably the strongest mathematically (and also the fastest), but not yet widely supported. At least 256 bits long. RSA is the best bet if you can't use Ed25519. At least 3072 bits long.*

According to gitlab
> The book Practical Cryptography With Go suggests that ED25519 keys are more secure and performant than RSA keys.

and recommends
> If you use RSA keys for SSH ... that you use a key size of at least 2048 bits.


---

#### Generate key pair of **Ed25519** type  *(recommended)*

By default, a user’s SSH keys are stored in that user’s ~/.ssh directory.
 ```
cd ~/.ssh
```

Generate key pair 
 ```
ssh-keygen -t ed25519 -C "your_email@example.com"
```

> **-t**: type  
> **-C**: comment

```
> Enter a file in which to save the key (/Users/you/.ssh/id_ed25519): [Press enter]
```

```
> Enter passphrase (empty for no passphrase): [Type a passphrase]
> Enter same passphrase again: [Type passphrase again]
```

You can generate a key pair of type RSA: *(Not recommended)*

```
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

At this point, a new SSH key will have been generated at the previously specified file path.

#### Add the new SSH key to the ssh-agent

What does ssh-agent do?
> ssh-agent is a key manager for SSH.   
> It holds your keys and certificates in memory, unencrypted, and ready for use by ssh . It saves you from typing a passphrase every time you connect to a server.

Before adding the new SSH key to the ssh-agent first ensure the ssh-agent is running by executing:
```
eval "$(ssh-agent -s)"
```

> Agent pid 59566


Once the ssh-agent is running the following command will add the new SSH key to the local SSH agent.

```
ssh-add ~/.ssh/id_ed25519
```

The new SSH key is now registered and ready to use!


#### Add the public key to github

Copy the public key
```
cat ~/.ssh/id_ed25519.pub
```

Paste it over under SSH settings in gitlab  


#### Known_hosts file
what is the purpose of Known_hosts file?
> The known_hosts File is a client file containing all remotely connected known hosts, and the ssh client uses this file. This file authenticates for the client to the server they are connecting to. The known_hosts file contains the host public key for all known hosts.

