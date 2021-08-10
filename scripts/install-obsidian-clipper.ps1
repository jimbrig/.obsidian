# set github_api_token envvar for lastversion
# $github_api_token = <PAT>

pip install lastversion

lastversion jplattel/obsidian-clipper --pre --download obsidian-clipper.zip

mkdir obsidian-clipper
expand-archive "obsidian-clipper.zip" "obsidian-clipper" -Force
Set-Location obsidian-clipper
Get-ChildItem | Set-Location

