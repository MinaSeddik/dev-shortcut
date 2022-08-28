
https://cdn.oreillystatic.com/en/assets/1/event/21/Connector_J%20Performance%20Gems%20Presentation.pdf



# Prepared statement

It's a good idea to benchmark your application with and without statement pooling to see if and how much it helps.

configure MySQL for prepared statement caching
ex: https://github.com/brettwooldridge/HikariCP/wiki/MySQL-Configuration

`prepStmtCacheSize`
This sets the number of prepared statements that the MySQL driver will cache per connection. The default is a conservative 25. We recommend setting this to between 250-500.

`prepStmtCacheSqlLimit`
This is the maximum length of a prepared SQL statement that the driver will cache. The MySQL default is 256. In our experience, especially with ORM frameworks like Hibernate, this default is well below the threshold of generated statement lengths. Our recommended setting is 2048.

`cachePrepStmts`
Neither of the above parameters have any effect if the cache is in fact disabled, as it is by default. You must set this parameter to true.

`useServerPrepStmts` : Newer versions of MySQL support server-side prepared statements, this can provide a substantial performance boost. Set this property to true.

A typical MySQL configuration for HikariCP might look something like this:

```
spring.datasource.jdbcUrl=jdbc:mysql://localhost:3306/simpsons
spring.datasource.url=jdbc:mysql://localhost:3306/simpsons
username=test
password=test
spring.dataSource.cachePrepStmts=true
spring.dataSource.prepStmtCacheSize=250
spring.dataSource.prepStmtCacheSqlLimit=2048
spring.dataSource.useServerPrepStmts=true
spring.dataSource.useLocalSessionState=true
dataSource.rewriteBatchedStatements=true
dataSource.cacheResultSetMetadata=true
dataSource.cacheServerConfiguration=true
dataSource.elideSetAutoCommits=true
dataSource.maintainTimeStats=false
```
### batch insert/update
https://javabydeveloper.com/spring-jdbctemplate-batch-update-with-maxperformance/

To improve performance of query execution for mysql, 
we can apply properties `maxPerformance` and `rewriteBatchedStatements=true` to the data source configuration.

```
### Optimization
spring.datasource.hikari.data-source-properties.useConfigs=maxPerformance
spring.datasource.hikari.data-source-properties.rewriteBatchedStatements=true
```

For debugging
```
spring.datasource.hikari.data-source-properties.useConfigs=maxPerformance,fullDebug
```
#### limitation
if you are hard-coding the values using INSERT ... VALUES pattern, then there is a limit on how large/long your statement is: max_allowed_packet which limits the length of SQL statements sent by the client to the database server, and it affects any types of queries and not only for INSERT statement.

MySQL client or the mysqld server receives a packet bigger than max_allowed_packet bytes, it issues a Packet too large error and closes the connection.

To view what the default value is for max_allowed_packet variable, execute the following command in in MySQL:

show variables like 'max_allowed_packet';

Standard MySQL installation has a default value of 1048576 bytes (1MB). This can be increased by setting it to a higher value for a session or connection.

This sets the value to 500MB for everyone (that's what GLOBAL means):

SET GLOBAL max_allowed_packet=524288000;

check your change in new terminal with new connection:

show variables like 'max_allowed_packet';

Now it should work without any error for infinite records insert.

# JDBC transaction control

In basic JDBC usage, connections have an autocommit mode (set via the
setAutoCommit() method). If autocommit is turned on (and for most JDBC drivers,
that is the default), each statement in a JDBC program is its own transaction. In that
case, a program need take no action to commit a transaction (in fact, if the commit()
method is called, performance will often suffer).


in Spring `@Transactionl` using JDBC , the following codes show that if the auto-commit is enabled , it will disable it before executing any transactional codes. It also will re-enable it after completing the transaction.
```
// Switch to manual commit if necessary. This is very expensive in some JDBC drivers,
// so we don't want to do it unnecessarily (for example if we've explicitly
// configured the connection pool to set it already).
if (con.getAutoCommit()) {
    txObject.setMustRestoreAutoCommit(true);
    if (logger.isDebugEnabled()) {
        logger.debug("Switching JDBC Connection [" + con + "] to manual commit");
    }
    con.setAutoCommit(false);
}
```

In Hikari, just follows the default auto-commit value (i.e. true) 
defined by JDBC in order to align with its default behaviour .





















