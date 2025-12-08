# Cтратегический план расширения Ownima Pro на новые бизнес-домены

Этот документ описывает стратегию и дорожную карту для трансформации платформы **Ownima Pro** из специализированного решения для аренды транспорта в универсальную, мультидоменную платформу для управления бронированиями.

---

### 1) Анализ текущего домена

#### Ядро Vehicle-домена
На основе анализа `ARCHITECTURE.md` и `reservation.proto`, ядро текущей системы определено следующими компонентами:
- **Сущности:** `Reservation` (центральная сущность), `Vehicle`, `Rider`, `Invoice`, `Confirmation`, `PickUp`, `DropOff`.
- **Процессы:** Жизненный цикл `Reservation` управляет всем: от подтверждения (`Confirmation`) до использования ресурса (`PickUp`/`DropOff`) и биллинга (`Invoice`). Статусная модель (`ReservationStatus`) содержит 13 состояний, тесно связанных с логикой аренды транспорта (например, `RESERVATION_OVERDUE`, `RESERVATION_COLLECTED`).
- **Зависимости:** `Vehicle` является "ресурсом", `Rider` - "клиентом". `Chat` и `Timeline` (Scheduler) строятся вокруг `Reservation`.

#### Ключевые UI/UX концепты для переиспользования
- **Scheduler/Gantt View:** Отличная основа для универсального таймлайна ресурсов.
- **Chat:** Эффективный инструмент коммуникации, привязанный к сделке.
- **AI Smart Import & Intent Analysis:** Мощный инструмент, который можно адаптировать для парсинга любых текстовых запросов.
- **Digital Signatures, PWA/Offline mode, IndexedDB:** Технологические ассеты, не зависящие от домена.

#### Ограничения архитектуры
1.  **Жесткая связь с Protobuf-схемой:** Frontend-логика, хуки (`useLease`) и сторы (`chatStore`) напрямую зависят от структуры `Reservation`. Поля `vehicle_id`, `rider`, `mileage`, `fuel_level` пронизывают все приложение.
2.  **Сложная бизнес-логика в статусах:** `ReservationStatus` невозможно напрямую перенести в другие домены.
3.  **Frontend-heavy Logic:** Большая часть бизнес-логики реализована на клиенте, что делает ее негибкой и сложной для рефакторинга.

---

### 2) Выбор и оценка нового бизнес-домена

Анализ совместимости с текущей архитектурой:

| Домен | Совместимость | Что переиспользуется | Что требует адаптации | Основные вызовы |
| :--- | :--- | :--- | :--- | :--- |
| **Equipment Rental** | **Высокая** | Практически все | Минимальные изменения моделей (`Vehicle` -> `Equipment`) | Нет |
| **Property/Room Booking** | **Высокая** | Scheduler, Chat, Invoice | `Lease` -> `Booking Agreement`, модель ресурса | Ценообразование, правила бронирования |
| **Service/Appointment Scheduling**| **Средняя** | Scheduler, Chat | `Lease` -> `Appointment`, `Vehicle` -> `Provider/Slot` | Разная длительность услуг, рекуррентные события |
| **Logistics & Dispatching** | **Низкая** | Chat, Timeline | Фундаментальная переработка `Reservation` -> `Dispatch Order` | Маршрутизация, real-time tracking |

**Вывод:** **Equipment Rental** и **Property/Room Booking** являются идеальными первыми кандидатами для расширения. Они требуют наименьших изменений и позволяют проверить новую архитектуру с минимальными рисками.

---

### 3) Стратегия доменного мёржа / мультидоменности

Мы будем использовать **Unified Core Model** на фронтенде с **Domain Adapter Layer** для связи с бэкендом. Это позволит фронтенду работать с идеальной, доменно-агностической моделью, в то время как адаптеры будут транслировать специфичные бэкенд-модели (как `Reservation`) в эту общую структуру.

#### Unified Core Frontend Model
-   `IResource`: `{ id, type, name, ownerId, metadata: Record<string, any> }`
-   `IBooking`: `{ id, resourceId, clientId, status, dateFrom, dateTo, totalPrice, currency, ... }`
-   `IClient`: `{ id, name, contact: { phone?, email? } }`
-   `GenericStatus`: `PENDING | CONFIRMED | ACTIVE | COMPLETED | CANCELLED`

#### Domain Adapter Layer (Anti-Corruption Layer)
-   **Назначение:** Изолировать ядро приложения от специфики бэкенда.
-   **Реализация:** Набор функций-мапперов.
    -   `mapReservationToBooking(reservation: Reservation): IBooking`
    -   `mapVehicleToResource(vehicle: Vehicle): IResource`
    -   `mapReservationStatusToGenericStatus(status: ReservationStatus): GenericStatus`
-   Этот слой становится единственным местом в коде, которое "знает" о существовании `Reservation.proto`.

#### Расширяемые элементы (UI и Логика)
-   **Scheduler:** Будет работать с `IBooking[]` и `IResource[]`.
-   **Forms:** Будет создан `GenericBookingForm`, который рендерит поля на основе JSON-конфигурации домена.
-   **Chat:** Будет привязан к `IBooking.id`.

---

### 4) План миграции и расширения

1.  **Phase 1: Domain Abstraction & Core Model** (1-2 недели)
    *   Создать `src/core/models/` и определить интерфейсы `IBooking`, `IResource`, `IClient`.
2.  **Phase 2: Implement the Adapter Layer** (2-3 недели)
    *   Создать `src/domains/vehicle/adapters/reservationAdapter.ts` с функциями-мапперами.
    *   Модифицировать API-сервисы (`ownimaApi.ts`) для вызова адаптера. Теперь они должны возвращать `IBooking`.
3.  **Phase 3: Refactor Core Components** (3-4 недели)
    *   Рефакторинг `SchedulePage` и `ChatLayout` для работы с `IBooking` и `IResource`.
4.  **Phase 4: Decouple Domain-Specific UI** (2-3 недели)
    *   Переместить `LeaseForm`, `LeasePreview` в `src/domains/vehicle/components/`.
    *   Создать систему динамического рендеринга форм в `EditorPage` в зависимости от `IBooking.resource.type`.
5.  **Phase 5: Abstract State Management (Zustand)** (1-2 недели)
    *   Разделить `chatStore` на `bookingStore`, `resourceStore`, `uiStore`.
6.  **Phase 6: Pilot New Domain (Equipment Rental)** (3-4 недели)
    *   Создать `src/domains/equipment/` с адаптером, конфигурацией и специфичными UI-компонентами.
    *   Добавить новый домен в роутинг.
7.  **Phase 7: Testing & Rollout** (2 недели)
    *   Написать e2e тесты для обоих доменов.

---

### 5) Технические рекомендации

-   **Архитектурные паттерны:** **Feature-Sliced Design (FSD)** идеально подходит для такой структуры. Проект будет разделен на `src/shared`, `src/core` (доменно-агностическое ядро), и `src/domains` (модули для `vehicle`, `equipment` и т.д.).
-   **Абстракция API:** Паттерн **Adapter** (Anti-Corruption Layer) является ключевым.
-   **Zustand Store Decomposition:** Разделение сторов по бизнес-сущностям (`bookings`, `resources`), а не по фичам (`chat`).
-   **Улучшение AI-интеграции:** AI-модель должна получать на вход `IBooking` и конфигурацию текущего домена для контекстно-зависимого парсинга.
-   **Оптимизация Timeline/Gantt:** Использовать виртуализацию (`react-window` или `tanstack-virtual`) для производительного рендеринга тысяч записей.

---

### 6) Финальный “Master Plan”

-   **Целевая архитектура:** Frontend Modular Monolith на базе FSD. Ядро работает на доменно-агностической модели (`IBooking`), а доменные модули предоставляют адаптеры, конфигурации и UI.
-   **Workflow-диаграмма:**
    ```mermaid
    graph TD
        subgraph Frontend
            UI[React Components] --> CoreHooks[Core Hooks]
            CoreHooks --> Stores["Zustand Stores (IBooking)"]
            CoreHooks --> Adapter[Domain Adapter Layer]
        end
        subgraph Backend
            API[API Endpoint] --> Proto[Proto: Reservation]
        end
        Adapter --> API
        API --> Adapter
    ```
-   **Чеклист готовности нового домена:**
    -   [ ] Создан доменный модуль (`src/domains/new-domain`).
    -   [ ] Реализован `NewDomainAdapter`.
    -   [ ] Создана конфигурация UI для форм.
    -   [ ] Домен зарегистрирован в роутинге.
    -   [ ] Проведены e2e тесты.
-   **Долгосрочная эволюция:** Данная архитектура является подготовительным шагом к возможному переходу на **микрофронтенды**, где каждый домен может быть вынесен в отдельный remote-модуль.
