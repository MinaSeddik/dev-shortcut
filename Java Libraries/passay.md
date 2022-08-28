# Passay - Java Password Validator


**Passay** is a Java based Password generation and validation library. It provides comprehensive features list in order to validate/generate passwords and is highly configurable.

Passay API has 3 core components.
- **Rule** − one or more rules which define a password policy rule set.
- **PasswordValidator** − A validator component which validates a password against a given rule set.
- **PasswordGenerator** − A generator component which produces passwords to satisfy a given rule set.


```java
public class PassayExample {
    public static void main(String[] args) {
        
        List<Rule> rules = new ArrayList<>(); 
       
        //Rule 1: Password length should be in between 8 and 16 characters
        rules.add(new LengthRule(8, 16));  
      
        //Rule 2: No whitespace allowed
        rules.add(new WhitespaceRule());  
      
        //Rule 3.a: At least one Upper-case character
        rules.add(new CharacterRule(EnglishCharacterData.UpperCase, 1));    
    
        //Rule 3.b: At least one Lower-case character
        rules.add(new CharacterRule(EnglishCharacterData.LowerCase, 1));    
    
        //Rule 3.c: At least one digit
        rules.add(new CharacterRule(EnglishCharacterData.Digit, 1));  
      
        //Rule 3.d: At least one special character
        rules.add(new CharacterRule(EnglishCharacterData.Special, 1));

        
        PasswordValidator validator = new PasswordValidator(rules);        
        PasswordData password = new PasswordData("Microsoft@123");        
        RuleResult result = validator.validate(password);
        
        if(result.isValid()){
            System.out.println("Password validated.");
        }else{
            System.out.println("Invalid Password: " + validator.getMessages(result));            
        }
    }
}
```


#### Customized Messages

```java
Properties props = new Properties();
props.load(new FileInputStream("/path/to/passay.properties"));   <---- file contains error messages
MessageResolver resolver = new PropertiesMessageResolver(props);
PasswordValidator validator = new PasswordValidator(resolver, new LengthRule(8, 16), new WhitespaceRule());
```


```java
public class PassayExample {
   public static void main(String[] args) throws FileNotFoundException, IOException {
      List<Rule> rules = new ArrayList<>();
      rules.add(new LengthRule(8, 16));
      rules.add(new WhitespaceRule());
      rules.add(new CharacterRule(EnglishCharacterData.UpperCase, 1));
      rules.add(new CharacterRule(EnglishCharacterData.LowerCase, 1));
      rules.add(new CharacterRule(EnglishCharacterData.Digit, 1));
      rules.add(new CharacterRule(EnglishCharacterData.Special, 1));

      Properties props = new Properties();
      props.load(new FileInputStream("/path/to/messages.properties"));    // <---- file contains error messages
      MessageResolver resolver = new PropertiesMessageResolver(props);

      PasswordValidator validator = new PasswordValidator(resolver, rules);
      PasswordData password = new PasswordData("microsoft@123");
      RuleResult result = validator.validate(password);
      if(result.isValid()){
         System.out.println("Password validated.");
      }else{
         System.out.println("Invalid Password: " + validator.getMessages(result));            
      }
   }
}
```

Output:
> Invalid Password: [Password missing at least 1 uppercase characters.]

Passay provides the MessageResolver interface to allow arbitrary conversion of password validation results to meaningful text intended for display to users. The default mechanism uses a message bundle to define validation messages whose default values are shown below.

```
HISTORY_VIOLATION=Password matches one of %1$s previous passwords.
ILLEGAL_WORD=Password contains the dictionary word '%1$s'.
ILLEGAL_WORD_REVERSED=Password contains the reversed dictionary word '%1$s'.
ILLEGAL_DIGEST_WORD=Password contains a dictionary word.
ILLEGAL_DIGEST_WORD_REVERSED=Password contains a reversed dictionary word.
ILLEGAL_MATCH=Password matches the illegal pattern '%1$s'.
ALLOWED_MATCH=Password must match pattern '%1$s'.
ILLEGAL_CHAR=Password %2$s the illegal character '%1$s'.
ALLOWED_CHAR=Password %2$s the illegal character '%1$s'.
ILLEGAL_QWERTY_SEQUENCE=Password contains the illegal QWERTY sequence '%1$s'.
ILLEGAL_ALPHABETICAL_SEQUENCE=Password contains the illegal alphabetical sequence '%1$s'.
ILLEGAL_NUMERICAL_SEQUENCE=Password contains the illegal numerical sequence '%1$s'.
ILLEGAL_USERNAME=Password %2$s the user id '%1$s'.
ILLEGAL_USERNAME_REVERSED=Password %2$s the user id '%1$s' in reverse.
ILLEGAL_WHITESPACE=Password %2$s a whitespace character.
ILLEGAL_NUMBER_RANGE=Password %2$s the number '%1$s'.
ILLEGAL_REPEATED_CHARS=Password contains %3$s sequences of %1$s or more repeated characters, but only %2$s allowed: %4$s.
INSUFFICIENT_UPPERCASE=Password must contain %1$s or more uppercase characters.
INSUFFICIENT_LOWERCASE=Password must contain %1$s or more lowercase characters.
INSUFFICIENT_ALPHABETICAL=Password must contain %1$s or more alphabetical characters.
INSUFFICIENT_DIGIT=Password must contain %1$s or more digit characters.
INSUFFICIENT_SPECIAL=Password must contain %1$s or more special characters.
INSUFFICIENT_CHARACTERISTICS=Password matches %1$s of %3$s character rules, but %2$s are required.
INSUFFICIENT_COMPLEXITY=Password meets %2$s complexity rules, but %3$s are required.
INSUFFICIENT_COMPLEXITY_RULES=No rules have been configured for a password of length %1$s.
SOURCE_VIOLATION=Password cannot be the same as your %1$s password.
TOO_LONG=Password must be no more than %2$s characters in length.
TOO_SHORT=Password must be %1$s or more characters in length.
TOO_MANY_OCCURRENCES=Password contains %2$s occurrences of the character '%1$s', but at most %3$s are allowed.
```


#### Password Generation

```java
public class PassayExample {
   public static void main(String[] args) {
      CharacterRule alphabets = new CharacterRule(EnglishCharacterData.Alphabetical);
      CharacterRule digits = new CharacterRule(EnglishCharacterData.Digit);
      CharacterRule special = new CharacterRule(EnglishCharacterData.Special);

      PasswordGenerator passwordGenerator = new PasswordGenerator();
      String password = passwordGenerator.generatePassword(8, alphabets, digits, special);
      System.out.println(password);
   }
}
```

#### M of N rules

Many times a password policy mandated compliance to minimum rules out of given rules such as a password must be compliant with at least M of N rules. Consider the following policy.
 
- Length of password should be in between 8 to 16 characters.
- A password should not contain any whitespace.
- A password should contains at least three of the following: upper, lower, digit or symbol.

```java
public class PassayExample {
   public static void main(String[] args) throws FileNotFoundException, IOException {
      //Rule 1: Password length should be in between 
      //8 and 16 characters
      Rule rule1 = new LengthRule(8, 16);        
      //Rule 2: No whitespace allowed
      Rule rule2 = new WhitespaceRule();        
      CharacterCharacteristicsRule rule3 = new CharacterCharacteristicsRule();        
      //M - Mandatory characters count
      rule3.setNumberOfCharacteristics(3);        
      //Rule 3.a: One Upper-case character
      rule3.getRules().add(new CharacterRule(EnglishCharacterData.UpperCase, 1));        
      //Rule 3.b: One Lower-case character
      rule3.getRules().add(new CharacterRule(EnglishCharacterData.LowerCase, 1));        
      //Rule 3.c: One digit
      rule3.getRules().add(new CharacterRule(EnglishCharacterData.Digit, 1));        
      //Rule 3.d: One special character
      rule3.getRules().add(new CharacterRule(EnglishCharacterData.Special, 1));

      PasswordValidator validator = new PasswordValidator(rule1, rule2, rule3);        
      PasswordData password = new PasswordData("microsoft@123");        
      RuleResult result = validator.validate(password);

      if(result.isValid()){
         System.out.println("Password validated.");
      }else{
         System.out.println("Invalid Password: " + validator.getMessages(result));            
      }
   }
}
```

#### AllowedRegexRule

```java
public class PassayExample {
   public static void main(String[] args) {
      //Rule: Password should contains alphabets only
      Rule rule1 = new AllowedRegexRule("^[A-Za-z]+$");
      //8 and 16 characters
      Rule rule2 = new LengthRule(8, 16);    

      PasswordValidator validator = new PasswordValidator(rule1, rule2);
      PasswordData password = new PasswordData("microsoft@123");
      RuleResult result = validator.validate(password);

      if(result.isValid()){
         System.out.println("Password validated.");
      }else{
         System.out.println("Invalid Password: " + validator.getMessages(result));            
      }
   }
}
```


Output:
> Invalid Password: [Password must match pattern '^[A-Za-z]+$'.]


#### IllegalCharacterRule

```java
public class PassayExample {
   public static void main(String[] args) {
      //Rule: Special characters like &, <, > are not allowed in a password 
      IllegalCharacterRule illegalCharacterRule 
         = new IllegalCharacterRule(new char[] {'&', '<', '>'});

      //Rule: 1 to 5 numbers are not allowed
      NumberRangeRule numberRangeRule = new NumberRangeRule(1, 5);

      //Rule: White spaces are not allowed
      WhitespaceRule whitespaceRule = new WhitespaceRule();

      PasswordValidator validator 
         = new PasswordValidator(illegalCharacterRule,numberRangeRule,whitespaceRule);
      PasswordData password = new PasswordData("abc&4d  ef6");
      RuleResult result = validator.validate(password);

      if(result.isValid()){
         System.out.println("Password validated.");
      }else{
         System.out.println("Invalid Password: " + validator.getMessages(result));            
      }
   }
}
```


Output:
> Invalid Password: [   
> Password contains the illegal character '&'.,   
> Password contains the number '4'.,   
> Password contains a whitespace character.]   



#### DictionaryRule

DictionaryRule allows to check if certain words are not specified as password. Consider the following example.

```java
public class PassayExample {
   public static void main(String[] args) {
      WordListDictionary wordListDictionary = new WordListDictionary(new ArrayWordList(new String[] { "password", "username" }));
      DictionaryRule dictionaryRule = new DictionaryRule(wordListDictionary);
      PasswordValidator validator = new PasswordValidator(dictionaryRule);
      PasswordData password = new PasswordData("password");
      RuleResult result = validator.validate(password);

      if(result.isValid()){
         System.out.println("Password validated.");
      }else{
         System.out.println("Invalid Password: " + validator.getMessages(result));            
      }
   }
}
```

Output:
> Invalid Password: [Password contains the dictionary word 'password'.]



#### DictionarySubstringRule

```java
public class PassayExample {
   public static void main(String[] args) {
      WordListDictionary wordListDictionary = new WordListDictionary(new ArrayWordList(new String[] { "password", "username" }));
      DictionarySubstringRule dictionaryRule = new DictionarySubstringRule(wordListDictionary);
      PasswordValidator validator = new PasswordValidator(dictionaryRule);
      PasswordData password = new PasswordData("password@123");
      RuleResult result = validator.validate(password);

      if(result.isValid()){
         System.out.println("Password validated.");
      }else{
         System.out.println("Invalid Password: " + validator.getMessages(result));            
      }
   }
}
```

Output:
> Invalid Password: [Password contains the dictionary word 'password'.]


#### Username Rule

UsernameRule ensures that password is not containing the username. 

```java
public class PassayExample {
   public static void main(String[] args) {
      //Rule: Password should not contain user-name
      Rule rule = new UsernameRule();
      
      PasswordValidator validator = new PasswordValidator(rule);
      PasswordData password = new PasswordData("microsoft");
      password.setUsername("micro");
      RuleResult result = validator.validate(password);

      if(result.isValid()){
         System.out.println("Password validated.");
      }else{
         System.out.println("Invalid Password: " + validator.getMessages(result));            
      }
   }
}
```

Output:
> Invalid Password: [Password contains the user id 'micro'.]


