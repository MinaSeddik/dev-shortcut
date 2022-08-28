# Cookie Security


- [Cookie](#Cookie)



## <a name='Cookie'>Cookie </a>

> **Set-Cookie:name=value[; expires=date][; domain=domain][; path=path][; secure][; HttpOnly]**

- **HttpOnly** - It is used to prevent a Cross-Site Scripting exploit from gaining access to the session cookie and hijacking the victim's session.
    - If you need javascript to see the cookie value, then you remove the HTTP-Only flag.
- The **Secure** flag is used to declare that the cookie may only be transmitted using a secure connection (SSL/HTTPS). If this cookie is set, the browser will never send the cookie if the connection is HTTP.

- **In practice, if you're running an https site, always set the secure cookie, and always error on the safe side by setting HTTPONLY, unless you know your javascript requires cookie access.**
- If a browser that supports HttpOnly detects a cookie containing the HttpOnly flag, and client side script code attempts to read the cookie, the browser returns an empty string as the result. This causes the attack to fail by preventing the malicious (usually XSS) code from sending the data to an attacker’s website.

- If we're using Spring Boot, we can set these flags in our application.properties:
```
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.secure=true
```








