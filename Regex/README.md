# Regex


- [References](#references)
- [Modifiers](#modifiers)
- [Brackets](#brackets)
- [Metacharacters](#metacharacters)
- [Quantifiers](#quantifiers)
- [Look Around](#lookaround)
- [Java Example](#java_example)
- [Capturing group](#capturing_group)
- [Non-capturing group](#non_capturing_group)
- [Greedy vs Lazy Match](#greedy_vs_lazy_match)





## <a name='references'> References </a>

- https://regex101.com/
- https://ihateregex.io/


## <a name='modifiers'> Modifiers </a>


| Modifier       |    Description            |
| :---         |    :----                           |
| **g**     |  Perform a global match (find all matches rather than stopping after the first match)                             |
| **i**     |  Perform case-insensitive matching                             |
| **m**     |  Perform multiline matching                             |


#### examples

Java 8 syntax: match a, b, c, A, B, C (ignore case specified)
```
 "abc"i 
```

Javascript syntax: match a, b, c, A, B, C (ignore case specified)
```
 /abc/i 
```


## <a name='brackets'> Brackets </a>


| Expression       |    Description            |
| :---         |    :----                           |
| **[abc]**     |  	Find any character between the brackets                            |
| **[^abc]**     |  Find any character NOT between the brackets                            |
| **[0-9]**     |  Find any character between the brackets (any digit)                             |
| **[^0-9]**     |  Find any character NOT between the brackets (any non-digit)                            |
| **(x&#124;y)**     |  Find any of the alternatives specified                             |



## <a name='metacharacters'> Metacharacters </a>


| Metacharacter       |    Description            |
| :---         |    :----                           |
| **.**     |  	Find a single character, except newline or line terminator                            |
| **\w**     |  Find a word character                            |
| **\W**     |  Find a non-word character                             |
| **\d**     |  Find a digit                            |
| **\D**     |  Find a non-digit character                             |
| **\s**     |  Find a whitespace character                             |
| **\S**     |  Find a non-whitespace character                             |
| **\b**     |  Find a match at the beginning/end of a word, beginning like this: \bHI, end like this: HI\b                             |
| **\B**     |  Find a match, but not at the beginning/end of a word                             |
| **\0**     |  Find a NULL character                            |
| **\n**     |  Find a new line character                            |
| **\f**     |  Find a form feed character                             |
| **\r**     |  Find a carriage return character                             |
| **\t**     |  Find a tab character                             |
| **\v**     |  Find a vertical tab character                             |
| **\xxx**     |  Find the character specified by an octal number xxx                             |
| **\xdd**     |  Find the character specified by a hexadecimal number dd                            |
| **\udddd**     |  Find the Unicode character specified by a hexadecimal number dddd                             |



## <a name='quantifiers'> Quantifiers </a>

| Metacharacter       |    Description            |
| :---         |    :----                           |
| **n+**     |  	Matches any string that contains at least one n                            |
| **n***     |  Matches any string that contains zero or more occurrences of n                           |
| **n?**     |  	Matches any string that contains zero or one occurrences of n                            |
| **n{X}**     |  Matches any string that contains a sequence of X n's                            |
| **n{X,Y}**     |  Matches any string that contains a sequence of X to Y n's                            |
| **n{X,}**     |  Matches any string that contains a sequence of at least X n's                             |
| **n$**     |  Matches any string with n at the end of it                             |
| **^n**     |  	Matches any string with n at the beginning of it                             |
| **?=n**     |  Matches any string that is followed by a specific string n                             |
| **?!n**     |  	Matches any string that is not followed by a specific string n                            |




## <a name='lookaround'> Look Around </a>


#### Positive Look Behind (?<= ...

Given the following data
```
The Value is Rs 9400
 The value is Rs5844
Rs 9855 is the value
```

To match <code> Rs 9400 </code> and <code> Rs5844 </code>

```
(?<=The [v|V]alue is).*
```


#### Negative Look Behind (?<! ...

Given the following data
```
Price is $400
Price is €500
600
```

To match <code> 500 </code> (the euro amount only)

```
(?<![$])(?<=€)\d{3}
```



### Look Ahead 

#### Positive Look Ahead (?=

Given the following data
```
The Value is Rs 9400
 The value is Rs5844
Rs 9855 is the value
```

To match <code> Rs 9855 </code>

```
.*(?=is the value)
```


#### Negative Look Ahead (?!

Given the following data
```
yahoo.com
yahoo.eg
yahoo.net
yahoo.uk
yahoo.edu
```

To match domain name except <code> .com </code>

```
[a-z-]+(?!\.com)
```

or

```
[a-z-]+(?!\.com)(?=\.[a-z]+)
```


## <a name='java_example'> Java Example </a>


```java
    String emailStr = "myemail@yahoo.com";

    Pattern emailPattern =
            Pattern.compile("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,6}$", Pattern.CASE_INSENSITIVE);
    Matcher matcher = emailPattern.matcher(emailStr);


    System.out.println(emailStr + " : " + matcher.find());   <---- find the next subsequence of the input sequence that matches the pattern.
    System.out.println(emailStr + " : " + matcher.matches());   <---- match the entire region against the pattern.

    System.out.println(emailStr + " : " + matcher.find());
    System.out.println(emailStr + " : " + matcher.matches());

```


Output:
```
myemail@yahoo.com : true
myemail@yahoo.com : true
myemail@yahoo.com : false
myemail@yahoo.com : true
```

Conclusion:
> matcher.matches() should be used in this case     
  
 
 
 
 ## <a name='capturing_group'> Capturing group </a>
 
 
 Syntax : **(regex)**
 
 Parentheses group the regex between them. They capture the text matched by the regex inside them into a numbered group that can be reused with a numbered backreference. They allow you to apply regex operators to the entire grouped regex.
 
 
 By default the matches string will be places in group(0)
 then the grouped parentheses will be places in group(1), group(2), ... etc
 
 Example:
 ```
(abc){3} 
```
 
 matches abcabcabc. First group matches abc.
 
 #### Example (1)
 ```java
        String urlStr = "http://www.microsoft.com/some/other/url/path   dummy " +
                "dummy String " +
                "http://www.google.com/some/other/url/yanas" +
                " dummy";


        Pattern simpleUrlPattern = Pattern.compile("[^: \n\r]+://([.a-z]+/?)+");

        Matcher matcher = simpleUrlPattern.matcher(urlStr);

        System.out.println(matcher.groupCount());    <----- prints 1

        String resultString = matcher.replaceAll ("<a href=\"$0\"> $1 link</a>");
        System.out.println("Result " + resultString);
```
 
 Output:
 ```
Result <a href="http://www.microsoft.com/some/other/url/path"> path link</a>   dummy dummy String <a href="http://www.google.com/some/other/url/yanas"> yanas link</a> dummy
```

 **Note:**    
 $0 is the matched Url   
 $1 is the first group (path)
 
 
 
#### Example (2)
 
Replace "LastName, FirstName" to "FirstName LastName" in an input text
 
 ```java
    String text = "Seddik, Mina and Sabry, Jasmin also we have Imam, Adel";


    Pattern simpleUrlPattern = Pattern.compile("([a-zA-Z-']+),\\s([a-zA-Z-']+)");

    Matcher matcher = simpleUrlPattern.matcher(text);

    String result = matcher.replaceAll ("$2 $1");


    System.out.println("Input text: " + text);
    System.out.println("Result: " + result);
```

Output:
```
Input text: Seddik, Mina and Sabry, Jasmin also we have Imam, Adel
Result: Mina Seddik and Jasmin Sabry also we have Adel Imam
```

#### Example (3)
 
Match numbers and multiply them by 3

```java
    String text = "Here are 12 and 54 and 1 and 65 this is good";


    Pattern regex = Pattern.compile("(\\d{1,2})");
    Matcher matcher = regex.matcher(text);
    StringBuffer resultString = new StringBuffer();
    while (matcher.find()) {
        matcher.appendReplacement(resultString, String.valueOf(3 * Integer.parseInt(matcher.group(1))));
    }
    matcher.appendTail(resultString);


    System.out.println("Input text: " + text);
    System.out.println("Result: " + resultString);
```


Output:
```
Input text: Here are 12 and 54 and 1 and 65 this is good
Result: Here are 36 and 162 and 3 and 195 this is good
```



 ## <a name='non_capturing_group'> Non-capturing group </a>
 
 
 Syntax : **(?:regex)**
 
Non-capturing parentheses group the regex so you can apply regex operators, but do not capture anything.


 Example:
 ```
(?:abc){3}
```
 
matches abcabcabc. No groups.
 
 
 
 ## <a name='greedy_vs_lazy_match'> Greedy vs Lazy Match </a> 
 
Greedy will consume as much as possible. 
we can see an example of trying to match HTML tags with <.+>   
 
 
Suppose you have the following:

```
 <em>Hello World</em>
```

You may think that <.+> (. means any non newline character and + means one or more) would only match the <em> and the </em>, when in reality it will be very greedy, and go from the first < to the last >. This means it will match <em>Hello World</em> instead of what you wanted.
 
```
<.+>
``` 

will match

```
<em>Hello World</em>
``` 
Making it lazy (<.+?>) will prevent this. By adding the ? after the +, we tell it to repeat as few times as possible, so the first > it comes across, is where we want to stop the matching.
 
```
<.+?>
``` 
 
will match
 
```
<em>
``` 

and 

```
</em>
```