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
    };
    initContent = ''
      setopt PROMPT_SUBST
      PROMPT='%F{blue}%n@%m%f:%F{green}%~%f$ '
    '';
  };
}
