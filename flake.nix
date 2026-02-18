{
  description = "NixOS 25.11 Configuration";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    home-manager = {
      url = "github:nix-community/home-manager/release-25.11";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    flake-utils.url = "github:numtide/flake-utils";
    stylix = {
      url = "github:danth/stylix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    sops-nix = {
      url = "github:Mic92/sops-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    nixvim = {
      url = "github:nix-community/nixvim";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    astal = {
      url = "github:Aylur/astal";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    ags = {
      url = "github:Aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.astal.follows = "astal";
    };
    zen-browser = {
      url = "github:0xc000022070/zen-browser-flake";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    winapps = {
      url = "github:winapps-org/winapps";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = { self, nixpkgs, home-manager, flake-utils, stylix, sops-nix, nixvim, ags, astal, zen-browser, winapps, ... }:
    let
      system = "x86_64-linux";
    in
    {
      nixosConfigurations.nixos = nixpkgs.lib.nixosSystem {
        inherit system;
        specialArgs = { inherit self astal; };
        modules = [
          stylix.nixosModules.stylix
          # sops-nix.nixosModules.sops  # Enable when secrets are configured
          ./modules/stylix-theme.nix
          ./hardware-configuration.nix
          ./modules/boot.nix
          ./modules/networking.nix
          ./modules/users.nix
          ./modules/keyboard.nix
          ./modules/nvidia.nix
          ./modules/hyprland.nix
          ./modules/audio.nix
          ./modules/packages.nix
          ./modules/gaming/steam.nix
          ./modules/gaming/nethack.nix
          home-manager.nixosModules.home-manager
          ({ config, pkgs, self, astal, ... }: {
            system.stateVersion = "25.11";
            nixpkgs.config.allowUnfree = true;
            nixpkgs.overlays = [
              (final: prev: { astal = astal.packages.${final.system}; })
            ];
            time.timeZone = "Europe/Minsk";
            home-manager.useGlobalPkgs = true;
            home-manager.useUserPackages = true;
            home-manager.backupFileExtension = "bak";
            home-manager.extraSpecialArgs = {
              inherit self;
              inputs = { inherit stylix sops-nix nixvim ags zen-browser winapps; };
              settings = import ./home-manager/settings.nix { inherit pkgs; };
            };
            home-manager.users.hikari = { pkgs, config, inputs, settings, ... }: {
              home.stateVersion = "25.11";
              programs.home-manager.enable = true;
              imports = [
                ./home-manager/home-manager.nix
                inputs.zen-browser.homeModules.twilight
                inputs.nixvim.homeModules.nixvim
              ];
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
