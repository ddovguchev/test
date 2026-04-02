ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
FLAKE := $(ROOT)
HOST := crystal
USER := hikari

PROFILES := $(shell grep -E '^  [a-zA-Z0-9_-]+ = \{' '$(FLAKE)/profiles/default.nix' | sed 's/^  \([^ ]*\).*/\1/')

.PHONY: help apply switch home clean gc refresh profiles

help:
	@echo "NixOS + профили (tuigreet при входе)"
	@echo ""
	@echo "  make switch | apply       — sudo nixos-rebuild switch; без PROFILE — меню выбора (подсказка для tuigreet)"
	@echo "  make switch PROFILE=niri-wez   — без меню; напомнит, какую сессию выбрать после логина"
	@echo "  make profiles           — перечислить id профилей"
	@echo "  make home               — home-manager switch --flake (если HM не из NixOS)"
	@echo "  make clean | gc         — nix-collect-garbage -d и nix-store --optimise"
	@echo "  make refresh            — switch, затем clean"

profiles:
	@echo "Профили (сессии в tuigreet после входа):"
	@for p in $(PROFILES); do printf '  %s\n' "$$p"; done

# Подсказка: образ системы один на все профили; PROFILE только напоминает, что выбрать в tuigreet.
apply switch:
	@FLAKE='$(FLAKE)' HOST='$(HOST)' PROFILE='$(PROFILE)' PROFILES_ROWS='$(PROFILES)' bash -euo pipefail -c '\
		read -r -a arr <<< "$$PROFILES_ROWS"; \
		p="$$PROFILE"; \
		if [[ -z "$$p" && $${#arr[@]} -gt 0 ]]; then \
		  echo "Выбери профиль (напоминание для tuigreet после входа):"; \
		  PS3=">>> "; \
		  select x in "$${arr[@]}" "пропустить"; do \
		    [[ "$$x" == "пропустить" ]] && p="" && break; \
		    p="$$x"; \
		    break; \
		  done; \
		fi; \
		if [[ -n "$$p" ]]; then \
		  echo ""; \
		  echo "После логина в tuigreet выбери сессию профиля: $$p"; \
		  echo ""; \
		fi; \
		exec sudo nixos-rebuild switch --flake "$$FLAKE#$$HOST" \
		'

home:
	home-manager switch --flake '$(FLAKE)#$(USER)'

clean gc:
	sudo nix-collect-garbage -d
	sudo nix-store --optimise

refresh: apply clean
