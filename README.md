# .obsidian
>  Default Obsidian Vault Configurations

## Setup

Clone repo and configure obsidian vaults to utilize it as shared config directory or create symlinks/copy over:

```powershell
git clone git@github.com:jimbrig/.obsidian.git
cd .obsidian
git-crypt unlock
cd ..
Copy-Item -Path ".obsidian" -ItemType Directory -Destination "< PATH TO VAULT >" -Force
```

Then open vault via: `start obsidian://vault/<vault>` using Obsidian's URI.

# Installation

See the [scripts](./scripts) folder for powershell scripts to install Obsidian from the official GitHub reop's releases as well as the Obsidian Web Clipper browser extension.

## Encryption

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

