#!/usr/bin/env bash

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔧 Настройка управления вентиляторами${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if commands are available
if ! command -v sensors-detect &> /dev/null; then
    echo -e "${RED}❌ Ошибка: sensors-detect не найден${NC}"
    echo -e "${YELLOW}💡 Сначала пересоберите систему:${NC}"
    echo "   cd ~/nixos-flake"
    echo "   sudo nixos-rebuild switch --flake '.#nixos'"
    exit 1
fi

if ! command -v pwmconfig &> /dev/null; then
    echo -e "${RED}❌ Ошибка: pwmconfig не найден${NC}"
    echo -e "${YELLOW}💡 Сначала пересоберите систему:${NC}"
    echo "   cd ~/nixos-flake"
    echo "   sudo nixos-rebuild switch --flake '.#nixos'"
    exit 1
fi

echo -e "${BLUE}Шаг 1: Обнаружение датчиков...${NC}"
echo -e "${YELLOW}Запускаю sensors-detect в автоматическом режиме...${NC}"
echo ""

# Run sensors-detect in auto mode (answers yes to all questions)
if sudo sensors-detect --auto; then
    echo -e "${GREEN}✅ Датчики обнаружены${NC}"
else
    echo -e "${RED}❌ Ошибка при обнаружении датчиков${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Шаг 2: Настройка управления вентиляторами...${NC}"
echo -e "${YELLOW}Запускаю pwmconfig (интерактивная настройка)...${NC}"
echo -e "${YELLOW}Следуйте инструкциям на экране${NC}"
echo ""

# Run pwmconfig (interactive)
if sudo pwmconfig; then
    echo -e "${GREEN}✅ Конфигурация вентиляторов создана${NC}"
else
    echo -e "${RED}❌ Ошибка при настройке вентиляторов${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Шаг 3: Включение сервиса fancontrol...${NC}"

# Enable and start fancontrol service
if sudo systemctl enable --now fancontrol; then
    echo -e "${GREEN}✅ Сервис fancontrol включен и запущен${NC}"
else
    echo -e "${YELLOW}⚠️  Не удалось включить сервис (возможно, конфигурация не создана)${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Настройка завершена!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Проверка статуса:${NC}"
echo "  sudo systemctl status fancontrol"
echo ""
echo -e "${BLUE}Просмотр датчиков:${NC}"
echo "  sensors"
echo ""
