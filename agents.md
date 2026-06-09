# 프로젝트 개발 명세 및 AI 에이전트 가이드: 볼트 (Volt)

본 문서는 **Next.js 16.x (App Router)** 기반의 작사가용 스마트 메모장 플랫폼 **'볼트(Volt)'**의 기말 개별 프로젝트 사양서입니다. AI 코딩 에이전트(Cursor, Copilot 등)가 본 프롬프트와 아키텍처 설계를 바탕으로 코드를 유기적으로 생성하고, 최종 제출 기준을 완벽히 충족할 수 있도록 지시문 형태로 구조화되었습니다.

---

## 1. 프로젝트 기본 정보 및 환경 (Environment)

* **프로젝트 이름:** 볼트 (Volt)
* **서비스 주제:** 영감 수집, 라임 매칭, 메타데이터 관리가 결합된 작사가 전용 스마트 메모장 및 공유 피드
* **개발 환경 사양 (필수 고정):**
  * **Framework:** Next.js 16.x
  * **Routing:** App Router 단독 사용 (Pages Router 사용 불가)
  * **Language:** TypeScript
  * **Node.js:** 20.9 (LTS) 이상
  * **Build Tool:** Turbopack (`next dev --turbo` / `next build`)
  * **Package Manager:** npm
  * **Database ORM:** Prisma

---

## 2. 화면 구성 및 라우팅 명세 (UI & Screens)
로그인/회원가입 제외 **최소 3개 이상의 독립 화면** 구성을 충족합니다.

1. **영감 피드 화면 (`/explore`)** - *메인 화면*
   * 공개 설정된 가사와 무드 이미지가 카드 형태로 노출되는 전체 탐색 피드.
   * `next/image`를 활용한 이미지 최적화 레이아웃 적용.
2. **글귀 에디터 화면 (`/lyrics/[id]`)** - *상세 편집 페이지*
   * 선택한 가사 노트를 세부적으로 수정하고 관리하는 공간.
   * BPM, Key, Song Form 블록 등 동적 메타데이터 관리 및 우측 사이드바 '라임 메모 스플릿 뷰' 활성화.
3. **마이 아카이브 화면 (`/dashboard`)** - *개인 대시보드*
   * 내가 작성한 비공개 글귀 노트를 모아보고 폴더링 및 진척도별로 관리하는 공간.
4. **인증 관련 화면 (`/login`, `/signup`)**
   * 프로젝트 기본 요구사항 통과를 위한 로그인 및 자체 회원가입 폼 화면.

---

## 3. 핵심 기술 기능 및 에이전트 구현 가이드

### 3.1. 다국어 지원 (i18n)
* **요구사항:** 한국어(ko)와 영어(en)를 기본 지원해야 함.
* **에이전트 지시:** URL 경로 방식(`/[locale]/explore`) 또는 쿠키 기반 미들웨어 라우팅 방식을 구현하라. `dictionaries/` 폴더 내에 `ko.json` 및 `en.json`을 배치하고, 텍스트가 동적으로 전환되도록 구성하라.

### 3.2. 데이터베이스 및 백엔드 연동 (Prisma DB, C/U/D 구현)
* **요구사항:** 정적 JSON이 아닌, 실제 사용자 동작에 의한 데이터 쓰기(Create, Update, Delete)가 1개 이상 실시간 연동되어야 함.
* **Prisma 스키마 구조 정의:**
  * `User`: ID, 이메일, 비밀번호, 닉네임
  * `Lyric`: ID, 제목, 본문, 이미지 URL, BPM, Key, 공개여부(IsPublic), 작성자 ID, 생성일시
  * `RhymeNote`: ID, 연동 가사 ID, 핵심 모음 구조, 메모 텍스트
* **에이전트 지시:** `Server Action`을 활용하여 가사 작성(Create), 가사 내용 및 메타데이터 수정(Update), 가사 삭제(Delete) 로직을 안전하게 구현하라.

### 3.3. 로그인, 인증 및 보호된 영역 (Authentication & Middleware)
* **요구사항:** DB 연동 자체 로그인 또는 OAuth 2.0 소셜 로그인 제공 + 비로그인 접근 차단 페이지 1개 이상 존재 필수.
* **에이전트 지시:** Next.js `middleware.ts`를 작성하여 세션 토큰 또는 쿠키가 없는 사용자가 `/dashboard` 혹은 `/lyrics/[id]`에 접근할 때 즉시 `/login` 페이지로 리다이렉트되도록 차단 장치를 구현하라.

### 3.4. 서버 로직 (Server Actions & Route Handlers)
* **에이전트 지시:** 가사 저장 및 상태 업데이트는 Next.js `Server Action` 기능으로 처리하고, 외부 공유용 동적 메타데이터 조회 및 sitemap 생성 로직 일부는 `Route Handler`(`app/api/.../route.ts`)를 활용해 구현하라.

### 3.5. UI 사용자 가이드 및 최적화
* **로딩 및 에러 핸들링:** 모든 라우트 폴더 내에 `loading.tsx`, `error.tsx`, `not-found.tsx`를 배치하여 비동기 데이터 로딩 중 Suspense fallback UI가 매끄럽게 표시되도록 하라.
* **이미지 최적화:** 외부 무드 이미지 및 업로드 이미지는 반드시 `<Image />` 컴포넌트(`next/image`)를 사용하고, `width`, `height`, `placeholder="blur"` 속성을 정의하라.

### 3.6. 메타데이터 및 SEO 사양
* **동적 메타데이터:** `/lyrics/[id]` 페이지 내부에서 `generateMetadata()`를 선언하여 현재 조회 중인 가사 제목과 작사가 이름이 브라우저 타이틀 및 Open Graph 태그에 동적으로 박히도록 설계하라.
* **기본 에셋:** `app/favicon.ico`, `app/sitemap.ts`(또는 sitemap.xml), `app/robots.ts`를 생성하여 검색 엔진 최적화 요구사항을 충족하라.

---

## 4. 최종 제출 전 검증 체크리스트 (Submission Checklist)

AI 에이전트는 빌드(`next build`) 전 다음 항목이 유실 없이 구현되었는지 최종 점검하라.

* [ ] **Next.js 16.x + App Router + TypeScript** 환경이 완벽히 준수되었는가?
* [ ] **다국어(ko/en)** 폴더 구조나 미들웨어가 에러 없이 작동하는가?
* [ ] **Prisma ORM**을 통해 실제 DB에 가사 생성/수정/삭제(C/U/D)가 반영되는가?
* [ ] **인증 미들웨어**가 비로그인 유저의 `/dashboard` 접근을 확실히 차단하는가?
* [ ] 로그인/회원가입 외에 `/explore`, `/lyrics/[id]`, `/dashboard` **3개 이상의 화면**이 존재하는가?
* [ ] `loading.tsx` 및 `error.tsx` 파일이 누락 없이 바인딩되었는가?
* [ ] `sitemap.xml` 및 동적 Open Graph 메타데이터가 정상 출력되는가?
* [ ] `node_modules/`와 `.next/` 폴더를 제외하고 프로젝트 파일이 올바르게 압축되는가?

---

## 5. 구현 운영 규칙 (Agent Working Rules)

* **라우트 기준:** 실제 사용 화면은 `/explore`, `/dashboard`, `/lyrics/[id]`, `/login`, `/signup`를 우선 유지한다. 다국어는 쿠키 기반으로 제공하되, 모든 화면 텍스트는 `dictionaries/ko.json`, `dictionaries/en.json`에서 가져온다.
* **DB 기준:** 개발 및 제출 시연 DB는 Prisma + SQLite를 기본값으로 사용한다. `.env`에는 `DATABASE_URL="file:./dev.db"`를 둔다.
* **인증 기준:** 자체 이메일/비밀번호 인증을 사용하며, 비밀번호는 해시 저장한다. 세션은 서명된 HTTP-only 쿠키로 관리하고, `/dashboard`, `/lyrics/:id`는 `middleware.ts`에서 보호한다.
* **데이터 쓰기 기준:** 가사 생성, 수정, 삭제 및 라임 메모 저장은 반드시 Server Action으로 처리한다. 클라이언트 상태만 바꾸는 목업 저장은 제출용 구현으로 인정하지 않는다.
* **이미지 기준:** 피드와 상세 화면의 무드 이미지는 `next/image`를 사용하고, 외부 URL 사용 시 `next.config.ts`의 `remotePatterns`를 함께 관리한다.
* **검증 명령:** 구조 변경 후 `npm run lint`, `npm run build`를 실행한다. DB 스키마 변경 후에는 `npm run db:push`로 Prisma Client와 SQLite 스키마를 맞춘다.
