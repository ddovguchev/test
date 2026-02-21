{ config, pkgs, ... }:

{
  programs.ranger = {
    enable = true;

    settings = {
      preview_images = true;
      use_preview_script = true;
    };
  };

  environment.etc."ranger/scope.sh".text = ''
    #!/usr/bin/env bash

    FILE="$1"
    EXT="${FILE##*.}"

    case "$EXT" in
      pdf)
        pdftoppm -jpeg -f 1 -singlefile "$FILE" "/tmp/ranger_preview"
        echo "/tmp/ranger_preview.jpg"
        exit 0
        ;;
      jpg|jpeg|png|webp|bmp|gif)
        echo "$FILE"
        exit 0
        ;;
    esac

    exit 1
  '';
}
