# Запускать из корня репозитория (или с -f /path/to/crystal/Makefile).
ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
FLAKE := $(ROOT)
HOST := crystal
USER := hikari

.PHONY: help apply switch home clean gc refresh

help:
	@echo "Targets:"
	@echo "  make apply | switch   — sudo nixos-rebuild switch --flake $(FLAKE)#$(HOST)"
	@echo "  make home             — home-manager switch --flake $(FLAKE)#$(USER) (если HM не в NixOS)"
	@echo "  make clean | gc       — полная сборка мусора Nix (все старые поколения + optimise)"
	@echo "  make refresh          — apply, затем clean"

apply switch:
	sudo nixos-rebuild switch --flake '$(FLAKE)#$(HOST)'

home:
	home-manager switch --flake '$(FLAKE)#$(USER)'

clean gc:
	sudo nix-collect-garbage -d
	sudo nix-store --optimise

refresh: apply clean
