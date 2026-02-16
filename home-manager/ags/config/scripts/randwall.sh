#!/usr/bin/env bash

DIR="$1"

files=$(find "$DIR" -type f \( -iname "*.jpg" -o -iname \
    "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \))

random_file=$(echo "$files" | shuf -n 1)

swww img "$random_file" \
    --transition-fps 60 \
    --transition-duration 2 \
    --transition-type left \
    --transition-bezier 0.25,1,0.5,1
