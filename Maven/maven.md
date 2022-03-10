# Maven Build Automation


- [Install maven](#install_maven)
- [git add](#git_add)
- [git rm](#git_rm)
- [git commit](#git_commit)


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

to install OpenJDK 11 , by typing:
```
sudo apt update
sudo apt install default-jdk
```

to install Java 8
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



