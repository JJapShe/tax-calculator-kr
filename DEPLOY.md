# GitHub Pages 배포 가이드 - 한국 세금 계산기

## 1. GitHub 저장소 설정

1. GitHub에서 새 저장소를 생성하거나 기존 저장소를 사용
2. 저장소 이름: `tax-calculator-kr`

## 2. 코드 업로드

```bash
# 현재 디렉토리에서 Git 초기화 (아직 하지 않았다면)
git init

# 파일들을 스테이징
git add .

# 첫 번째 커밋
git commit -m "Initial commit: Korean tax calculator with navigation and AdSense"

# GitHub 저장소와 연결
git remote add origin https://github.com/JJapShe/tax-calculator-kr.git

# main 브랜치로 푸시
git push -u origin main
```

## 3. GitHub Pages 활성화

1. GitHub 저장소 페이지에서 **Settings** 탭 클릭
2. 왼쪽 메뉴에서 **Pages** 클릭
3. **Source** 섹션에서:
   - "Deploy from a branch" 선택
   - Branch: **main** 선택
   - Folder: **/ (root)** 선택
4. **Save** 버튼 클릭

## 4. 배포 완료

- 몇 분 후 사이트가 `https://JJapShe.github.io/tax-calculator-kr`에서 접속 가능
- 변경사항이 있을 때마다 `git push`만 하면 자동으로 업데이트됨

## 5. AdSense 설정

현재 AdSense 코드는 플레이스홀더 상태입니다:

1. Google AdSense 계정에서 사이트를 등록
2. 승인 후 실제 Publisher ID와 Ad Unit ID를 받음
3. `index.html`에서 다음 부분들을 실제 값으로 교체:

```html
<!-- 현재 -->
data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
data-ad-slot="XXXXXXXXXX"

<!-- 실제 값으로 교체 -->
data-ad-client="ca-pub-1234567890123456"
data-ad-slot="1234567890"
```

## 6. 사이트 접속 확인

배포 후 다음 URL로 접속 가능:
- https://JJapShe.github.io/tax-calculator-kr

## 주의사항

- `.nojekyll` 파일이 포함되어 있어 Jekyll 처리 없이 바로 정적 파일이 서빙됩니다
- Service Worker가 포함되어 있어 PWA 기능을 제공합니다
- AdSense 승인까지는 시간이 걸릴 수 있습니다 (몇 일에서 몇 주)