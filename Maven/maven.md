# Maven Build Automation


- [Install Maven](#install_maven)
- [Maven Build lifecycle](#life_cycle)



## <a name='install_maven'> Install Maven </a>

#### Installing Maven on Ubuntu using apt is a simple, straightforward process.

Update the package index and install Maven by entering the following commands:
```
sudo apt update
sudo apt install maven
```

To verify the installation, run
```
mvn -version
```

#### Maven 3.3+ requires JDK 1.7 or above to be installed.

**Take care:** Which Java JDK you want to install?!
> Oracle jdk or openjdk ?!

Here is a reference to install Oracle jdk   
https://www.javahelps.com/2015/03/install-oracle-jdk-in-ubuntu.html  


to install OpenJDK 11 , by typing:
```
sudo apt update
sudo apt install default-jdk
```

to install openjdk Java 8
```
sudo apt update
sudo apt install openjdk-8-jdk
```


To verify java installation, run
```
java -version
```

#### Setup environment variables

create a new file named maven.sh in the /etc/profile.d/ directory.
```
sudo vi /etc/profile.d/maven.sh
```

Paste the following code:
```bash
export JAVA_HOME=/usr/lib/jvm/default-java
export M2_HOME=/opt/maven
export MAVEN_HOME=/opt/maven
export PATH=${M2_HOME}/bin:${PATH}
```

Save and close the file. This script will be sourced at shell startup.

Make the script executable with chmod :
```bash
sudo chmod +x /etc/profile.d/maven.sh
```

Finally, load the environment variables using the source command:
```bash
source /etc/profile.d/maven.sh
```

to verify that Maven is installed, use
```
mvn -version
```


## <a name='life_cycle'> Maven Build lifecycle </a>

Maven has the following three standard lifecycles :

1. clean
2. default(or build)
3. site

### 1. Clean Lifecycle

The clean lifecycle consisting of the following 3 phases

| Sr.No.      | Lifecycle Phase & Description       |
| :---        |    :----:                           |
| 1           | pre-clean                           |
| 2           | clean                               |
| 3           | post-clean                          |

### 2. default(or build) Lifecycle

This is the primary life cycle of Maven and is used to build the application. It has the following 21 phases

| Sr.No.       | Lifecycle Phase & Description       |
| :---         |    :----                           |
| 1            | **validate** <br/><br/>  Validates whether project is correct and all necessary information is available to complete the build process.                        |
| 2            | **initialize** <br/><br/>  Initializes build state, for example set properties.                        |
| 3            | **generate-sources** <br/><br/>  Generate any source code to be included in compilation phase.                        |
| 4            | **process-sources** <br/><br/>   Process the source code, for example, filter any value.                       |
| 5            | **generate-resources** <br/><br/>  Generate resources to be included in the package.                        |
| 6            | **process-resources** <br/><br/>  Copy and process the resources into the destination directory, ready for packaging phase.                        |
| 7            | **compile** <br/><br/>  Compile the source code of the project.                        |
| 8            | **process-classes** <br/><br/>  Post-process the generated files from compilation, for example to do bytecode enhancement/optimization on Java classes.                        |
| 9            | **generate-test-sources** <br/><br/>  Generate any test source code to be included in compilation phase.                        |
| 10           | **process-test-sources** <br/><br/>  Process the test source code, for example, filter any values.                        |
| 11           | **test-compile** <br/><br/>   Compile the test source code into the test destination directory.                       |
| 12           | **process-test-classes** <br/><br/>  Process the generated files from test code file compilation.                        |
| 13           | **test** <br/><br/>  Run tests using a suitable unit testing framework (Junit is one).                        |
| 14           | **prepare-package** <br/><br/>  Perform any operations necessary to prepare a package before the actual packaging.                        |
| 15           | **package** <br/><br/>  Take the compiled code and package it in its distributable format, such as a JAR, WAR, or EAR file.                       |
| 16           | **pre-integration-test** <br/><br/>  Perform actions required before integration tests are executed. For example, setting up the required environment.                        |
| 17           | **integration-test** <br/><br/>  Process and deploy the package if necessary into an environment where integration tests can be run.                        |
| 18           | **post-integration-test** <br/><br/>  Perform actions required after integration tests have been executed. For example, cleaning up the environment.                        |
| 19           | **verify** <br/><br/>  Run any check-ups to verify the package is valid and meets quality criteria.                        |
| 20           | **install** <br/><br/>  Install the package into the local repository, which can be used as a dependency in other projects locally.                        |
| 21           | **deploy** <br/><br/>   Copies the final package to the remote repository for sharing with other developers and projects.                       |


### 3. Site  Lifecycle

The clean lifecycle consisting of the following 3 phases

| Sr.No.      | Lifecycle Phase & Description      |
| :---        |    :----:                          |
| 1           | pre-site                           |
| 2           | site                               |
| 3           | post-site                          |
| 4           | site-deploy                        |







