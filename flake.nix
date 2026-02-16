{
  description = "NixOS 25.11";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    home-manager = {
      url = "github:nix-community/home-manager/release-25.11";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, home-manager, ... }:
  let
    system = "x86_64-linux";
  in {
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
        home-manager.nixosModules.home-manager

        ({ config, pkgs, ... }: {

          system.stateVersion = "25.11";
          nixpkgs.config.allowUnfree = true;

          time.timeZone = "Europe/Minsk";

          home-manager.useGlobalPkgs = true;
          home-manager.useUserPackages = true;
          home-manager.backupFileExtension = "bak";

          home-manager.users.hikari = { pkgs, ... }: {
            home.stateVersion = "25.11";
            programs.home-manager.enable = true;
            imports = [ 
              ./home-manager/home-manager.nix
            ];
          };
        })
      ];
    };
  };
}
