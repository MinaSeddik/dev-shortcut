# API Authentication


- [Generating Cryptographically Strong API key](#Generating_cryptographically_strong_API_key)
    - [Using java.util.UUID](#Using_java_util_UUID)
    - [Using RandomStringUtils](#Using_RandomStringUtils)
    - [Using RandomValueStringGenerator](#Using_RandomValueStringGenerator)
    - [Using Java 8 SecureRandom](#Using_Java8_SecureRandom)
- [API key and secrets examples](#API_key_secrets_examples)
    - [Google API example](#Google_API_example)
    - [Facebook ApplicationId and Secret example](#Facebook_ApplicationId_and_Secret_example)
    - [Sterling Identity API example](#Sterling_Identity_API_example)
    - [ZOHO ClientId and Secret example](#ZOHO_ClientId_and_Secret_example)
- [Common Attacks Against Web APIs](#Common_Attacks_Against_Web_APIs)
- [Securing APIs using OAuth 2.0](#Securing_APIs_using_OAuth2)



## <a name='Generating_cryptographically_strong_API_key'> Generating Cryptographically Strong API key </a>

#### API Key 
The API key must be unique, not necessarily unguessable. Normally a random number (of sufficient length) is a good choice for keys. 
We can use **`Random`** class for generating keys but that may lead to predictability. If that bothers you, you can always use **`SecureRandom`** number generator.

#### Secret
Must be unguessable and kept confidential. Any potential leak of a secret is a security incident requiring immediate revocation of the key. 
The only way to generate a secret is with a secure random generator. Secrets shall never be stored in clear text format.

#### Applications
- Generating unique id for a database record (better if unguessable)
- Generating API Keys (must be unguessable and kept private)
- Generating passwords
- Generating clientId and clientSecrets for Client Credentials flow in OAuth2

#### Solutions
- UUID (java.util.UUID) is a good candidate for generating keys
- Apache common lang3 RandomStringUtils
- Spring’s RandomValueStringGenerator
- Custom implementation using SecureRandom
- Using external library like passay: http://www.passay.org or https://github.com/vt-middleware/passay (good for generating passwords with rules)


### <a name='Using_java_util_UUID'> Using java.util.UUID </a>

UUID class generates universally unique 32 character identifier (128-bit value) that can be a good candidate for keys and ids. **But the UUIDs are rarely useful** for generating secrets.
```java
String key = UUID.randomUUID().toString();
```

### <a name='Using_RandomStringUtils'> Using RandomStringUtils </a>

We can use **`commons-lang3`** RandomStringUtils along with **`SecureRandom`** class to generate secure keys and secrets. 
The advantage with this approach is that we can choose the characters to be used in composing these keys/secret values.

```java
import org.apache.commons.lang3.RandomStringUtils;

import java.security.SecureRandom;
import java.util.UUID;

public final class RandomIdGenerator {
    
    // the set of characters to choose output from.
    private static final String VALID_CLIENT_ID_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789"; 

    private static class Holder {   
        static final SecureRandom numberGenerator = new SecureRandom();
    }

    public String generateId(int length) {
        SecureRandom secureRandom = Holder.numberGenerator;
        return RandomStringUtils.random(length, 0, VALID_CLIENT_ID_CHARS.length(), false, false, VALID_CLIENT_ID_CHARS.toCharArray(), secureRandom);
    }

    public static String generateRandomId(int length) {
        RandomIdGenerator randomIdGenerator = new RandomIdGenerator();
        return randomIdGenerator.generateId(length);
    }
}
```

for testing
```java
class Foo {

    @Test
    public void test() {
        String clientId = RandomIdGenerator.generateRandomId(25);
        String clientSecret = RandomIdGenerator.generateRandomId(36);
    }
}
```

### <a name='Using_RandomValueStringGenerator'> Using RandomValueStringGenerator </a>

If you are already using Spring, then you can use RandomValueStringGenerator class to generate secure keys and secrets.

```java
import org.springframework.security.oauth2.common.util.RandomValueStringGenerator;

public void generateApiKey() {
    String apiKey = new RandomValueStringGenerator(32).generate();   // specify the number of bytes
}
```

### <a name='Using_Java8_SecureRandom'> Using Java 8 SecureRandom </a>

SecureRandom class ensures (over Random) that generated random number is cryptographically strong.

```java
import java.security.SecureRandom;

class Main {

    public static String generateRandomString(int len) {
        final String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; 
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < len; i++) {     
            int randomIndex = random.nextInt(chars.length());
            sb.append(chars.charAt(randomIndex));
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        int len = 10;
        System.out.println(generateRandomPassword(len));
    }
}
```

## <a name='API_key_secrets_examples'> API key and secrets examples </a>

### <a name='Google_API_example'> Google API example </a>

- Google API key for OAuth 2.0
```java
AIzaSyA8A13DNfcvX9YzCFiKv17zOxHX8O4FMyU
```
Length: 39
Allowed chars: [A-Za-z0-9]


### <a name='Facebook_ApplicationId_and_Secret_example'> Facebook ApplicationId and Secret example </a>

- Facebook AppId and secret
```java
AppId = 526090641762712
Secret = 564rt64wer654t6we5r4ytwe4yi435uo
```
AppId Length: 35   
AppId Allowed chars: [0-9]   
Secret Length: 35   
Secret Allowed chars: [a-z0-9]


### <a name='Sterling_Identity_API_example'> Sterling Identity API example </a>

- Sterling Identity primary API key
```java
HDKsgXXQxhMDqG5Y3HmIyancP1QX0Lr5+s3O36vQKvVPifDQMJBIL9eSKoNAcqy/gjSLafQ2gSxT+lMK/D3bcw==
```
Length: 88 Base-64 encoded


### <a name='ZOHO_ClientId_and_Secret_example'> ZOHO ClientId and Secret example </a>

- ZOHO ClientId and secret
```java
ClientId = 1000.AUNWTL6EZ63LZYKB76TMJJPB7I19AF
Secret = 3bc74f55a934592070ffd75e8de92abd642e19e093
```
ClientId Length: 35   
AppId Allowed chars: [0-9A-Z\.]   
Secret Length: 42   
Secret Allowed chars: [a-z0-9]



## <a name='Common_Attacks_Against_Web_APIs'> Common Attacks Against Web APIs </a>


| Attack Type                               | Mitigations       |
| :---                                      |    :----                           |
| **Sql Injection**                         | **Validate** and **sanitize** all data in API requests; limit response data to avoid unintentionally leaking sensitive data                           |
| **Cross-Site Scripting (XSS)**            | Validate input; use character escaping and filtering                               |
| **Distributed Denial-of-Service (DDoS)**  | Use **rate limiting** and limit payload size                          |
| **Man-in-the-Middle (MitM)**              | Encrypt traffic in transit                          |
| **Credential Stuffing**                   | Use an intelligence feed to identify credential stuffing and implement rate limits to control brute force attacks                          |



## <a name='Securing_APIs_using_OAuth2'> Securing APIs using OAuth 2.0 </a>

We can use OAuth 2.0 to secure our REST APIs

### Sterling Identity Case study

#### Obtaining a Bearer Token
Request:
```
POST https://<host>/Token HTTP/1.2

grant_type=apiKey&api_key=<apikey>
```
The <apikey> placeholder must be replaced with the URL-encoded API key that you obtained from the service provider

Success Response:
```
{
    "access_token": "<bearer token>",
    "token_type": "bearer",
    "expires_in": 1209599,
    ".issued": "Wed, 11 Nov 2015 21:31:20 GMT",
    ".expires": "Wed, 25 Nov 2015 21:31:20 GMT"
}
```
The access_token value is the bearer token that must be sent on each subsequent request. The remaining values are informational only and can be discarded.
	
Failure Response:
```
{
    "error": "Missing Value",
    "error_description": "Request is missing required parameter 'api_key'."
}
```



```
{
    "error": "Invalid Value",
    "error_description": "The API key is not valid."
}
``` 
	
#### Submitting a Request

```
GET https://<host>/<path> HTTP/1.2
Authorization: Bearer YNWv ... 5zRX             <---- access_token obtained from the previous call
Accept: application/vnd.sureid.ipseity-v2+json
Content-Type: application/json
```




























