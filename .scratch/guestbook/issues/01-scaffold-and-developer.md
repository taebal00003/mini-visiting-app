# 01: 방명록 뼈대와 개발자 표시

**What to build:** 방문자가 사이트에 들어오면 Create Next App 기본 화면 대신 방명록 페이지를 봅니다. 상단에는 제목 "방명록"과 `개발자: 권태현 (202204175)`가 표시됩니다. 개발자 쪽에서는 `npm test`로 Vitest 테스트를 돌릴 수 있고, 패키지 이름이 제출 규칙(`guestbook-202204175`)에 맞습니다. 이후 티켓이 규칙과 테스트를 바로 얹을 수 있게 해 두는 정리 작업(prefactor)입니다.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] `/` 페이지에 Create Next App 기본 콘텐츠(로고, 템플릿 링크)가 없다
- [x] 페이지 상단에 제목 "방명록"과 `개발자: 권태현 (202204175)`가 보인다. 개발자 이름과 학번은 코드의 한 곳에서만 정의한다
- [x] 문서 `<title>`과 `lang`이 한국어 방명록에 맞게 설정되어 있다
- [x] `package.json`의 name이 `guestbook-202204175`다
- [x] Vitest가 설치되어 있고, `npm test`가 한 번 실행하고 끝나는 모드로 동작한다 (첫 테스트는 02에서 추가: 01 단계에는 의미 있는 동작이 없어 `passWithNoTests`로 둠)
- [x] `npm run build`와 `npm run lint`가 성공한다
- [x] 모바일 폭(약 375px)에서 가로 스크롤이 생기지 않는다
