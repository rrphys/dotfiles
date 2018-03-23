
## PATH
export PATH=/usr/local/manual/bin:$PATH
export PATH=$PATH:$HOME/gamalon/tycho
export PATH="$PATH:$HOME/.cargo/bin"
export PATH=$PATH:/usr/local/share/pypy3:/usr/local/share/pypy


# # ----------------------------- Plugins ---------------------------------------
# # inspired by https://github.com/tonylambiris/dotfiles/blob/master/dot.zshrc
#
# # Install zplug if it is not already installed
# [ ! -d ~/.zplug ] && git clone https://github.com/zplug/zplug ~/.zplug
# source ~/.zplug/init.zsh
#
# # Have zplug manage zplug
# zplug 'zplug/zplug', hook-build:'zplug --self-manage'
#
# # zsh-users
# zplug "zsh-users/zsh-completions"
# zplug "zsh-users/zsh-autosuggestions"
#
# # plugins
# if [[ $OSTYPE = (darwin)* ]]; then
#     zplug "plugins/osx",      from:oh-my-zsh
#     zplug "plugins/brew",     from:oh-my-zsh, if:"which brew"
# fi
#
# zplug "bhilburn/powerlevel9k", use:powerlevel9k.zsh-theme
# zplug "plugins/git", from:oh-my-zsh
# zplug "plugins/colorize", from:oh-my-zsh
# zplug "seebi/dircolors-solarized", ignore:"*", as:plugin
# zplug "agkozak/agkozak-zsh-theme"
#
# Docker completion
# zplug "felixr/docker-zsh-completion"
#
# zplug load

# Plugins
plugins=(
  git
)

# ----------------------------- Oh My Zsh ---------------------------------------
export ZSH=$HOME/.oh-my-zsh
ZSH_THEME="powerlevel9k/powerlevel9k"
source $ZSH/custom/themes/powerlevel9k.customizations

DEFAULT_USER="martin"


ENABLE_CORRECTION="true"

source $ZSH/oh-my-zsh.sh

# -------------- User configuration -----------------------
# ssh
# export SSH_KEY_PATH="~/.ssh/id_ed25519"

## ALIASES
alias server="python -m SimpleHTTPServer"
alias jpn='jupyter notebook'
alias subl="/Applications/Sublime\ Text.app/Contents/SharedSupport/bin/subl"
export DOCKER="$HOME/Library/Containers/com.docker.docker/Data/com.docker.driver.amd64-linux"
alias vim='nvim'

. $HOME/.bash_profile_venv
