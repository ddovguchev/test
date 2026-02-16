{
  description = "NixOS 25.11 Configuration";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    home-manager = {
      url = "github:nix-community/home-manager/release-25.11";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    flake-utils.url = "github:numtide/flake-utils";
    astal.url = "github:aylur/astal";
    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.astal.follows = "astal";
    };
  };

  outputs = { self, nixpkgs, home-manager, flake-utils, ... }:
  let
    system = "x86_64-linux";
    pkgs = import nixpkgs {
      inherit system;
      config.allowUnfree = true;
    };
  in
  {
    nixosConfigurations.nixos = nixpkgs.lib.nixosSystem {
      inherit system;
      specialArgs = { inherit self; };

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
          home-manager.extraSpecialArgs = { inputs = self.inputs; };

          home-manager.users.hikari = { pkgs, config, inputs, ... }: {
            home.stateVersion = "25.11";
            programs.home-manager.enable = true;
            imports = [ 
              ./home-manager/home-manager.nix
            ];
          };
        })
      ];
    };
  } // flake-utils.lib.eachDefaultSystem (system: 
    let
      pkgs = import nixpkgs {
        inherit system;
        config.allowUnfree = true;
      };
    in
    {
      # Formatter for nix files
      formatter = pkgs.nixpkgs-fmt;

      # Development shell
      devShells.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          nixpkgs-fmt
          statix
          deadnix
          git
        ];

        shellHook = ''
          echo "🔧 NixOS Configuration Development Environment"
          echo "Available tools: nixpkgs-fmt, statix, deadnix"
          echo ""
          echo "Format all nix files: nix fmt"
          echo "Check for issues: statix check ."
          echo "Find unused code: deadnix ."
        '';
      };
    }
  );
}
