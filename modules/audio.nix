{ config, pkgs, ... }:
{
  services.pipewire.enable = true;
  services.pipewire.pulse.enable = true;
  security.rtkit.enable = true;
}
