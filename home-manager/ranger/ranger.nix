{ config, pkgs, ... }:
{
  programs.ranger = {
    enable = true;
    settings = {
      defaultEditor = "vim";
    };
  };
}
