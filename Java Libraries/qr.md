# Generating Barcodes and QR Codes in Java



#### QR Codes

QR Codes are becoming the most widely recognized 2D barcode worldwide. The big benefit of the QR code is that we can store large amounts of data in a limited space.



#### Barcode Libraries
- Barbecue  -       ***(only barcode, doesn't support QR codes)***
- Barcode4j -       ***(only barcode, doesn't support QR codes)***
- **ZXing**  -      ***This is the main library that supports QR codes in Java.***
- QRGen -           ***(offers a simple QRCode generation API built on top of ZXing)***



### Using the ZXing Library

```xml
<dependency>
    <groupId>com.google.zxing</groupId>
    <artifactId>core</artifactId>
    <version>3.3.0</version>
</dependency>
<dependency>
    <groupId>com.google.zxing</groupId>
    <artifactId>javase</artifactId>
    <version>3.3.0</version>
</dependency>
```

Use ZXing library to generate a QR Code. 

```java
public static BufferedImage generateQRCodeImage(String barcodeText) throws Exception {
    QRCodeWriter barcodeWriter = new QRCodeWriter();
    BitMatrix bitMatrix = barcodeWriter.encode(barcodeText, BarcodeFormat.QR_CODE, 200, 200);

    return MatrixToImageWriter.toBufferedImage(bitMatrix);
}
```


#### Building a REST Service

```java
@RestController
@RequestMapping("/barcodes")
public class BarcodesController {

    @GetMapping(value = "/api/generateQr/{barcode}", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<BufferedImage> generateQrCode(@PathVariable("barcode") String barcode)
    throws Exception {
        return okResponse(BarcodeGenerator.generateQRCodeImage(barcode));
    }
    //...
}
```

Also, we need to manually register a message converter for BufferedImage HTTP Responses because there is no default:

```java
@Bean
public HttpMessageConverter<BufferedImage> createImageHttpMessageConverter() {
    return new BufferedImageHttpMessageConverter();
}
```



























