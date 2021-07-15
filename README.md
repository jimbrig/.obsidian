# .obsidian
>  Default Obsidian Vault Configurations

## Setup

Use `git-crypt` to encrypt secrets such as my Todoist API key.

```bash
git-crypt init
git-crypt export-key ../git-crypt-key
git-crypt add-gpg-user jimbrig1993@outlook.com
echo ".obsidian/todoist-token filter=git-crypt diff=git-crypt" > .gitattributes
git add .
git commit -m "Initialize git-crypt and encrypt todoist token"
git push
```

