# OpenID Connect 


- [OpenID Connect protocol](#OpenID_Connect_protocol)



## <a name='OpenID_Connect_protocol'> OpenID Connect protocol </a>

- OpenID Connect is a simple identity layer built on top of the **OAuth 2.0** protocol, which allows clients to verify the identity of an end user based on the authentication performed by an authorization server or identity provider (IdP)
- OpenID Connect is an increasingly common authentication protocol: when an app prompts you to authenticate using your Facebook or Google+ credentials, the app is probably using OpenID Connect.

![OpenID Connect Flow](./What-is-OpenID-Connect-flow-graphic.jpg)


#### What's the Difference Between OAuth and OpenID Connect ?

OAuth 2.0 is a framework that controls **authorization** to a protected resource such as an application or a set of files, 
while OpenID Connect is industry standards for federated **authentication**.

> **OAuth 2.0 => authorization**   
> **OpenID Connect => authentication**

#### Grant Types

- The **Implicit Flow** is required for apps that have no “back end” logic on the web server, like a Javascript app.
- The **Authentication (or Basic) Flow** is designed for apps that have a back end that can communicate with the IdP away from prying eyes.
- The **Resource Owner Password Grant** does not have an login UI and is useful when access to a web browser is not possible.
- The **Client Credentials Grant** is useful for machine to machine authorization.


##### Implicit Flow

The Implicit flow is required for apps and websites that have no back end logic on the web server, and everything that is passed between the app or site and the IdP can be viewed using browser development tools.

![Implicit Flow](./oidc-implicit-flow.png)

##### Authentication Flow

The Authentication (or Basic) flow is an option for apps that have web-server logic that enables back-end communication with the IdP

![Authentication Flow](./oidc-basic-flow.png)


#### OpenID Connect Flow

- **Step (1)** − First, the user accesses the client web application and the client applicant asks the user to authenticate using **OpenId Provider** like google, facebook or github, ... etc for Authentication (sign-in with google)
- **Step (2)** − Next, the client application will provide the user with a link to login to the **OpenId Provider** server        
    **Example:** 
    > **GET**
     **https://accounts.google.com/o/oauth2/v2/auth?client_id=110209886425-1tsa2j5dh5o3sj020bum2epgbncbhgo1.apps.googleusercontent.com&response_type=code&scope=openid email&redirect_uri=https://www.getpostman.com/oauth2/callback&state &nonce&login_hint**
    - Query parameters:
        - **client_id** - which you obtain from the Authorization server (in case of google: API Console [Credentials page](https://console.cloud.google.com/apis/credentials). 
        - **redirect_uri** - should be the HTTP endpoint on your server that will receive the response, (in case of google: The value must exactly match one of the authorized redirect URIs for the OAuth 2.0 client, which you configured in the API Console Credentials page. If this value doesn't match an authorized URI, the request will fail with a redirect_uri_mismatch error.
        - **response_type (or grant_type)** - which define the authentication flows either **Implicit Flow** or **Authentication Flow**, in case of google it should be the basic authorization code flow request should be **code**.
        - **scope** -  which in a basic request, In case of google, It should be `openid email profile`   
        - **state** - (Optional but important to prevent CSRF attacks) should include the value of the anti-forgery unique session token, as well as any other information needed to recover the context when the user returns to your application
        - **nonce** - (Optional) is a random value generated by your app that enables replay protection when present.
        - **login_hint** - (Optional)  can be the user's email address or the `sub` string                                                                                                                                     
- **Step (3)** − The user logs in using the authenticating application.
- **Step (4)** − The authenticating server redirects the user to a redirect_url with authorization code and provide the code .
    **Example:** 
     > **https://www.getpostman.com/oauth2/callback?code=4/0AX4XGWhFbED12BGS7O2QrFsVbk_D5N_5S26aS8q4WzLU54iU-JQQtT2RYF1EpA0vItEz2A&scope=email+openid+https://www.googleapis.com/auth/userinfo.email&authuser=4&prompt=consent**

- **Step (5)** − The user accesses the page located at redirect URI in the client application.
- **Step (6)** − The client application will be provided with the **authentication code** and scope then send them to the OpenID server with client_id and secret to obtain **access token** and **ID token**    
    **Example:**
    > **POST**
     **https://oauth2.googleapis.com/token?code=4/0AX4XfWjOZJGUYttGQy9lnKozIZ8YXa5v66xgQyjtynDjw6f-yXbQ_UClqctXM8Qp8gTvwQ&client_id=110207456425-1tsa2j5dh5o3sj020bum2epgbncbhgo1.apps.googleusercontent.com&client_secret=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&redirect_uri=https://www.getpostman.com/oauth2/callback&grant_type=authorization_code**
- **Step (7)** − The Authentication server returns the **access token** and **ID token** to the client application.     
    **Example:**
    ```json
    {
        "access_token": "ya29.a0ARrdaM8GFuDIulDWbSpbqFf4pCeBnmc1rEHs8PUnVrkd8fk5HFneAYiB3WTl14oKMteVKxiDci680ifVJmEB0MXxerDWzQwloD8cvaVZa119ZBLZbQ-c9JLFjTm2mMdvPqTA-pxm5pQMdOhplIrkxVjXHwCn",
        "expires_in": 3599,
        "scope": "https://www.googleapis.com/auth/userinfo.email openid",
        "token_type": "Bearer",
        "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjM4ZjM4ODM0NjhmYzY1OWFiYjQ0NzVmMzYzMTNkMjI1ODVjMmQ3Y2EiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIxMTAyMDc4ODY0MjUtMXRzYTJqNWRoNW8zc2owMjBidW0yZXBnYm5jYmhnbzEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIxMTAyMDc4ODY0MjUtMXRzYTJqNWRoNW8zc2owMjBidW0yZXBnYm5jYmhnbzEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTc4MzgyMTYwNzE5MDc1NTI1NTYiLCJlbWFpbCI6Im1pbmEuaWJyYWhpbS5zb2Z0eHBlcnRAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJUUlpheWdWR1JKZEExLW9jMURfdXBnIiwiaWF0IjoxNjUzNzE5NjYyLCJleHAiOjE2NTM3MjMyNjJ9.dkAA5PpzXxQhwJ8SVGZfL6Cy_rQ6n1Fp26Svsomq33Q2uf6dTZBEqGRyfhRmRORYOQ98dnMh8YJM5P_VPfnYANZWUJemegl_qUc9F7pzx07333aC6D5QAXQqUUxpePyKZQT9YAjRmQ_Hr1Td2CpKa85Erwla6LwfbTiB1yzxy3pRvdq4-gG-yMEEbZJzYKeM3SWOCjUEqeRsKBtom-WEYCTv_kIvXDol4_7sfc9cjqqmFPIap3_ZQciQr2_OB8BSHkXSAbltmikIodda_9Wa-A4YyARVLP03SABXUXh9LsnLdHxG0jtlLaS91i8R8BSxOrtZmxGUVPD3K8C72ujs9g"
    }
    ```
    **Note**: An ID Token is a JWT (JSON Web Token), that is, a cryptographically signed Base64-encoded JSON object. Normally, it is critical that you validate an ID token before you use it, but since you are communicating directly with Google over an intermediary-free HTTPS channel and using your client secret to authenticate yourself to Google, you can be confident that the token you receive really comes from Google and is valid. If your server passes the ID token to other components of your app, it is extremely important that the other components validate the token before using it.  
- **Step (8)** − Once the client application gets an ID token, It means that the user is authenticated by **OpenId Provider** (google for example), the **ID token** is a JWT token which is base-64 encoded, the client can extract the user information from the jwt payload and create a new user profile in the database (if the email doesn't exist)

#### Authenticate the user
- After obtaining user information from the ID token, you should query your app's user database. If the user already exists in your database, you should start an application session for that user if all login requirements are met by the Google API response.

- If the user does not exist in your user database, you should redirect the user to your new-user sign-up flow. You may be able to auto-register the user based on the information you receive from Google, or at the very least you may be able to pre-populate many of the fields that you require on your registration form. In addition to the information in the ID token, you can get additional user profile information at our user profile endpoints.







