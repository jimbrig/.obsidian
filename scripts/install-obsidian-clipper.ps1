# set github_api_token envvar for lastversion
# $github_api_token =

pip install lastversion

lastversion jplattel/obsidian-clipper --pre --download obsidian-clipper.zip

Move-Item ~/.dotfiles/obsidian-clipper.zip -Destination ~/Downloads
Set-Location ~/Downloads

expand-archive "obsidian-clipper.zip" "obsidian-clipper" -Force
Set-Location obsidian-clipper
Get-ChildItem | Set-Location

start-process edge://extensions
