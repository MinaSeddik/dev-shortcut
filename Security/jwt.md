# Jwt - Json Web Token


- [Introduction to Jwt](#Introduction_to_Jwt)
- [Jwt Example using Java Servlets](#Jwt_Example_using_Java_Servlets)
- [Jwt expiration and best practices](#Jwt_expiration_and_best_practices)




## <a name='Introduction_to_Jwt'> Introduction to Jwt </a>

JSON Web Token or JWT, as it is more commonly called, is an open Internet standard (RFC 7519) for securely transmitting trusted information between parties in a compact way. The tokens contain claims that are encoded as a JSON object and are digitally signed using a private secret or a public key/private key pair. 

A JWT token is divided into 3 parts namely – header, payload, and signature 
```
[Header].[Payload].[Signature]
```

- **Header** − The Header of a JWT token contains the list cryptographic operations that are applied to the JWT. This can be the signing technique, metadata information about the content-type
- **Payload** − The payload part of JWT contains the actual data to be transferred using the token. This part is also known as the “claims” part of the JWT token. The claims can be of three types – registered, public and private.
    - The **registered** claims are the ones which are recommended but not mandatory claims such as iss(issuer), sub(subject), aud(audience) and others.
    - **Public claims** are those that are defined by those using the JWTs. 
    - **Private claims** or custom claims are user-defined claims created for the purpose of sharing the information between the concerned parties.    
    ***Payload example:***
    ```json
      { "sub": "12345", "name": "Johnny Hill", "admin": false }
    ```
- **Signature** − The signature part of the JWT is used for the verification that the message wasn’t changed along the way. If the tokens are signed with private key, it also verifies that the sender is who it says it is.    
    ***example***
    ```
      HMACSHA256( base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
    ```

#### How it is used ?!

Now, this token can be used in the **Authorization header** using the Bearer schema as.

> **Authorization − Bearer &lt;token&gt;**

#### Read and Inspect any Jwt token

Use **https://jwt.io/**



## <a name='Jwt_Example_using_Java_Servlets'> Jwt Example using Java Servlets </a>

```java
@WebFilter(filterName = "SecurityFilter", urlPatterns = "/*")
public class SecurityFilter extends HttpFilter {

    /* No one knows about this, only the server knows */
    private static final String SECRET = "Dev.certtifix-psm.jwt-secret@ABCD2022-11-26";

    @Override
    protected void doFilter(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws IOException, ServletException {

        /* If there is no authorization header or if it doesn't have login credentials or a token
         * then there is no point of continuing */
        String authorization = req.getHeader("Authorization");
        if (authorization == null || !(authorization.matches("Basic .+") || authorization.matches("Bearer .+"))){
            res.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        /* Extract the token or base64encoded login credentials */
        String token = authorization.replaceAll("(Basic)|(Bearer)", "").trim();

        /* Let's find out whether it is the token or login credentials */
        if (authorization.matches("Basic .+")){
            String decodedCredentials = new String(Base64.getDecoder().decode(token.getBytes()));
            String[] credentials = decodedCredentials.split(":");

            /* Credentials array length should be two after splitting, otherwise it is invalid */
            if (credentials.length != 2){
                res.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

            /* Let's check whether the username and password is correct
             * You may need to make a call to the DB server here in a real-world application */
            if (credentials[0].equals("admin@example.com") && credentials[1].equals("admin")){
                String jws = Jwts.builder()
                        .setIssuer("certtifix-psm")
                        .claim("email", credentials[0])

                        /* Play with the expiration time :) It is fun */
                        .setExpiration(new Date(new Date().getTime() + (1000 * 60 * 2)))
                        .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                        .compact();

                res.addHeader("X-Auth-Token", jws);
                chain.doFilter(req,res);
            }else{
                res.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

        }else{
            try {
                Jws<Claims> jwsClaims = Jwts.parserBuilder()
                        .setSigningKey(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                        .requireIssuer("certtifix-psm")
                        .build()
                        .parseClaimsJws(token);

                /* We can trust this token, let's proceed */
                chain.doFilter(req, res);

            }catch (ExpiredJwtException exp){

                res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                res.setContentType("text/html");
                res.getWriter().println("<h1>Token has expired, Please log in again</h1>");
                return;

            }catch (JwtException exp){

                exp.printStackTrace();

                /* We can't trust this token */
                res.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }
    }
}
```

#### Logout
The JWT is stored on browser, so remove the token **deleting the cookie at client side**   

JWT is **stateless**, meaning that you should store everything you need in the payload and skip performing a DB query on every request. But if you plan to have a strict log out functionality, that cannot wait for the token auto-expiration, even though you have cleaned the token from the client-side, then you might need to neglect the stateless logic and do some queries. so what's a solution?

- Set a reasonable expiration time on tokens
    - You can provide it as a field called `exp` in the payload like this:
        ```json
        {
          "sub": "1234567890",
          "name": "John Doe",
          "iat": 1516234022,
          "exp": 1516239022
        }
        ```
    - As the `iat` field here stands for “issued at”, this token is set to expire N seconds after it was issued. ⏰  
- Delete the stored token from client-side upon log out 
- Query provided token against The **Blacklist** on every authorized request

##### JWT Blacklist
***Blacklist*** of all the tokens that are valid no more and have not expired yet. You can use a DB that has a TTL option on documents which would be set to the amount of time left until the token is expired

#### Use Redis for JWT Blacklist
Redis is a good option for blacklist, which will allow fast in-memory access to the list. Then, in the middleware of some kind that runs on every authorized request, you should check if the provided token is in The Blacklist. If it is you should throw an unauthorized error. And if it is not, let it go and the JWT verification will handle it and identify if it is expired or still active.



## <a name='Jwt_expiration_and_best_practices'> Jwt expiration and best practices </a>

#### Jwt cons
- There is no way to invalidate the JWT from the server, so It is highly recommended to set the expiration date to be very short period like 30 minutes or 1 Hour maximum

#### Jwt case study
Create **3 endpoints** to manage authentication using JWT
- **/authenticate** endpoint
    - Method: POST
    - Parameter: username and password
    - Response payload: json payload contains the JWT token
    - Example:
    ```json
        {
          "iss": "https://dev.my-server.com/api/v1/users/actions/authinticate",
          "iat": 1653208007,                /* <---- issued at in milliseconds  */
          "exp": 1653817081,                /* <---- token expiration in milliseconds  */
          "nbf": 1653813481,
          "jti": "P4IRCjjIbTM9RYdO",        /* <----  (JWT ID) claim provides a unique identifier for the JWT.   */
          "sub": 1,                         /* <---- the userId in our record  */
          "prv": "23bd5c8949f600adb39e701c400872db7a5976f7",
          "provider": "users"
        }
    ```
    - Here the token will be expire every 14 days but will be refreshed from the server every 60 minutes
    - here another example of json payload
    ```json
        {
          "sub": "1234567890",
          "name": "John Doe",
          "admin": true
        }
    ```
    
- **/refresh** endpoint
    - Method: POST
    - Auth Bearer header: old Jwt token (expired one)
    - Response payload: json payload contains a new JWT token
    - Example:
    ```json
        {
          "iss": "https://dev.my-server.com/api/v1/users/actions/refresh",
          "iat": 1653208007,                /* <---- the same issued at in milliseconds as above*/
          "exp": 1653828553,                /* <---- token expiration in milliseconds  */
          "nbf": 1653824953,
          "jti": "WyCXcVwO0JUWlw71",
          "sub": 1,                         /* <---- the userId in our record  */
          "prv": "23bd5c8949f600adb39e701c400872db7a5976f7",
          "provider": "users"
        }
    ```

- **/logout** endpoint
    - Note that the main purpose of logout is to delete the JWT from the browser so that it will not be used again
    - Method: POST
    - Auth Bearer header: Jwt token to invalidate
    - Backend action: Black-list this JWT with TTL = the remaining time to expire so that it will never valid if used


#### Where to store the JWT in the client-side (the browser) ?!

#### Local Storage
The data stored in **localStorage** persists until explicitly deleted. Changes made are saved and available for all current and future visits to the site.

#### Session Storage
For **sessionStorage**, changes are only available per tab. Changes made are saved and available for the current page in that tab until it is closed. Once it is closed, the stored data is deleted.

#### Angular example

First of all, you must install **ngx-webstorage**   
```bash
npm install --save ngx-webstorage
```
and import it like
```js
import {LocalStorage, SessionStorage} from 'ngx-webstorage';`
```

To save/read/remove JWT token in the **Local Storage**
```js
// save data item
localStorage.setItem('auth_token', JWT_TOKEN);
localStorage.setItem('userDetails', JSON.stringify(userDetails));

// read data item
localStorage.getItem('auth_token');
User user = JSON.parse(localStorage.getItem("userDetails")) as User;

// remove data item
localStorage.removeItem("auth_token");

// clear all data
localStorage.clear();

// To modify
```

To save/read/remove JWT token in the **Session Storage**
```js
// save data
sessionStorage.setItem('auth_token', JWT_TOKEN);
sessionStorage.setItem('userDetails', JSON.stringify(userDetails));

// read data item
sessionStorage.getItem('auth_token');
User user = JSON.parse(sessionStorage.getItem("userDetails")) as User;

// remove data item
sessionStorage.removeItem("auth_token");

// clear all data
sessionStorage.clear();
```





































 
 
 