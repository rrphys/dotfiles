# dotfiles
Backups of my current configuration files

## Installation order
To set up a fresh machine run scripts in the following order:
- run_first.sh
- setup_osx.sh
- pyenv_install.sh
- dein_installer.sh
- make_symlinks.sh

The following scripts are more optional:
- rust_install.sh
- install_zsh.sh
- install_fish.sh

### Status
- Management of atom and subblime via this repository is only partially
  functional.
- I am still experimenting with zsh and the fish shell to see whether
  I gain real benefit from them.
- I recently switched to neovim from vim and am currently maintaining
  configuration files for both of them, but my vimrc and vim bundles
  are likely to get out of date as time goes on.
- setup_osx.sh is largely untested because I have not configured a new
  laptop from scratch since it was developed.
