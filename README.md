# 🎮 Blast Puzzle Game

Полнофункциональная Blast головоломка на TypeScript + Cocos Creator 2.4.15 с чистой архитектурой и современными подходами разработки.

## 🎮 Игровые механики

**Основные:**
- **Blast механика** - клик по группе связанных тайлов (≥2) удаляет их
- **Физика падения** - тайлы падают вниз, новые появляются сверху
- **Система очков** - 10 очков за тайл + бонусы за большие группы и супертайлы
- **Ограничение ходов** - цель набрать target score за N ходов

**Дополнительные:**
- **Супертайлы** (≥5 тайлов): Линия, Столбец, Бомба, Мегабомба
- **Бустеры**: Бомба, Телепорт
- **Автоперемешивание** - до 3 раз при отсутствии ходов

## 🏗️ Архитектура

**Принципы:** MVC, SOLID, Event-Driven, Dependency Injection

**Ключевые компоненты:**
- `GameController` - центральный игровой контроллер
- `EventBus` - система событий для слабой связанности  
- `ServiceContainer` - DI контейнер для управления зависимостями

**Применяемые паттерны:**
- **Singleton**: `EventBus`, `TileFactory`, `GameConfig`, `GameServiceContainer` - единственный экземпляр для критичных сервисов
- **Factory**: `TileFactory` - создание различных типов тайлов (обычные, супертайлы)
- **Strategy**: `BoosterManager` + `IBoosterStrategy` - различные стратегии бустеров (BombBoosterStrategy, SwapBoosterStrategy)
- **Dependency Injection**: `ServiceContainer` - управление зависимостями и жизненным циклом объектов

```
assets/Scripts/
├── core/           # GameController, UIController, EventBus
├── game/           # Игровая логика (models, managers, services)
├── ui/             # UI компоненты и views
├── shared/         # Типы, конфигурация, утилиты
└── tests/          # Unit тесты
```

## 🧪 Тестирование

### Автотестирование (Jest)
```bash
npm test                    # Запуск всех тестов
npm run test:watch          # Режим отслеживания изменений  
npm run test:coverage       # Тесты с отчетом покрытия
```

**Покрытие тестами:**
- ✅ `GameBoard.test.ts` - механики игрового поля, группировка тайлов
- ✅ `SuperTiles.test.ts` - логика создания и активации супертайлов

### Консольные команды (DevConsole)
После запуска игры доступны команды в консоли браузера:

**Управление полем:**
```javascript
testSmallField()            // Поле 6x6
testBigField()              // Поле 10x10
printBoard()                // Визуализация доски в консоли
printBoardStats()           // Статистика тайлов на доске
```

**Бустеры:**
```javascript  
addBombs(5)                // Добавить 5 бомб
addSwaps(3)                // Добавить 3 телепорта
```

**Игровое состояние:**
```javascript
testWin()                  // Мгновенная победа
testLose()                 // Мгновенное поражение  
addScore(500)              // Добавить очки
setMoves(20)               // Установить количество ходов
showStats()                // Показать подробную статистику
```

**Утилиты:**
```javascript
restartGame()              // Перезапуск игры
testToastSuccess()         // Тест уведомлений
clearToasts()              // Очистить все уведомления
```


