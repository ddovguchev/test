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
    pkgs = import nixpkgs {
      inherit system;
      config.allowUnfree = true;
    };
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
        home-manager.nixosModules.home-manager

        # Overlay: fix ags_1 for GIRepository 2.0 (prepend_search_path -> dup_default())
        { nixpkgs.overlays = [ (import ./overlays/ags-fix.nix) ]; }

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
