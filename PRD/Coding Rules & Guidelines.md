# Coding Rules & Guidelines

## 1. Architectural Principles
* **Design Pattern**: [예: Domain-Driven Design (DDD) Lite, Modular Monolith]
* **Directory Strategy**: 기능 단위 응집도(Cohesion)를 높이고 결합도(Coupling)를 낮추는 방향으로 구성.

## 2. Folder Structure (Tree View)
```
src/
├── app/                  # App initialization & Configuration
├── shared/               # Shared Utilities & Libraries
│   ├── utils/            # Generic Utilities (lodash wrappers, etc.)
│   └── types/            # Global Types
├── features/             # Business Features
│   ├── [FeatureName]/    # Feature specific modules
│   │   ├── services/     # Business Logic
│   │   ├── models/       # Data Models
│   │   └── utils/        # Feature specific utils
│   └── index.ts          # Public API of the feature
└── index.ts              # Entry Point
```

## 3. Naming Conventions (**Strict**)
* **Files**: `kebab-case` (예: `user-service.ts`)
* **Classes**: `PascalCase` (예: `UserService`)
* **Variables/Functions**: `camelCase` (예: `getUserById`)
* **Constants**: `UPPER_SNAKE_CASE` (예: `MAX_RETRY_COUNT`)
* **Interfaces/Types**: `PascalCase` (예: `User`, `UserConfig`)

## 4. Coding Standards
* **Type Safety**:
    *   `no-explicit-any` 규칙 준수. 불가피한 경우 `unknown` 사용 후 Type Narrowing.
    *   함수 반환 타입 명시 권장.
* **Error Handling**:
    *   Custom Error Class 사용 권장.
    *   Async 함수는 반드시 `try-catch` 또는 상위 레벨 에러 헨들링 위임.
* **Logging**:
    *   `console.log` 대신 로거 라이브러리 사용 권장 (프로덕션 환경).
* **Date/Time**:
    *   반드시 `luxon` 라이브러리를 사용하여 처리. Native `Date` 객체 직접 조작 지양.
