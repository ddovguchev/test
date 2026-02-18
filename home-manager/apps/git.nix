{ config, pkgs, ... }:

{
  programs.git = {
    enable = true;
    settings = {
      url = {
        "git@github.com:tarantool" = {
          insteadOf = "https://github.com/tarantool";
        };
      };
      core.editor = "nvim";
      user = {
        name = "Hikari";
        email = "hikari@local";
      };
      stash = {
        showPatch = true;
      };
    };
  };

  programs.lazygit = {
    enable = true;
  };
}
