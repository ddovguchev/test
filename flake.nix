{
  description = "NixOS 25.11 Configuration";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    home-manager = {
      url = "github:nix-community/home-manager/release-25.11";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, home-manager, flake-utils, ... }:
  let
    system = "x86_64-linux";
    pkgs = import nixpkgs { inherit system; config.allowUnfree = true; };
  in
  {
    nixosConfigurations.nixos = nixpkgs.lib.nixosSystem {
      inherit system;
      modules = [
        ./hardware-configuration.nix
        ./modules/boot.nix
        ./modules/networking.nix
        ./modules/users.nix
        ./modules/keyboard.nix
        ./modules/nvidia.nix
        ./modules/hyprland.nix
        ./modules/audio.nix
        ./modules/packages.nix
        ./example/SilentSDDM/nix/module.nix
        home-manager.nixosModules.home-manager
        ({ config, pkgs, ... }: {
          system.stateVersion = "25.11";
          nixpkgs.config.allowUnfree = true;
          time.timeZone = "Europe/Minsk";
          programs.silentSDDM = {
            enable = true;
            theme = "rei";
          };
          home-manager.useGlobalPkgs = true;
          home-manager.useUserPackages = true;
          home-manager.backupFileExtension = "bak";
          home-manager.users.hikari = { pkgs, ... }: {
            home.stateVersion = "25.11";
            programs.home-manager.enable = true;
            imports = [ ./home-manager/home-manager.nix ];
          };
        })
      ];
    };
  } // flake-utils.lib.eachDefaultSystem (system:
  let
    pkgs = import nixpkgs { inherit system; config.allowUnfree = true; };
  in
  {
    formatter = pkgs.nixpkgs-fmt;
    devShells.default = pkgs.mkShell {
      buildInputs = with pkgs; [ nixpkgs-fmt statix deadnix git ];
      shellHook = "echo 'nix fmt | statix check . | deadnix .'";
    };
  });
}
