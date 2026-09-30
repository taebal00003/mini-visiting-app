# 03: Message 수정

**What to build:** 글쓴이는 Entry password를 입력해 자기 Entry의 Message를 고칠 수 있습니다. 비밀번호가 일치하지 않으면 수정이 거부되고, 그 사실이 해당 Entry에 표시됩니다. 요구사항의 **수정(Update)**과 수정 쪽 **비밀번호 검증**에 해당합니다.

**Blocked by:** 02 (Entry 작성과 목록 조회)

**Status:** ready-for-agent

### 수정 흐름
- [ ] 각 Entry에 [수정] 버튼이 있다. 누르면 그 Entry 안에 수정 폼이 펼쳐지고, 기존 Message가 미리 채워져 있다
- [ ] 수정 폼에서는 Message와 Entry password만 입력한다. Author name과 비밀번호 자체는 바꿀 수 없다
- [ ] [취소]를 누르면 아무것도 바뀌지 않고 폼이 닫힌다
- [ ] 제출 중에는 버튼이 비활성화된다

### 비밀번호 검증 (수정)
- [ ] 비밀번호가 **일치하면** Message가 바뀌고, 폼이 닫히고, 해당 Entry에 "(수정됨)"이 표시된다
- [ ] 비밀번호가 **일치하지 않으면** Message는 **바뀌지 않고**, 그 Entry의 폼 안에 "비밀번호가 일치하지 않습니다"가 보인다. 고쳐 쓴 Message는 폼에 그대로 남는다
- [ ] 비밀번호 비교는 저장된 해시와 scrypt 결과를 `timingSafeEqual`로 비교한다. 해시를 클라이언트로 보내지 않고 서버에서만 비교한다
- [ ] 다른 Entry의 비밀번호로는 이 Entry를 수정할 수 없다. 권한은 Entry 단위다
- [ ] 비밀번호 검증은 Server Action이 아니라 Guestbook 모듈(`editMessage`) 안에서 한다

### 규칙과 오류
- [ ] 새 Message도 trim 후 1–500자 규칙을 따르고, 어기면 `invalid`와 필드 안내가 나온다. 이때 비밀번호가 맞아도 저장하지 않는다
- [ ] 수정해도 Written at과 목록 위치는 바뀌지 않는다
- [ ] 이미 삭제된 Entry를 수정하려 하면 "이미 삭제된 글입니다"가 보이고 목록이 갱신된다. 이 안내는 비밀번호 불일치 안내와 구분된다
- [ ] 예상치 못한 오류가 나면 "잠시 후 다시 시도해 주세요"가 보이고, 내부 오류 내용은 노출되지 않는다

### 테스트 (Guestbook 모듈 + 인메모리 저장소)
- [ ] 올바른 비밀번호로 수정하면 `{ ok: true }`가 오고, `listEntries()`에 새 Message와 Edited 상태가 보이며 순서는 그대로다
- [ ] 틀린 비밀번호로 수정하면 `wrong-password`가 오고, `listEntries()`의 Message와 Edited 상태가 이전과 같다
- [ ] 다른 Entry의 비밀번호로 수정하면 `wrong-password`가 온다
- [ ] 없는 id로 수정하면 `not-found`가 온다
- [ ] 새 Message가 빈 값이거나 501자면 `invalid`가 오고 저장되지 않는다
- [ ] `npm test`, `npm run build`, `npm run lint`가 성공하고, 로컬 `next dev`에서 실제 Neon DB로 정상 수정과 비밀번호 불일치 거부를 모두 직접 확인한다
