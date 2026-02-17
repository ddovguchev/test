{ ... }:
{
  programs.firefox = {
    enable = true;
    profiles.hikari = {
      id = 0;
      isDefault = true;
      path = "hikari";
      settings = {
        "browser.startup.homepage" = "https://www.google.com";
        "browser.search.suggest.enabled" = true;
        "browser.search.defaultenginename" = "Google";
        "browser.search.defaultenginename.private" = "Google";
        "browser.urlbar.placeholderName" = "Google";
        "ui.systemUsesDarkTheme" = 1;
        "layout.css.prefers-color-scheme.content-override" = 0;
        "browser.theme.toolbar-theme" = 0;
        "browser.theme.content-theme" = 0;
        "browser.in-content.dark-mode" = true;
        "toolkit.legacyUserProfileCustomizations.stylesheets" = true;
        "privacy.trackingprotection.enabled" = true;
        "privacy.donottrackheader.enabled" = true;
        "gfx.webrender.all" = true;
        "widget.dmabuf.force-enabled" = false;
        "media.ffmpeg.vaapi.enabled" = true;
        "media.hardware-video-decoding.force-enabled" = true;
        "media.getdisplaymedia.enabled" = true;
        "media.getusermedia.screensharing.enabled" = true;
        "media.webrtc.capture.allow-pipewire" = true;
        "media.webrtc.platformencoder" = true;
        "media.webrtc.hw.h264.enabled" = true;
        "media.peerconnection.video.h264_enabled" = true;
        "media.peerconnection.ice.default_address_only" = false;
      };
    };
    policies = {
      DisableTelemetry = true;
      DisableFirefoxStudies = true;
      DisablePocket = true;
      ExtensionSettings = {
        "{8a65567e-d1bc-4494-a266-b3d300c106f8}" = {
          installation_mode = "force_installed";
          install_url = "https://addons.mozilla.org/firefox/downloads/file/4352827/arcfox-2.5.3.xpi";
        };
      };
    };
  };

  home.file.".mozilla/firefox/hikari/chrome/userChrome.css".source =
    ./config/arcfox-userChrome.css;
}
