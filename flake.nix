{
  description = "NixOS + Home Manager: dwm (crystal host)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    home-manager = {
      url = "github:nix-community/home-manager";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    nur.url = "github:nix-community/NUR";
    darkmatter.url = "gitlab:VandalByte/darkmatter-grub-theme";
  };

  outputs = { self, nixpkgs, ... } @ inputs:
    let
      inherit (self) outputs;
      system = "x86_64-linux";
    in
    {
      overlays = import ./overlays { inherit inputs; };

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
        extraSpecialArgs = { inherit inputs outputs; };
        modules = [ ./home/hikari/home.nix ];
      };
    };
}
