{
  description = "NixOS + Home Manager: niri/dwm + session profiles (crystal)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    home-manager = {
      url = "github:nix-community/home-manager";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    nur.url = "github:nix-community/NUR/main";
    darkmatter.url = "gitlab:VandalByte/darkmatter-grub-theme";
  };

  outputs = { self, nixpkgs, ... } @ inputs:
    let
      inherit (self) outputs;
      system = "x86_64-linux";
      forAllSystems = nixpkgs.lib.genAttrs [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
    in
    {
      overlays = import ./overlays { inherit inputs; };

      devShells = forAllSystems (
        sys:
        let
          pkgs = nixpkgs.legacyPackages.${sys};
        in
        {
          default = pkgs.mkShellNoCC { packages = with pkgs; [ gnumake ]; };
        }
      );

      nixosConfigurations.crystal = nixpkgs.lib.nixosSystem {
        specialArgs = { inherit inputs outputs; };
        modules = [
          inputs.home-manager.nixosModules.home-manager
          inputs.darkmatter.nixosModule
          ./hosts/crystal/configuration.nix
        ];
      };

      homeConfigurations.hikari = inputs.home-manager.lib.homeManagerConfiguration {
        pkgs = nixpkgs.legacyPackages.${system};
        extraSpecialArgs = {
          inherit inputs outputs;
          profiles = import ./profiles {
            lib = nixpkgs.lib;
            pkgs = nixpkgs.legacyPackages.${system};
          };
        };
        modules = [ ./home/hikari/home.nix ];
      };
    };
}
