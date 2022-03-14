# Cryptography


- [Generate Random Cryptographically Secure Token](#random_token)
- [UUIDs](#uuids)
- [bycrypt](#bycrypt)   <--------- to be done TODO
- [Symmetric vs Asymmetric Encryption](./SymmetricAsymmetricEncryption.md)



## <a name='map'> Generate Random Cryptographically Secure Token </a>


Use **SecureRandom**: A class provides a cryptographically strong random number generator (RNG)

```java

private String generateSafeToken() {
    SecureRandom random = new SecureRandom();
    byte bytes[] = new byte[20];
    random.nextBytes(bytes);
    Encoder encoder = Base64.getUrlEncoder().withoutPadding();
    String token = encoder.encodeToString(bytes);
    return token;
}

``` 

## <a name='uuids'> UUIDs </a>

UUIDs of any kind **do not promise to be cryptographically secure** as it is not guaranteed in the [RFC](https://www.rfc-editor.org/rfc/rfc4122).   
Certain implementations may use a cryptographically secure random number generator, but we wouldn't rely on it.



The representation of the UUID uses hex digits
```
237e9877-e79b-12d4-a765-321741963000  
```
- Java UUID is made up of hex digit along with four hyphens (-). It is 36 characters long unique number, including four hyphens. A UUID may be nil, in which all bits are set to zero.
- Java UUID class are for manipulating the Leach-Salz variant,

- The layout of a variant 2 (Leach-Salz) UUID is as follows: The most significant long consists of the following unsigned fields:

```
     0xFFFFFFFF00000000 time_low
     0x00000000FFFF0000 time_mid
     0x000000000000F000 version
     0x0000000000000FFF time_hi
``` 
#### The UUID Versions

1. **Version 1**   
    - UUID version 1 is based on the current timestamp, measured in units of 100 nanoseconds from October 15, 1582, concatenated with the MAC address of the device where the UUID is created.
2. **Version 2**
    - It is based on a timestamp and the MAC address as well. However, [RFC 4122](https://tools.ietf.org/html/rfc4122) does not specify the exact generation details, so we won't look at an implementation in this article.
3. **Version 3 and 5**
    - The UUIDs are generated using the hash of namespace and name. The namespace identifiers are UUIDs like Domain Name System (DNS), Object Identifiers (OIDs), URLs, etc.
    - The only difference between UUIDv3 and UUIDv5 is the Hashing Algorithm — v3 uses MD5 (128 bits), while v5 uses SHA-1 (160 bits).
      
    This code generates a v3 UUID (name-based)
    ```java
       byte[] byteArr = {11, 23, 33}; 
       UUID uuid = UUID.nameUUIDFromBytes(byteArr);
       System.out.println("UUID version is: "+uuid.version());     //invoking version method  
    ```       
4. **Version 4**
    - The UUIDv4 implementation uses random numbers as the source. The Java implementation is **SecureRandom**, which uses an unpredictable value as the seed to generate random numbers to reduce the chance of collisions.
    ```java
       UUID uuid = UUID.randomUUID();
       System.out.println("UUID version is: "+uuid.version());     //invoking version method  
    ```   
   
    Let's generate a unique key using “SHA-256” and a random UUID:
    ```java
       MessageDigest salt = MessageDigest.getInstance("SHA-256");
       salt.update(UUID.randomUUID().toString().getBytes("UTF-8"));
       String digest = bytesToHex(salt.digest());
    ```  

