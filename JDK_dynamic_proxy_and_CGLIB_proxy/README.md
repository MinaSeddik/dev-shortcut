#  JDK dynamic proxy and CGLIB proxy


- [What is a Proxy?](#proxy) 
- [JDK Dynamic Proxy](#jdk_proxy)
- [CGLIB Proxy](#gclib_proxy)


## <a name='proxy'> What is a Proxy? </a>



Proxy is a design pattern. We create and use proxy objects when we want to add or modify some functionality of an already existing class. The proxy object is used instead of the original one. Usually, the proxy objects have the same methods as the original one and in Java proxy classes usually extend the original class. The proxy has a handle to the original object and can call the method on that.

Spring AOP is proxy based. Spring used two types of proxy strategy one is JDK dynamic proxy and other one is CGLIB proxy.

JDK dynamic proxy is available with the JDK. It can be only proxy by interface so target class needs to implement interface. In your is implementing one or more interface then spring will automatically use JDK dynamic proxies.

On the other hand, CGLIB is a third party library which spring used for creating proxy. It can create proxy by subclassing. Spring uses CGLIB for proxy if class is not implementing interface.


| JDK dynamic proxy       |    CGLIB proxy            |
| :---         |    :----                    |
| It can be only proxy by interface so target class needs to implement interface     | It can create proxy by subclassing  |
| It is available with the Java     | It is a third  library. |
| It is a bit slow than CGLIB proxy     |  It is faster than JDK dynamic proxy |
| Final class and Final method can not be proxy     |  Final class and Final method can not be proxy |
| Spring uses JDK proxy when is class is implementing one or more interface    |  Spring uses CGLib proxy when class in not implementing interface |


## <a name='jdk_proxy'> JDK Dynamic Proxy </a>


The easiest way to do this is to use the java.lang.reflect.Proxy class, which is part of the JDK. That class can create a proxy class or directly an instance of it. The use of the Java built-in proxy is easy. All you need to do is implement a java.lang.InvocationHandler , so that the proxy object can invoke it. The InvocationHandler interface is extremely simple. It contains only one method: invoke(). When invoke() is invoked, the arguments contain the original object, which is proxied, the method that was invoked (as a reflection Method object) and the object array of the original arguments. 

#### (1) Create an Interface

```java
public interface SimpleInterface {

    int originalMethod(String string);

}
```

#### (2) Create a concrete Object to be proxied

```java
public class TargetObject implements SimpleInterface {

    @Override
    public int originalMethod(String string) {
        System.out.println(string);

        return 55;
    }

}
```


#### (3) Create InvocationHandler to intercept object call

```java
public class SimpleInvocationHandler implements InvocationHandler {

    private final SimpleInterface originalObject;

    public SimpleInvocationHandler(SimpleInterface originalObject) {
        this.originalObject = originalObject;
    }


    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("BEFORE");

        Object ret = method.invoke(originalObject, args);

        System.out.println("AFTER");
        return ret;

    }


}
```


#### (4) Use the proxy Object

```java
public class TestProxy {


    public static void main(String[] args){
        SimpleInterface original = new TargetObject();
        InvocationHandler handler = new SimpleInvocationHandler(original);


        SimpleInterface proxyObject = (SimpleInterface) Proxy.newProxyInstance(SimpleInterface.class.getClassLoader(),
                new Class[] { SimpleInterface.class },
                handler);

        int retValue = proxyObject.originalMethod("Hello");

        System.out.println("returned: " + retValue);

    }

}
```


## <a name='gclib_proxy'> CGLIB Proxy</a>

Cglib is an open source library that capable creating and loading class files in memory during Java runtime. To do that it uses Java bytecode generation library ‘asm’, which is a very low-level bytecode creation tool. I will not dig that deep in this article.


**Note that the target class is passed in as the super class of the generated proxy. Unlike the JDK dynamic proxy, you cannot pass in the target object during the proxy creation**

![CGLIB Method Interceptor](./CGLIB_Method_Interceptor.png)

- **net.sf.cglib.proxy.MethodInterceptor** 
meets any interception needs, but it may be overkill for some situations. For simplicity and performance, additional specialized callback types are offered out of the box. For examples,

- **net.sf.cglib.proxy.FixedValue**
It is useful to force a particular method to return a fixed value for performance reasons.

- **net.sf.cglib.proxy.NoOp**
It delegates method invocations directly to the default implementations in the super class.

- **net.sf.cglib.proxy.LazyLoader**
It is useful when the real object needs to be lazily loaded. Once the real object is loaded, it is used for every future method call to the proxy instance.

- **net.sf.cglib.proxy.Dispatcher**
It has the same signatures as net.sf.cglib.proxy.LazyLoader, but the loadObject method is always called when a proxy method is invoked.

- **net.sf.cglib.proxy.ProxyRefDispatcher**
It is the same as Dispatcher, but it allows the proxy object to be passed in as an argument of the loadObject method.


#### (1) Create an class to be proxied

```java
public class PersonService {
    public String sayHello(String name) {
        return "Hello " + name;
    }

    public Integer lengthOfName(String name) {
        return name.length();
    }
}
```


#### (2) Create Proxy for the Service using CGLIB

```java
public class TestProxy {


    public static void main(String[] args2) {

        Enhancer enhancer = new Enhancer();
        enhancer.setSuperclass(PersonService.class);
        enhancer.setCallback((MethodInterceptor) (obj, method, args, proxy) -> {
            if (method.getDeclaringClass() != Object.class && method.getReturnType() == String.class) {
                return "Hello Tom!";
            } else {
                return proxy.invokeSuper(obj, args);
            }
        });

        PersonService proxy = (PersonService) enhancer.create();
        proxy.sayHello(null);
        int lengthOfName = proxy.lengthOfName("Mary");

        System.out.println("proxy.sayHello(null):" + proxy.sayHello(null));
        System.out.println("proxy.lengthOfName(\"Mary\"):" + proxy.lengthOfName("Mary"));
        
    }

}
```