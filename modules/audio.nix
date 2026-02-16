{ config, pkgs, lib, ... }:
{
  # PipeWire for audio (modern replacement for PulseAudio/ALSA)
  services.pipewire = {
    enable = lib.mkDefault true;
    # PulseAudio compatibility layer
    pulse.enable = lib.mkDefault true;
    # ALSA support
    alsa.enable = lib.mkDefault true;
    # JACK support (for professional audio)
    jack.enable = lib.mkDefault false;
  };
  
  # RealtimeKit for low-latency audio
  security.rtkit.enable = lib.mkDefault true;
  
  # Optional: Disable PulseAudio (if using PipeWire)
  hardware.pulseaudio.enable = lib.mkDefault false;
}
