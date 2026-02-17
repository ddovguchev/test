{ config, pkgs, ... }:
{
  programs.zsh = {
    enable = true;
    autosuggestion.enable = true;
    syntaxHighlighting.enable = true;
    history = {
      size = 10000;
      path = "${config.xdg.dataHome}/zsh/history";
      ignoreDups = true;
      ignoreSpace = true;
    };
    shellAliases = {
      ll = "ls -la";
      rebuild = "~/nixos-flake/rebuild.sh";
      discord = "vesktop --enable-features=UseOzonePlatform,WebRTCPipeWireCapturer --ozone-platform=wayland";
    };
    initContent = ''
      setopt PROMPT_SUBST
      setopt HIST_IGNORE_ALL_DUPS
      setopt HIST_SAVE_NO_DUPS
      setopt HIST_EXPIRE_DUPS_FIRST
      PROMPT='%F{blue}%n@%m%f:%F{green}%~%f$ '
      ___MY_VMOPTIONS_SHELL_FILE="''${HOME}/.jetbrains.vmoptions.sh"; if [ -f "''${___MY_VMOPTIONS_SHELL_FILE}" ]; then . "''${___MY_VMOPTIONS_SHELL_FILE}"; fi
    '';
  };
}
