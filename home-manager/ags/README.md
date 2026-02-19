# AGS (Aylur's GTK Shell) Config

## Применение изменений navbar/Bar

Конфиг AGS собирается Nix и копируется в `~/.config/ags`. Чтобы изменения в `config/widget/Bar.tsx` вступили в силу:

1. **Пересоберите конфигурацию** (из корня flake):
   ```bash
   sudo nixos-rebuild switch --flake .
   ```
   или если используете только home-manager:
   ```bash
   home-manager switch --flake .
   ```

2. **Перезапустите AGS**:
   ```bash
   systemctl --user restart ags.service
   ```
   или используйте скрипт:
   ```bash
   ags-rebuild
   ```

## Режим разработки

При редактировании `config/widget/Bar.tsx` или других файлов — после каждого изменения нужна пересборка и перезапуск AGS.
