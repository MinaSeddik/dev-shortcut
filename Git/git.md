# Git Source Control



- [git add / git rm - *Add/Remove file to/from stage area*](#git_add_rm)
- [git commit](#git_commit)
- [git status](#git_status)
- [git log](#git_log)
- [git reset](#git_reset)
- [git merge](#git_merge)
- [git rebase](#git_rebase)
- [git rebase -i   (*interactive mode*) ](#git_rebase_iteractive)
- [git remote (*point to remote repo*) ](#git_remote)
- [git branch](#git_branch)
- [git fetch](#git_fetch)
- [git pull](#git_pull)
- [git push](#git_push)
- [git stash](#git_stash)






## <a name='git_add_rm'> git add / git rm - *Add/Remove file to/from stage area* </a>

To add a file to stage, Use: git add <fileName>
```git
git add fileName
```

To add all files to stage
```git
git add *
```
OR
```git
git add -A
```
OR
```git
git add -all
```

To remove a file from stage, Use: git rm <fileName>
```git
git rm fileName
```

To remove all staged files
```git
git reset HEAD
```

## <a name='git_commit'> git commit </a>

```git
git commit -m "message"
```

To add more file to the last commit, issue the following command after staging the files
OR
To change the message of the last commit
```git
git commit --amend
```



## <a name='git_status'> git status </a>

```git
git status
```


## <a name='git_log'> git log </a>

```git
git log
```

```git
git log --oneline
```


## <a name='git_reset'> git reset </a>

git reset changes, at minimum, where the current branch (HEAD) is pointing. The difference between --mixed and --soft is whether or not your index is also modified. So, if we're on branch master with this series of commits:

```
- A - B - C (master)
```
 HEAD points to C and the index matches C.
 
 When we run git reset --soft B, master (and thus HEAD) now points to B, but the index still has the changes from C; git status will show them as staged. So if we run git commit at this point, we'll get a new commit with the same changes as C.
 
 ```git
git reset --soft HEAD
 ```

exactly the same as

 ```git
git reset --soft 
 ```


 ___
 Okay, so starting from here again:
 ```
 - A - B - C (master)
 ```

Now let's do git reset --mixed B. (Note: --mixed is the default option). Once again, master and HEAD point to B, but this time the index is also modified to match B. If we run git commit at this point, nothing will happen since the index matches HEAD. We still have the changes in the working directory, but since they're not in the index, git status shows them as unstaged. To commit them, you would git add and then commit as usual.


 ```git
git reset HEAD
 ```

exactly the same as

 ```git
git reset 
 ```
___

And finally, --hard is the same as --mixed (it changes your HEAD and index), except that --hard also modifies your working directory. If we're at C and run git reset --hard B, then the changes added in C, as well as any uncommitted changes you have, will be removed, and the files in your working copy will match commit B. Since you can permanently lose changes this way, you should always run git status before doing a hard reset to make sure your working directory is clean or that you're okay with losing your uncommitted changes.

 ```git
git reset --hard HEAD
 ```

exactly the same as

 ```git
git reset --hard 
 ```

___
And finally, a visualization:

![alt text](./git_reset.jpg)


## <a name='git_merge'> git merge </a>

merge source into target
```
git checkout <target>     
git merge <source>
```
Note: the source pointer won't change but the target pointer will

ex: **merge feature (source) branch into master branch (target)** 

first, checkout master branch
```
git checkout master
```

then, merge feature branch to master
```
git merge feature
```

Note: the master branch pointer will move but feature branch will remain as it is

---
**There are 2 types of merge**

- Fast-forward merge

    In this most commonly used merge strategy, history is just one straight line. When you create a branch, make some commits in that branch, the time you’re ready to merge, there is no new merge on the master. That way master’s pointer is just moved straight forward and history is one straight line.

    ![alt text](./merge_fastforward.gif)
    
- **Recursive merge**

    Recursive is the default merge strategy when  merging one branch.

    In Recursive merge, after you branch and make some commits, there are some new original commits on the ‘master‘. So, when it’s time to merge, git recurses over the branch and creates a new merge commit. The merge commit continues to have two parents.
    
    ![alt text](./merge_recursive.gif)



## <a name='git_rebase'> git rebase </a>

Rebase is recreating your work from one branch onto another.
    
rebase a branch (target) on top of another branch (base)

Note: the base pointer won't change but the target pointer will

ex: **rebase feature (target) branch on master branch (base)** 

first, checkout master feature
```git
git checkout feature
```

then, merge feature branch to master
```git
git rebase master
```

Note: the master branch pointer will NOT change but feature branch will


   ![alt text](./rebase_1.gif)
    
   ![alt text](./rebase_2.gif)
   
      
Then we can perform merge feature into master (fast forward merge)

this way, we can keep a clean history

```git
git checkout master
git merge feature
```
       
    
## <a name='git_reset'> git rebase -i   (*interactive mode*) </a>

```git
git rebase -i HEAD~3
```

i: interactive

HEAD~3: rebase (change) last 3 commits


you can squash, change commit message, delete a commit and much more


## <a name='git_remote'> git remote (*point to remote repo.*) </a>

To list remote
```git
git remote -v
```

To list remote
```git
git remote add origin <URL>
```

To list remote
```git
git rename <source> <dest>
```
    
 and much more like delete remote ....


## <a name='git_branch'> git branch</a>

Create new branch without check it out
```git
git branch <branch_name>
```

Create new branch and check it out
```git
git checkout -b <branch_name>
```

Delete branch
```git
git branch -d <branch_name>
```

and to delete the remote branch
```git
git push origin <branch_name> --delete
```

list local branches
```git
git branch -l
```

list remote branches
```git
git branch -r
```

list all branches
```git
git branch -a
```


## <a name='git_fetch'> git fetch </a>

Used to fetch and update the remote refrences only without changing anything

It'll be usefull to track the remote branch and compare it with the local
```git
git fetch  <branch_name>
```

to fetch current checkout branch
```git
git fetch 
```

to fetch all remote branches
```git
git fetch --all
```


## <a name='git_pull'> git pull </a>

pull = fetch + merge 
```git
git pull origin <branch_name>
```

ex: to update master branch from remote
```git
git pull origin master
```

OR

```git
git checkout master
git pull  
```


to do rebase instead of merge

pull = fetch + rebase
```git
git pull origin master --rebase
```

OR

```git
git checkout master
git pull origin --rebase
```

## <a name='git_push'> git push </a>

To push the changes to the remote
```git
git push origin <branch_name>
```

ex: to push master branch to the remote
```git
git push origin master
```

 Note: for the first time, you may need to do --set-upstream
 ```git
 git push --set-upstream origin <branch>
```

ex: to push master branch to the remote for the first time
```git
git push --set-upstream origin master
```


## <a name='git_stash'> git stash </a>



