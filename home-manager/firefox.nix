{ config, ... }:
{
  stylix.targets.firefox.profileNames = [ "hikari" ];

  programs.firefox = {
    enable = true;
    profiles.hikari = {
      id = 0;
      isDefault = true;
      settings = {
        "browser.startup.homepage" = "https://duckduckgo.com";
        "browser.search.suggest.enabled" = true;
        "toolkit.legacyUserProfileCustomizations.stylesheets" = true;
        "privacy.trackingprotection.enabled" = true;
        "privacy.donottrackheader.enabled" = true;
      };
    };
    policies = {
      DisableTelemetry = true;
      DisableFirefoxStudies = true;
      DisablePocket = true;
    };
  };
}
