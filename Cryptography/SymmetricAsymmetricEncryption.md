# Symmetric vs Asymmetric Encryption


- [Symmetric Encryption](#symmetric_enc)
    - [Symmetric Java examples](symmetric_java)
- [Asymmetric Encryption](#asymmetric_enc)
    - [Asymmetric Java examples](asymmetric_java)
    - [ssh-keygen tool to generate public/private keys](asymmetric_ssh_keygen)
    - [Java keytool to generate public/private keys](asymmetric_java_keytool)
    
    
## <a name='symmetric_enc'> Symmetric Encryption </a>

Symmetric encryption is a type of encryption where only one key (a secret key) is used to both encrypt and decrypt electronic information.

![Symmetric_Encryption](Symmetric-Encryption.png)

#### Examples of symmetric encryption:
- Data Encryption Standard (DES)
- Triple Data Encryption Standard (Triple DES)
- Advanced Encryption Standard (AES)
- International Data Encryption Algorithm (IDEA)
- TLS/SSL protocol



### <a name='symmetric_java'> Symmetric Java examples </a>

#### Java "DES" - Data Encryption Standard Symmetric Encryption

```java
public class DES_SymmetricKey {

    public static void main(String[] argv) {

        try {

            KeyGenerator keygenerator = KeyGenerator.getInstance("DES");
            SecretKey myDesKey = keygenerator.generateKey();

            // Create the cipher
            /*
                DES = Data Encryption Standard.
                ECB = Electronic Codebook mode.
                PKCS5Padding = PKCS #5-style padding.
             */
            Cipher cipher = Cipher.getInstance("DES/ECB/PKCS5Padding");

            // Initialize the cipher for encryption
            cipher.init(Cipher.ENCRYPT_MODE, myDesKey);

            //sensitive information
            byte[] text = "No body can see me".getBytes();

            System.out.println("Text [Byte Format] : " + text);
            System.out.println("Text : " + new String(text));

            // Encrypt the text
            byte[] textEncrypted = cipher.doFinal(text);

            System.out.println("Text Encrypted : " + textEncrypted);

            // Initialize the same cipher for decryption
            cipher.init(Cipher.DECRYPT_MODE, myDesKey);

            // Decrypt the text
            byte[] textDecrypted = cipher.doFinal(textEncrypted);

            System.out.println("Text Decrypted : " + new String(textDecrypted));

        } catch (NoSuchAlgorithmException | NoSuchPaddingException | IllegalBlockSizeException | BadPaddingException | InvalidKeyException e) {
            e.printStackTrace();
        }

    }
}

```

```
Text [Byte Format] : [B@2b2948e2
Text : No body can see me
Text Encrypted : [B@4b4523f8
Text Decrypted : No body can see me
```

#### Java "Triple DES" - Triple Data Encryption Standard Symmetric Encryption

```java

public class TripleDES_SymmetricKey {


    public static void main(String[] argv) {

        try {

            KeyGenerator keygenerator = KeyGenerator.getInstance("TripleDES");
            SecretKey myDesKey = keygenerator.generateKey();


            // Create the cipher
            /*
                DES = Data Encryption Standard.
                ECB =
                PKCS5Padding = PKCS #5-style padding.
             */
            Cipher cipher = Cipher.getInstance("TripleDES/ECB/PKCS5Padding");

            // Initialize the cipher for encryption
            cipher.init(Cipher.ENCRYPT_MODE, myDesKey);

            //sensitive information
            byte[] text = "No body can see me".getBytes();

            System.out.println("Text [Byte Format] : " + text);
            System.out.println("Text : " + new String(text));

            // Encrypt the text
            byte[] textEncrypted = cipher.doFinal(text);

            System.out.println("Text Encrypted : " + textEncrypted);

            // Initialize the same cipher for decryption
            cipher.init(Cipher.DECRYPT_MODE, myDesKey);

            // Decrypt the text
            byte[] textDecrypted = cipher.doFinal(textEncrypted);

            System.out.println("Text Decrypted : " + new String(textDecrypted));

        } catch (NoSuchAlgorithmException | NoSuchPaddingException | InvalidKeyException | IllegalBlockSizeException | BadPaddingException e) {
            e.printStackTrace();
        }

    }


}

```

```
Text [Byte Format] : [B@13a5fe33
Text : No body can see me
Text Encrypted : [B@6b09bb57
Text Decrypted : No body can see me
```


#### More Java Symmetric Encryption examples
Check out the [Cryptography git repo](https://github.com/MinaSeddik/Cryptographgy)


## <a name='asymmetric_enc'> Asymmetric Encryption </a>

Asymmetric Encryption, also known as Public-Key Cryptography, is an example of one type. Unlike “normal” (symmetric) encryption, Asymmetric Encryption encrypts and decrypts the data using two separate yet mathematically connected cryptographic keys. 
These keys are known as a **Public Key** and a **Private Key**

![Symmetric_Encryption](ASymmetric-Encryption.png)

#### Examples of Asymmetric encryption:
- Rivest Shamir Adleman (RSA)
- the Digital Signature Standard (DSS), which incorporates the Digital Signature Algorithm (DSA)
- Elliptical Curve Cryptography (ECC)
- the Diffie-Hellman exchange method
- TLS/SSL protocol


### <a name='asymmetric_java'> Symmetric Java examples </a>

#### Java "RSA" - Rivest Shamir Adleman Asymmetric Encryption

```java
public class RSA_ASymmetricKey {

    public static void main(String[] argv) {

        try {

            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            KeyPair pair = generator.generateKeyPair();


            // We'll use the public key to encrypt the data and the private one for decrypting it
            PrivateKey privateKey = pair.getPrivate();
            PublicKey publicKey = pair.getPublic();


            // To save a key in a file, we can use the getEncoded method, which returns the key content in its primary encoding format:
            try (FileOutputStream fos = new FileOutputStream("public.key")) {
                fos.write(publicKey.getEncoded());
            } catch (IOException e) {
                e.printStackTrace();
            }

            // To read the key from a file, we'll first need to load the content as a byte array:
            File publicKeyFile = new File("public.key");
            byte[] publicKeyBytes = Files.readAllBytes(publicKeyFile.toPath());


            // and then use the KeyFactory to recreate the actual instance:
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            EncodedKeySpec publicKeySpec = new X509EncodedKeySpec(publicKeyBytes);
            keyFactory.generatePublic(publicKeySpec);


            Cipher cipher = Cipher.getInstance("RSA");

            // Initialize the cipher for encryption with a public key
            cipher.init(Cipher.ENCRYPT_MODE, publicKey);


            //sensitive information
            byte[] text = "No body can see me".getBytes();

            System.out.println("Text [Byte Format] : " + text);
            System.out.println("Text : " + new String(text));

            // Encrypt the text
            byte[] textEncrypted = cipher.doFinal(text);

            System.out.println("Text Encrypted : " + textEncrypted);

            // Initialize the same cipher for decryption with a private key
            cipher.init(Cipher.DECRYPT_MODE, privateKey);

            // Decrypt the text
            byte[] textDecrypted = cipher.doFinal(textEncrypted);

            System.out.println("Text Decrypted : " + new String(textDecrypted));

        } catch (NoSuchAlgorithmException | NoSuchPaddingException | InvalidKeyException | IllegalBlockSizeException | BadPaddingException | InvalidKeySpecException | IOException e) {
            e.printStackTrace();
        }

    }
}

```

```
Text [Byte Format] : [B@4f970963
Text : No body can see me
Text Encrypted : [B@61f8bee4
Text Decrypted : No body can see me
```

#### Java "ECC" - Elliptical Curve Cryptography Asymmetric Encryption

```java
public class ECC_ASymmetricKey {

    public static void main(String[] argv) {

        try {

            // BouncyCastle is a Java library that complements the default Java Cryptographic Extension (JCE).
            Security.addProvider(new BouncyCastleProvider());

            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("EC", BouncyCastleProvider.PROVIDER_NAME);
            keyPairGenerator.initialize(new ECGenParameterSpec("secp256r1"));

            KeyPair pair = keyPairGenerator.generateKeyPair();


            // We'll use the public key to encrypt the data and the private one for decrypting it
            PrivateKey privateKey = pair.getPrivate();
            PublicKey publicKey = pair.getPublic();

            // Initialize the cipher for encryption
            Cipher cipher = Cipher.getInstance("ECIESwithAES-CBC");

            // Initialize the cipher for encryption with a public key
            cipher.init(Cipher.ENCRYPT_MODE, publicKey);


            //sensitive information
            byte[] text = "No body can see me".getBytes();

            System.out.println("Text [Byte Format] : " + text);
            System.out.println("Text : " + new String(text));

            // Encrypt the text
            byte[] textEncrypted = cipher.doFinal(text);

            System.out.println("Text Encrypted : " + textEncrypted);

            // Initialize the same cipher for decryption with a private key
            cipher.init(Cipher.DECRYPT_MODE, privateKey, cipher.getParameters());

            // Decrypt the text
            byte[] textDecrypted = cipher.doFinal(textEncrypted);

            System.out.println("Text Decrypted : " + new String(textDecrypted));

        } catch (NoSuchAlgorithmException | NoSuchPaddingException| InvalidKeyException| IllegalBlockSizeException | BadPaddingException | InvalidAlgorithmParameterException | NoSuchProviderException e) {
            e.printStackTrace();
        }

    }
}

```


```
Text [Byte Format] : [B@68b58644
Text : No body can see me
Text Encrypted : [B@68fe48d7
Text Decrypted : No body can see me
```


#### More Java Asymmetric Encryption examples
Check out the [Cryptography git repo](https://github.com/MinaSeddik/Cryptographgy)




### <a name='asymmetric_ssh_keygen'> ssh-keygen tool to generate public/private keys </a>


### <a name='asymmetric_java_keytool'> Java keytool to generate public/private keys </a>





    