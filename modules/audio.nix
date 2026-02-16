{ config, pkgs, lib, ... }:
{
  # PipeWire for audio (modern replacement for PulseAudio/ALSA)
  # When PipeWire is enabled, PulseAudio is automatically disabled
  services.pipewire = {
    enable = lib.mkDefault true;
    # PulseAudio compatibility layer (provides pulseaudio API)
    pulse.enable = lib.mkDefault true;
    # ALSA support
    alsa.enable = lib.mkDefault true;
    # JACK support (for professional audio)
    jack.enable = lib.mkDefault false;
  };
  
  # RealtimeKit for low-latency audio
  security.rtkit.enable = lib.mkDefault true;
  
  # PulseAudio is automatically disabled when PipeWire is enabled
  # No need to explicitly set services.pulseaudio.enable = false
}
