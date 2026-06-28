# diceroll-v3 업그레이드 설계

## 목표

`discord-diceroll-v6`가 사용하는 `@nihilapp/diceroll-v3` 최신 동작 기준에 맞춰 봇 내부 로직과 도움말을 전면 정렬한다.

이번 개편의 목표는 다음과 같다.

- 슬래시 명령 구조(`/프리셋`, `/페이트`, `/주사위`)는 유지한다.
- 실제 주사위 해석과 결과 의미는 `@nihilapp/diceroll-v3@3.0.4`와 동일하게 맞춘다.
- 제거된 구문은 봇에서도 제거하고, 라이브러리와 동일하게 오류 처리한다.
- 결과 출력은 현재처럼 임베드 기반으로 유지하되, 새 결과 유형까지 빠짐없이 표시한다.

## 현재 상태 요약

현재 봇은 `src/commands/preset_roll.ts`, `src/commands/fate.ts`, `src/commands/custom_roll.ts`에서 직접 `@nihilapp/diceroll-v3`를 호출한다.

특히 `custom_roll.ts`는 다음 문제를 안고 있다.

- `rollDiceExpression()`의 반환 타입을 넓게 캐스팅한 뒤 세부 필드를 수동 분기한다.
- 구버전 설명서 문구가 남아 있어 현재 라이브러리 문법과 불일치한다.
- `r`/`ro` 의미가 최신 README와 다르다.
- 새 `kind`(`explodeOnce`, `countFailure`, `deductFailures`, `subtractFailureFaces`, `marginSuccess`, `countEven`, `countOdd`)를 전혀 반영하지 않는다.
- FVTT 계열 축약 문법(`x`, `xo`, `k`, `d`, `cs`, `cf`, `df`, `sf`, `ms`, `min`, `max`, `even`, `odd`)이 도움말에 없다.

## 요구사항

### 1. 명령 구조 유지

- `/프리셋`은 숫자형 면수 선택 명령으로 유지한다.
- `/페이트`는 페이트 전용 명령으로 유지한다.
- `/주사위`는 커스텀 표현식 입력 및 설명서 노출 명령으로 유지한다.

### 2. 라이브러리 기준 동작 일치

- `rollBasic`, `rollFate`, `rollDiceExpression` 호출 방식은 최신 타입 정의에 맞춘다.
- `/주사위`는 `@nihilapp/diceroll-v3`가 지원하는 최신 문법만 안내한다.
- 제거된 `ro` 문법은 완전히 삭제한다.
- `r`는 "한 번 재굴림"이 아니라 최신 의미에 맞게 표현한다.
- `rr`, `x`, `xo`, `cs`, `cf`, `df`, `sf`, `ms`, `min`, `max`, `even`, `odd`를 도움말과 결과 처리에 반영한다.

### 3. 결과 출력 안정화

- 현재 임베드 구조인 "총합 + 상세 결과"는 유지한다.
- 각 `kind`별 필요한 핵심 정보를 누락 없이 보여준다.
- 다중 표현식 입력(`d20+5 3d6+2`)은 현재처럼 여러 임베드로 처리한다.
- 보정치 목록은 별도 필드로 유지한다.

## 설계

### A. 공용 결과 포맷 계층 도입

명령어 파일 안에서 직접 `kind`별 렌더링을 반복하지 않고, 공용 포맷터 모듈을 도입한다.

예상 역할은 다음과 같다.

- 기본 주사위 눈 표시 포맷
- `rollDiceExpression()` 결과를 임베드 필드 배열로 변환
- `rollBasic()` 결과를 임베드로 변환
- `rollFate()` 결과를 임베드로 변환
- 공통 에러 메시지 및 공통 색상/푸터 처리

이 구조를 쓰는 이유는 세 가지다.

- 신규 `kind` 대응 지점을 한 곳으로 모을 수 있다.
- `/프리셋`, `/페이트`, `/주사위` 간 출력 규칙을 일관되게 유지할 수 있다.
- 라이브러리 후속 변경 시 명령 파일 전체를 다시 뒤지지 않아도 된다.

### B. `kind`별 출력 규칙

#### 기본 계열

대상:

- `basic`
- `compound`
- `explode`
- `explodeOnce`
- `reroll`
- `rerollOnce`
- `subtractFailureFaces`
- `marginSuccess`

표시:

- 주사위 배열
- 계산 결과
- 필요 시 추가 메타데이터

추가 메타데이터:

- `subtractFailureFaces`: 실패 눈 합계
- `marginSuccess`: 목표값

#### keep/drop 계열

대상:

- `keepHighest`
- `keepLowest`
- `dropHighest`
- `dropLowest`

표시:

- 유지된 주사위
- 제외된 주사위
- 결과값

#### 성공 수 계열

대상:

- `success`
- `countFailure`
- `countEven`
- `countOdd`

표시:

- 주사위 배열
- 성공 개수 또는 카운트 결과

#### 순성공 계열

대상:

- `netSuccess`
- `deductFailures`

표시:

- 주사위 배열
- 성공 수 / 실패 수
- 최종 순계산값

#### 특수 계열

대상:

- `percentile`
- `fate`

표시:

- `percentile`: 단일 값
- `fate`: 페이트 주사위 배열과 총합

### C. 도움말 재작성

`MANUAL_FIELDS`는 최신 README 기준으로 전면 재작성한다.

포함할 항목:

- 기본 굴림
- `!!`
- `!`
- `x`, `xo`
- `kh`, `kl`
- `k`, `kl`, `d`, `dh` 축약
- `dh`, `dl`
- `r`
- `rr`
- `>`, `>=`, `=`, `<`, `<=`
- `>NfM`
- `cs`, `cf`, `df`, `sf`, `ms`
- `min`, `max`
- `even`, `odd`
- `d%`
- `dF`
- 공백 분리 다중 식

제외할 항목:

- `ro`
- 현재 라이브러리 README에 없는 구문 설명

### D. 오류 처리

- 잘못된 표현식은 현재처럼 ephemeral 오류 임베드로 응답한다.
- 제거된 문법도 별도 호환 메시지 없이 일반 파싱 오류로 처리한다.
- 명령별 에러 로그 메시지는 실제 호출 함수명과 맞춘다.

### E. 타입 안정성

- `as unknown as` 같은 광범위 캐스팅은 제거한다.
- 라이브러리의 discriminated union(`kind`)을 기준으로 타입 분기한다.
- `custom_roll.ts` 내부 임시 타입 정의를 포맷터 모듈로 이동하거나 축소한다.

## 구현 범위

### 수정 대상

- `src/commands/custom_roll.ts`
- `src/commands/preset_roll.ts`
- `src/commands/fate.ts`

### 신규 파일 후보

- `src/lib/diceroll/formatters.ts`
- `src/lib/diceroll/manual.ts`

실제 경로는 기존 프로젝트 구조를 확인해 가장 자연스러운 위치로 조정한다.

## 테스트 전략

다음 수준에서 검증한다.

### 1. 타입/빌드 검증

- TypeScript 타입 오류가 없어야 한다.
- 현재 프로젝트 빌드가 성공해야 한다.

### 2. 대표 수식 수동 검증

- 기본: `d20`, `3d6+2`
- compound/explode: `10d6!!`, `5d10!>8`, `1d6x`, `1d6xo`
- keep/drop: `4d6kh3`, `4d6k`, `4d6dh1`
- reroll: `1d20r1`, `2d6rr<2`
- success-family: `5d10>7`, `5d10>8f1`, `4d6cf`, `4d6df`, `3d6sf<3`, `3d6ms>10`, `4d6even`, `4d6odd`
- special: `d%`, `4dF`
- multi-expression: `d20+5 3d6+2`
- removed syntax: `1d20ro1`

### 3. 결과 표시 검증

- 새 `kind`가 누락 없이 렌더링되는지 확인한다.
- keep/drop 계열의 유지/제외 출력이 뒤바뀌지 않는지 확인한다.
- success-family 계열에서 총합 필드와 상세 필드 의미가 일치하는지 확인한다.

## 위험 요소

- `@nihilapp/diceroll-v3`의 README 예시와 실제 런타임 결과 구조가 다르면 포맷 분기에서 누락이 생길 수 있다.
- `custom_roll.ts`의 현재 임베드 필드 수가 많아지면 Discord 필드 제한에 닿을 수 있다.
- 성공 계열과 순성공 계열은 "총합"이라는 용어가 직관적이지 않을 수 있으므로, 표시 문구를 결과 의미에 맞게 조정할 필요가 있다.

## 비목표

- 슬래시 명령 이름/옵션 재설계
- 전면적인 UI 리디자인
- 라이브러리 자체 수정
- 제거된 구문에 대한 하위호환 래퍼 추가

## 구현 순서 제안

1. 공용 포맷터 초안 작성
2. `/프리셋`과 `/페이트`를 공용 포맷터로 이동
3. `/주사위` 결과 분기 전면 교체
4. `/주사위` 도움말 최신화
5. 제거된 구문과 신규 구문 검증
6. 빌드 및 수동 테스트
