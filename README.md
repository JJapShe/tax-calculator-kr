# 💰 한국 세금 계산기

한국의 각종 세금을 간편하게 계산할 수 있는 통합 웹 애플리케이션입니다. 자동차세, 부동산세, 소득세 등 다양한 세금 계산기를 제공합니다.

🌐 **Live Demo**: [https://JJapShe.github.io/tax-calculator-kr](https://JJapShe.github.io/tax-calculator-kr)

## 주요 기능

### 🚗 자동차 세금 계산기 (현재 제공)
- **개별소비세**: 차량 가격의 5% (배기량 1,000cc 이하 비과세)
- **취득세**: 차량 가격의 7% (지방세)
- **등록세**: 차량 가격의 0.5% (지방세)
- **자동차세**: 배기량에 따른 차등 부과 (연간)
- **감면 혜택**: 장애인, 친환경차, 노후차량, 다자녀 등

### 🏠 부동산 세금 계산기 (준비중)
- **취득세**: 부동산 취득 시 부과되는 세금
- **재산세**: 부동산 보유 시 부과되는 연간 세금
- **종합부동산세**: 고가 부동산 보유 시 추가 세금

### 💼 소득세 계산기 (준비중)
- **근로소득세**: 연봉 기준 소득세 계산
- **종합소득세**: 기타 소득 포함 세금 계산
- **퇴직소득세**: 퇴직금 관련 세금 계산

### 🎁 증여·상속세 계산기 (준비중)
- **증여세**: 재산 증여 시 부과되는 세금
- **상속세**: 상속 시 부과되는 세금

### 💾 차량 정보 관리
- 브라우저 로컬 스토리지를 이용한 차량 정보 저장
- 여러 차량 정보를 목록으로 관리
- 저장된 차량 정보 불러오기 및 삭제

### 📱 반응형 디자인
- 모바일, 태블릿, 데스크톱 모든 디바이스 지원
- PWA(Progressive Web App) 지원
- 오프라인 캐싱 지원

## 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: SCSS (컴파일된 CSS)
- **Storage**: Local Storage
- **Hosting**: GitHub Pages
- **PWA**: Service Worker, Web App Manifest

## 프로젝트 구조

```
tax-calculator-kr/
├── index.html          # 메인 HTML 파일
├── styles/
│   ├── main.scss       # SCSS 소스 파일
│   └── main.css        # 컴파일된 CSS 파일
├── scripts/
│   └── main.js         # 메인 JavaScript 파일
├── manifest.json       # PWA 매니페스트
├── sw.js              # Service Worker
├── package.json        # 프로젝트 정보
├── DEPLOY.md          # 배포 가이드
└── README.md          # 프로젝트 설명서
```

## 설치 및 실행

### 1. 로컬 개발 서버 실행
```bash
# Python 3가 설치된 경우
npm start

# 또는 직접 실행
python -m http.server 8000
```

브라우저에서 `http://localhost:8000`으로 접속

### 2. GitHub Pages 배포

1. GitHub 저장소에 코드 푸시
2. GitHub 저장소 설정에서 Pages 활성화
3. Source를 "Deploy from a branch" 선택
4. Branch를 "main" 선택, folder는 "/ (root)" 선택
5. 자동으로 `https://JJapShe.github.io/tax-calculator-kr`에 배포됨

### 3. 즉시 배포하기
```bash
# GitHub에 푸시하면 자동으로 GitHub Pages에 배포됩니다
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

## 사용 방법

### 1. 차량 정보 입력
- 차량명, 가격, 배기량, 연료 타입, 거주지역 입력
- 해당하는 감면 혜택 선택

### 2. 세금 계산
- 계산하기 버튼 클릭 또는 실시간 자동 계산
- 개별소비세, 취득세, 등록세, 자동차세 결과 확인

### 3. 차량 정보 저장
- 계산 결과 확인 후 "차량 정보 저장" 버튼 클릭
- 저장된 차량 목록에서 관리

### 4. 저장된 차량 관리
- 불러오기: 저장된 차량 정보를 폼에 다시 로드
- 삭제: 저장된 차량 정보 삭제

## 세금 계산 기준

### 개별소비세 (5%)
- 배기량 1,000cc 이하: 비과세
- 전기차, 하이브리드: 최대 100만원 감면
- 장애인: 면제

### 취득세 (7%)
- 전기차, 하이브리드: 최대 140만원 감면
- 노후차량: 최대 30만원 감면

### 등록세 (0.5%)
- 차량 가격의 0.5% 부과

### 자동차세 (연간)
- 1,000cc 이하: 80원/cc
- 1,600cc 이하: 140원/cc
- 1,600cc 초과: 200원/cc
- 전기차: 면제

## 브라우저 지원

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## 라이선스

MIT License

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 주의사항

본 계산기는 참고용이며, 실제 세금과 차이가 있을 수 있습니다. 
정확한 세금 계산은 관련 기관에 문의하시기 바랍니다.

## 업데이트 내역

### v1.0.0 (2024-01-01)
- 초기 릴리즈
- 기본 세금 계산 기능
- 차량 정보 저장 기능
- 반응형 디자인
- PWA 지원

---

Made with ❤️ by Car Tax Calculator Team 