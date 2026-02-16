#!/usr/bin/env bash

WALL_PATH="$1"
TITLE="WALLPAPERS"

# Open a file picker dialog with a filter for PNG and JPG files
files=$(zenity --file-selection --multiple --separator=":" \
    --file-filter="Images (PNG, JPG) | *.png *.jpg" \
    --title="Select Images")

# Check if files were selected
if [ -z "$files" ]; then
    notify-send "No files selected."
    exit 1
fi

if [ ! -d "$WALL_PATH" ]; then
    mkdir -p "$WALL_PATH"
fi

# Process each selected file
IFS=":" # Set the internal field separator to :

notify-send $TITLE "Adding selected wallpapers..."

for file_path in $files; do
    filename=$(basename ${file_path})
    ext="${filename##*.}"
    filename="${filename%.*}"

    file_to_save="$WALL_PATH/${filename}.${ext}"

    if [ -f $file_to_save ]; then
        notify-send $TITLE "Wallpaper ${filename} already exists"
    else
        magick convert -resize 640x360 \
            "$file_path" $file_to_save &&
            echo "$filename.$ext:$file_path" >>$WALL_PATH/log.txt &&
            echo $file_to_save
    fi
done
