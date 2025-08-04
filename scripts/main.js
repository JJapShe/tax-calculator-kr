// 세금 계산 상수
const TAX_RATES = {
    individualTax: 0.05,         // 개별소비세 5%
    individualTaxDiscounted: 0.035, // 개별소비세 감면 3.5%
    educationTax: 0.30,          // 교육세 30% (개별소비세의)
    vatTax: 0.10,                // 부가가치세 10%
    // 취득세 (차량 형태별)
    acquisitionTax: {
        compact: {
            private: 0.02,       // 경차 비영업용 2%
            business: 0.02       // 경차 영업용 2%
        },
        passenger: {
            private: 0.07,       // 승용차 비영업용 7%
            business: 0.04       // 승용차 영업용 4%
        },
        van: {
            private: {
                small: 0.07,     // 승합차 7~10인승 비영업용 7%
                large: 0.05      // 승합차 11인승 이상 비영업용 5%
            },
            business: 0.04       // 승합차 영업용 4%
        },
        truck: {
            private: 0.05,       // 화물차 비영업용 5%
            business: 0.04       // 화물차 영업용 4%
        },
        motorcycle: {
            private: {
                small: 0.02,     // 이륜차 125cc 이하 비영업용 2%
                large: 0.05      // 이륜차 125cc 초과 비영업용 5%
            },
            business: {
                small: 0.02,     // 이륜차 125cc 이하 영업용 2%
                large: 0.04      // 이륜차 125cc 초과 영업용 4%
            }
        }
    },
    // 자동차세 (차량 형태별, 배기량별)
    carTax: {
        compact: {
            private: {
                under800: 80
            },
            business: {
                under800: 240
            }
        },
        passenger: {
            private: {
                under1000: 80,
                under1600: 140,
                over1600: 200
            },
            business: {
                under1000: 240,  // 영업용은 3배
                under1600: 420,
                over1600: 600
            }
        },
        van: {
            private: {
                under7seats: 140,
                seats7to10: 200,
                seats11to15: 260,
                over15seats: 330
            },
            business: {
                under7seats: 420,
                seats7to10: 600,
                seats11to15: 780,
                over15seats: 990
            }
        },
        truck: {
            private: {
                under1ton: 200,
                tons1to2: 300,
                tons2to3: 450,
                over3tons: 600
            },
            business: {
                under1ton: 600,
                tons1to2: 900,
                tons2to3: 1350,
                over3tons: 1800
            }
        },
        motorcycle: {
            private: {
                under125: 18,    // 125cc 이하
                under250: 24,    // 250cc 이하
                over250: 36      // 250cc 초과
            },
            business: {
                under125: 54,    // 영업용은 3배
                under250: 72,
                over250: 108
            }
        }
    },
    // 등록면허세 (이륜차 125cc 초과)
    registrationLicense: 15000
};

// 역산 계수 계산
// 순수가격 = P라고 하면
// 과세표준 = P + P×개별소비세율 + P×개별소비세율×교육세율 + (P + P×개별소비세율 + P×개별소비세율×교육세율)×부가세율
// 과세표준 = P × (1 + 개별소비세율 + 개별소비세율×교육세율) × (1 + 부가세율)

function calculateReverseCoefficient(individualTaxRate) {
    const baseRate = 1 + individualTaxRate + (individualTaxRate * TAX_RATES.educationTax);
    return baseRate * (1 + TAX_RATES.vatTax);
}

const REVERSE_CALCULATION = {
    // 5% 개별소비세: (1 + 0.05 + 0.015) × (1 + 0.10) = 1.065 × 1.10 = 1.1715
    standard: calculateReverseCoefficient(TAX_RATES.individualTax),
    // 3.5% 개별소비세 감면: (1 + 0.035 + 0.0105) × (1 + 0.10) = 1.0455 × 1.10 = 1.15005
    discounted: calculateReverseCoefficient(TAX_RATES.individualTaxDiscounted)
};

// 차령별 자동차세 할인율
const CAR_AGE_DISCOUNT = {
    0: 1.0,     // 1년 미만: 100%
    1: 0.9,     // 1년: 90%
    2: 0.8,     // 2년: 80%
    3: 0.7,     // 3년: 70%
    4: 0.6,     // 4년: 60%
    5: 0.5,     // 5년: 50%
    6: 0.3      // 6년 이상: 30%
};

// 감면 혜택 상수
const DISCOUNT_LIMITS = {
    individualTaxDiscount: 1000000,  // 개별소비세 감면 최대 100만원
    disabled: {
        individualTax: 5000000       // 장애인 개별소비세 최대 500만원 면제
    },
    compact: {
        individualTax: 0,        // 경차 개별소비세 면제
        acquisitionTax: 18750000 // 경차 취득세 1,875만원 이하 시 면제
    },
    hybrid: {
        individualTax: 0,        // 하이브리드 개별소비세 감면 없음
        acquisitionTax: 400000   // 하이브리드 취득세 최대 40만원 감면 (2024년 종료)
    },
    electric: {
        individualTax: 3000000,  // 전기차 개별소비세 최대 300만원 감면
        acquisitionTax: 1400000  // 전기차 취득세 최대 140만원 감면
    },
    hydrogen: {
        individualTax: 4000000,  // 수소전기차 개별소비세 최대 400만원 감면
        acquisitionTax: 1400000  // 수소전기차 취득세 최대 140만원 감면
    },
    oldCar: {
        acquisitionTax: 300000,  // 노후차량 취득세 최대 30만원 감면
        individualTaxRate: 0.70, // 노후차량 개별소비세 70% 감면
        individualTaxMax: 1000000 // 노후차량 개별소비세 감면 최대 100만원
    },
    multiChild: {
        twoChildren: 300000,     // 다자녀 2명 최대 30만원 감면
        threeChildren: 500000    // 다자녀 3명 최대 50만원 감면
    }
};

// 개별소비세 감면 유효 기간 (2025년 12월 31일까지)
const INDIVIDUAL_TAX_DISCOUNT_END_DATE = new Date('2025-12-31');

// 친환경차 감면 유효 기간
const DISCOUNT_END_DATES = {
    hybrid: new Date('2024-12-31'),      // 하이브리드 2024년 종료
    electric: new Date('2026-12-31'),    // 전기차 2026년 12월 31일까지
    hydrogen: new Date('2027-12-31'),    // 수소전기차 2027년 12월 31일까지
    compact: new Date('2027-12-31')      // 경차 2027년 12월 31일까지
};

// 현재 날짜 기준으로 개별소비세 감면 가능 여부 확인
function isIndividualTaxDiscountAvailable() {
    const today = new Date();
    return today <= INDIVIDUAL_TAX_DISCOUNT_END_DATE;
}

// 차량 데이터 저장소
class VehicleStorage {
    constructor() {
        this.storageKey = 'carTaxCalculator_vehicles';
    }

    // 차량 목록 불러오기
    getVehicles() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    // 차량 저장하기
    saveVehicle(vehicle) {
        const vehicles = this.getVehicles();
        vehicle.id = Date.now().toString();
        vehicle.createdAt = new Date().toISOString();
        vehicles.push(vehicle);
        localStorage.setItem(this.storageKey, JSON.stringify(vehicles));
        return vehicle;
    }

    // 차량 삭제하기
    deleteVehicle(id) {
        const vehicles = this.getVehicles();
        const filtered = vehicles.filter(vehicle => vehicle.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    }

    // 차량 업데이트하기
    updateVehicle(id, updatedVehicle) {
        const vehicles = this.getVehicles();
        const index = vehicles.findIndex(vehicle => vehicle.id === id);
        if (index !== -1) {
            vehicles[index] = { ...vehicles[index], ...updatedVehicle };
            localStorage.setItem(this.storageKey, JSON.stringify(vehicles));
        }
    }
}

// 세금 계산기 클래스
class TaxCalculator {
    constructor() {
        this.storage = new VehicleStorage();
        this.init();
    }

    init() {
        this.loadVehicleList();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 폼 입력 시 실시간 계산
        const inputs = document.querySelectorAll('#carPrice, #displacement, #carAge, #fuelType, #seatingCapacity, #region');
        inputs.forEach(input => {
            input.addEventListener('input', this.debounce(this.calculateTaxIfValid.bind(this), 500));
        });

        // 차량 형태/용도 변경 시 옵션 업데이트 및 재계산
        document.getElementById('vehicleType').addEventListener('change', () => {
            this.updateVehicleTypeOptions();
            // 차량 형태 변경 시 즉시 계산 (디바운싱 없이)
            this.calculateTax();
        });
        document.getElementById('vehicleUse').addEventListener('change', this.calculateTaxIfValid.bind(this));
        
        // 연료타입 변경 시 배기량 입력 상태 업데이트
        document.getElementById('fuelType').addEventListener('change', () => {
            this.updateDisplacementField();
            // 연료타입 변경 시 즉시 계산 (디바운싱 없이)
            this.calculateTax();
        });

        // 체크박스/라디오 버튼 변경 시 재계산
        const checkboxes = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', this.calculateTaxIfValid.bind(this));
        });

        // 개별소비세 감면 체크박스 활성화/비활성화
        this.updateIndividualTaxDiscountStatus();
        
        // 초기 차량 형태 옵션 업데이트
        this.updateVehicleTypeOptions();
        
        // 초기 배기량 필드 상태 업데이트
        this.updateDisplacementField();
    }

    // 차량 형태에 따른 옵션 활성화/비활성화
    updateVehicleTypeOptions() {
        const vehicleTypeElement = document.getElementById('vehicleType');
        if (!vehicleTypeElement) return; // 테스트 환경에서는 이 요소가 없을 수 있음
        
        const vehicleType = vehicleTypeElement.value;
        
        // 경차 선택 시 관련 감면 자동 적용
        if (vehicleType === 'compact') {
            this.applyCompactCarDiscounts();
        } else {
            // 경차가 아닌 경우 라벨 원복 (전기차/수소전기차 제외)
            const fuelTypeElement = document.getElementById('fuelType');
            if (!fuelTypeElement) return;
            
            const fuelType = fuelTypeElement.value;
            if (fuelType !== 'electric' && fuelType !== 'hydrogen') {
                this.resetDiscountLabels();
            }
        }
    }

    // 연료타입에 따른 배기량 필드 상태 업데이트
    updateDisplacementField() {
        const fuelTypeElement = document.getElementById('fuelType');
        const displacementInput = document.getElementById('displacement');
        const displacementLabel = document.querySelector('label[for="displacement"]');
        const displacementHint = document.getElementById('displacementHint');
        
        if (!fuelTypeElement || !displacementInput) return; // 테스트 환경에서는 이 요소들이 없을 수 있음
        
        const fuelType = fuelTypeElement.value;
        
        if (fuelType === 'electric' || fuelType === 'hydrogen') {
            displacementInput.disabled = true;
            displacementInput.value = '0';
            displacementInput.placeholder = '배기량 없음';
            if (displacementLabel) {
                displacementLabel.textContent = '배기량 (배기량 없음)';
            }
            displacementInput.style.backgroundColor = '#f8f9fa';
            displacementInput.style.color = '#6c757d';
            if (displacementHint) {
                displacementHint.style.display = 'block';
            }
            
            // 전기차/수소전기차 선택 시 관련 감면 자동 적용
            this.applyEcoFriendlyDiscounts(fuelType);
            
            // 전기차/수소전기차 선택 시 즉시 계산 실행
            this.calculateTax();
            
            // 차량 가격이 없으면 차량 가격 필드에 포커스
            const carPriceElement = document.getElementById('carPrice');
            if (carPriceElement) {
                const carPrice = parseFloat(carPriceElement.value.replace(/[^0-9]/g, ''));
                if (carPrice <= 0) {
                    carPriceElement.focus();
                }
            }
        } else {
            displacementInput.disabled = false;
            displacementInput.value = '1998';
            displacementInput.placeholder = '배기량 (cc)';
            if (displacementLabel) {
                displacementLabel.textContent = '배기량';
            }
            displacementInput.style.backgroundColor = '';
            displacementInput.style.color = '';
            if (displacementHint) {
                displacementHint.style.display = 'none';
            }
            
            // 일반 연료타입 선택 시 개별소비세 감면 라벨 원복
            this.resetDiscountLabels();
        }
    }

    // 친환경차 감면 자동 적용
    applyEcoFriendlyDiscounts(fuelType) {
        // 개별소비세 감면 자동 체크 (유효 기간 내일 때만)
        if (isIndividualTaxDiscountAvailable()) {
            document.getElementById('individualTaxDiscount').checked = true;
        }
        
        // 차량 형태 확인
        const vehicleType = document.getElementById('vehicleType').value;
        
        // 전기차/수소전기차 라벨 업데이트 (감면 정보 표시)
        const fuelTypeLabel = fuelType === 'electric' ? '전기차' : '수소전기차';
        const vehicleTypeLabel = vehicleType === 'compact' ? ' 경차' : '';
        const discountLabel = document.querySelector('label[for="individualTaxDiscount"] span');
        if (discountLabel) {
            discountLabel.innerHTML = `개별소비세 감면 (5% → 3.5%, ~25년 12월 31일) - ${fuelTypeLabel}${vehicleTypeLabel} 자동 적용`;
        }
    }

    // 감면 라벨 원복
    resetDiscountLabels() {
        const discountLabel = document.querySelector('label[for="individualTaxDiscount"] span');
        if (discountLabel) {
            discountLabel.textContent = '개별소비세 감면 (5% → 3.5%, ~25년 12월 31일)';
        }
    }

    // 경차 감면 자동 적용
    applyCompactCarDiscounts() {
        // 개별소비세 감면 자동 체크 (경차는 개별소비세 면제)
        if (isIndividualTaxDiscountAvailable()) {
            document.getElementById('individualTaxDiscount').checked = true;
        }
        
        // 경차 라벨 업데이트
        const discountLabel = document.querySelector('label[for="individualTaxDiscount"] span');
        if (discountLabel) {
            discountLabel.innerHTML = `개별소비세 감면 (5% → 3.5%, ~25년 12월 31일) - 경차 자동 적용`;
        }
    }

    // 개별소비세 감면 체크박스 상태 업데이트
    updateIndividualTaxDiscountStatus() {
        const checkbox = document.getElementById('individualTaxDiscount');
        if (!checkbox) return; // 테스트 환경에서는 이 요소가 없을 수 있음
        
        const label = checkbox.parentElement.querySelector('span');
        if (!label) return; // label이 없으면 종료
        
        if (isIndividualTaxDiscountAvailable()) {
            checkbox.disabled = false;
            label.textContent = '개별소비세 감면 (5% → 3.5%, ~25년 12월 31일)';
        } else {
            checkbox.disabled = true;
            checkbox.checked = false;
            label.textContent = '개별소비세 감면 (종료됨)';
        }
    }

    // 디바운스 함수
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 입력값이 유효하면 계산 실행
    calculateTaxIfValid() {
        const carPrice = parseFloat(document.getElementById('carPrice').value);
        const displacement = parseFloat(document.getElementById('displacement').value);
        
        if (carPrice > 0 && displacement > 0) {
            this.calculateTax();
        }
    }

    // 세금 계산 메인 함수
    calculateTax() {
        console.log('=== 세금 계산 시작 ===');
        const vehicleData = this.getVehicleData();
        console.log('수집된 차량 데이터:', vehicleData);
        
        if (!this.validateInput(vehicleData)) {
            console.log('입력값 검증 실패');
            return;
        }

        const taxes = this.calculateAllTaxes(vehicleData);
        console.log('계산된 세금 결과:', taxes);
        this.displayResults(taxes);
        console.log('=== 세금 계산 완료 ===');
    }

    // 차량 데이터 수집
    getVehicleData() {
        // 안전한 DOM 요소 값 가져오기 (테스트 환경에서는 요소가 없을 수 있음)
        const getElementValue = (id, defaultValue = '') => {
            const element = document.getElementById(id);
            return element ? element.value : defaultValue;
        };
        
        const getElementChecked = (id, defaultValue = false) => {
            const element = document.getElementById(id);
            return element ? element.checked : defaultValue;
        };
        
        const fuelType = getElementValue('fuelType', 'gasoline');
        const vehicleType = getElementValue('vehicleType', 'passenger');
        
        const discounts = {
            individualTaxDiscount: getElementChecked('individualTaxDiscount'),
            oldCar: getElementChecked('oldCarDiscount'),
            // 연료타입에 따른 자동 할인 적용
            hybrid: fuelType === 'hybrid',
            electric: fuelType === 'electric',
            hydrogen: fuelType === 'hydrogen',
            compact: vehicleType === 'compact',
            // 취득세 할인 대상
            disabled: getElementChecked('disabledDiscount'),
            veteran: getElementChecked('veteranDiscount'),
            multiChild2: getElementChecked('multiChild2'),
            multiChild3: getElementChecked('multiChild3')
        };
        
        console.log('차량 데이터 수집:', { fuelType, vehicleType, discounts });
        
        return {
            name: getElementValue('carName').trim(),
            price: parseFloat(getElementValue('carPrice', '0').replace(/[^0-9]/g, '')) || 0,
            displacement: parseFloat(getElementValue('displacement', '0')) || 0,
            carAge: parseInt(getElementValue('carAge', '0')) || 0,
            vehicleType: vehicleType,
            vehicleUse: getElementValue('vehicleUse', 'private'),
            fuelType: fuelType,
            seatingCapacity: getElementValue('seatingCapacity', '1-6'),
            region: getElementValue('region', 'seoul'),
            discounts: discounts
        };
    }

    // 입력값 유효성 검사
    validateInput(data) {
        if (data.price <= 0) {
            this.showError('차량 가격을 입력해주세요.');
            return false;
        }
        // 전기차/수소전기차는 배기량이 0이어도 괜찮음
        if (data.displacement <= 0 && data.fuelType !== 'electric' && data.fuelType !== 'hydrogen') {
            this.showError('배기량을 입력해주세요.');
            return false;
        }
        return true;
    }

    // 기준 가격에서 순수 차량 가격 역산 (5% 개별소비세 기준)
    calculateBasePurePrice(basePrice, displacement, fuelType) {
        // 기준: 5% 개별소비세, 감면 없는 상태로 계산
        const baseDiscounts = {
            disabled: false,
            individualTaxDiscount: false,
            oldCar: false,
            hybrid: false,
            electric: false,
            multiChild2: false,
            multiChild3: false
        };
        
        let purePrice = Math.floor(basePrice / REVERSE_CALCULATION.standard);
        let iteration = 0;
        const maxIterations = 10;
        
        while (iteration < maxIterations) {
            const individualTaxResult = this.calculateIndividualTax(purePrice, displacement, fuelType, baseDiscounts);
            const educationTax = Math.floor(individualTaxResult.tax * TAX_RATES.educationTax);
            const vatBase = purePrice + individualTaxResult.tax + educationTax;
            const vatTax = Math.floor(vatBase * TAX_RATES.vatTax);
            const calculatedTotal = purePrice + individualTaxResult.tax + educationTax + vatTax;
            
            const difference = basePrice - calculatedTotal;
            
            if (Math.abs(difference) <= 1) {
                break;
            }
            
            purePrice += difference;
            if (purePrice < 0) purePrice = 0;
            iteration++;
        }
        
        return Math.floor(purePrice);
    }

    // 순수 가격 기준으로 최종 차량 가격 계산
    calculateFinalPrice(purePrice, displacement, fuelType, discounts) {
        const individualTaxResult = this.calculateIndividualTax(purePrice, displacement, fuelType, discounts);
        const educationTax = Math.floor(individualTaxResult.tax * TAX_RATES.educationTax);
        const vatBase = purePrice + individualTaxResult.tax + educationTax;
        const vatTax = Math.floor(vatBase * TAX_RATES.vatTax);
        return purePrice + individualTaxResult.tax + educationTax + vatTax;
    }

    // 모든 세금 계산
    calculateAllTaxes(vehicleData) {
        const { price: basePrice, displacement, carAge, vehicleType, vehicleUse, fuelType, seatingCapacity, discounts } = vehicleData;

        // 1. 기준 가격에서 순수 차량 가격 계산 (5% 개별소비세, 감면 없음 기준)
        const purePrice = this.calculateBasePurePrice(basePrice, displacement, fuelType);
        
        // 2. 현재 설정에 따른 개별소비세 계산
        const individualTaxResult = this.calculateIndividualTax(purePrice, displacement, fuelType, discounts, vehicleType);
        
        // 3. 교육세 계산 (개별소비세의 30%)
        const educationTax = Math.floor(individualTaxResult.tax * TAX_RATES.educationTax);
        
        // 4. 부가가치세 계산 ((순수가격 + 개별소비세 + 교육세)의 10%)
        const vatBase = purePrice + individualTaxResult.tax + educationTax;
        const vatTax = Math.floor(vatBase * TAX_RATES.vatTax);
        
        // 5. 계산된 최종 차량 가격 (과세표준)
        const finalPrice = purePrice + individualTaxResult.tax + educationTax + vatTax;
        const taxBase = finalPrice;
        
        // 6. 취득세 계산 (차량 형태별)
        let acquisitionTax = this.calculateAcquisitionTax(taxBase, vehicleType, vehicleUse, fuelType, discounts, displacement, seatingCapacity);
        
        // 7. 자동차세 계산 (차량 형태별 × 차령할인)
        const annualTaxResult = this.calculateAnnualTax(displacement, carAge, vehicleType, vehicleUse, fuelType, seatingCapacity);

        return {
            basePrice,           // 기준 가격 (사용자 입력)
            purePrice,          // 순수 차량 가격
            finalPrice,         // 계산된 최종 차량 가격
            individualTax: individualTaxResult.tax,
            individualTaxRate: individualTaxResult.rate,
            educationTax,
            vatTax,
            taxBase,           // 과세표준 (= finalPrice)
            acquisitionTax,
            annualTax: annualTaxResult.tax,
            annualTaxFormula: annualTaxResult.formula,
            // 총 지불 금액 = 최종 차량 가격 + 취득세
            totalTax: finalPrice + acquisitionTax
        };
    }

    // 개별소비세 계산 (순수 차량 가격 기준)
    calculateIndividualTax(purePrice, displacement, fuelType, discounts, vehicleType) {
        console.log('개별소비세 계산 시작:', { purePrice, displacement, fuelType, vehicleType });
        
        // 이륜차는 개별소비세 없음
        if (vehicleType === 'motorcycle') {
            return { tax: 0, rate: '0% (이륜차 비과세)' };
        }

        // 배기량 1,000cc 이하 비과세 (전기차/수소전기차 제외)
        if (displacement <= 1000 && fuelType !== 'electric' && fuelType !== 'hydrogen') {
            console.log('1000cc 이하 비과세 적용');
            return { tax: 0, rate: '0% (1,000cc 이하 비과세)' };
        }

        // 개별소비세 계산 (전기차/수소전기차는 원래 세율 5%로 계산)
        let taxRate = TAX_RATES.individualTax;
        let rateLabel = '5%';
        
        // 전기차/수소전기차가 아닌 경우에만 개별소비세 감면 적용 (3.5%)
        if (discounts.individualTaxDiscount && isIndividualTaxDiscountAvailable() && 
            fuelType !== 'electric' && fuelType !== 'hydrogen') {
            taxRate = TAX_RATES.individualTaxDiscounted;
            rateLabel = '3.5% (감면 적용)';
        }

        let tax = purePrice * taxRate;
        let discountApplied = 0;

        // 개별소비세 감면 한도 적용 (최대 100만원) - 전기차/수소전기차 제외
        if (discounts.individualTaxDiscount && isIndividualTaxDiscountAvailable() && 
            fuelType !== 'electric' && fuelType !== 'hydrogen') {
            const originalTax = purePrice * TAX_RATES.individualTax;
            const discountedTax = purePrice * TAX_RATES.individualTaxDiscounted;
            const maxDiscount = Math.min(originalTax - discountedTax, DISCOUNT_LIMITS.individualTaxDiscount);
            tax = originalTax - maxDiscount;
            discountApplied += maxDiscount;
        }

        // 노후차량 감면 (개별소비세의 70% 감면, 최대 100만원)
        if (discounts.oldCar) {
            const oldCarDiscount = Math.min(
                tax * DISCOUNT_LIMITS.oldCar.individualTaxRate,
                DISCOUNT_LIMITS.oldCar.individualTaxMax
            );
            tax = Math.max(0, tax - oldCarDiscount);
            discountApplied += oldCarDiscount;
            if (oldCarDiscount > 0) {
                const discountAmountWon = Math.floor(oldCarDiscount / 10000) * 10000; // 원단위 절사
                rateLabel += `<br/>(노후차량 ${this.formatCurrency(discountAmountWon)} 감면)`;
            }
        }

        // 장애인 감면 (500만원 한도)
        if (discounts.disabled) {
            const disabledDiscount = Math.min(tax, DISCOUNT_LIMITS.disabled.individualTax);
            tax = Math.max(0, tax - disabledDiscount);
            discountApplied += disabledDiscount;
            if (disabledDiscount > 0) {
                const discountAmountWon = Math.floor(disabledDiscount / 10000) * 10000; // 원단위 절사
                rateLabel += `<br/>(장애인 ${this.formatCurrency(discountAmountWon)} 면제)`;
            }
        }

        // 경차 감면 (개별소비세 면제)
        if (discounts.compact && vehicleType === 'compact') {
            const today = new Date();
            if (today <= DISCOUNT_END_DATES.compact) {
                tax = 0;
                discountApplied = purePrice * taxRate;
                rateLabel = '0% (경차 면제)';
            }
        }

        // 하이브리드차 감면 (2024년 종료)
        if (discounts.hybrid && fuelType === 'hybrid' && vehicleType !== 'motorcycle') {
            // 하이브리드 개별소비세 감면은 없음
        }

        // 전기차 감면 (이륜차 제외)
        if (discounts.electric && fuelType === 'electric' && vehicleType !== 'motorcycle') {
            const today = new Date();
            console.log('전기차 감면 확인:', { 
                today: today.toISOString().split('T')[0], 
                endDate: DISCOUNT_END_DATES.electric.toISOString().split('T')[0],
                withinPeriod: today <= DISCOUNT_END_DATES.electric 
            });
            if (today <= DISCOUNT_END_DATES.electric) {
                const electricDiscount = Math.min(tax, DISCOUNT_LIMITS.electric.individualTax);
                console.log('전기차 개별소비세 감면:', { 
                    tax: tax, 
                    limit: DISCOUNT_LIMITS.electric.individualTax, 
                    discount: electricDiscount 
                });
                tax = Math.max(0, tax - electricDiscount);
                discountApplied += electricDiscount;
                if (electricDiscount > 0) {
                    const discountAmountWon = Math.floor(electricDiscount / 10000) * 10000; // 원단위 절사
                    rateLabel += `<br/>(전기차 ${this.formatCurrency(discountAmountWon)} 감면)`;
                }
            }
        }

        // 수소전기차 감면 (이륜차 제외)
        if (discounts.hydrogen && fuelType === 'hydrogen' && vehicleType !== 'motorcycle') {
            const today = new Date();
            if (today <= DISCOUNT_END_DATES.hydrogen) {
                const hydrogenDiscount = Math.min(tax, DISCOUNT_LIMITS.hydrogen.individualTax);
                tax = Math.max(0, tax - hydrogenDiscount);
                discountApplied += hydrogenDiscount;
                if (hydrogenDiscount > 0) {
                    const discountAmountWon = Math.floor(hydrogenDiscount / 10000) * 10000; // 원단위 절사
                    rateLabel += `<br/>(수소전기차 ${this.formatCurrency(discountAmountWon)} 감면)`;
                }
            }
        }

        if (discountApplied > 0 && !rateLabel.includes('감면')) {
            const totalDiscountWon = Math.floor(discountApplied / 10000) * 10000; // 원단위 절사
            rateLabel += `<br/>(총 ${this.formatCurrency(totalDiscountWon)} 감면)`;
        }

        return { tax: Math.floor(tax), rate: rateLabel };
    }

    // 취득세 계산
    calculateAcquisitionTax(taxBase, vehicleType, vehicleUse, fuelType, discounts, displacement, seatingCapacity) {
        // 차량 형태별 취득세율 적용
        let taxRate;
        let registrationLicense = 0;
        
        if (vehicleType === 'van' && vehicleUse === 'private') {
            // 승합차 비영업용은 승차정원에 따라 세율 다름
            const isLargeVan = seatingCapacity === '11-15' || seatingCapacity === '16+';
            taxRate = isLargeVan ? TAX_RATES.acquisitionTax.van.private.large : TAX_RATES.acquisitionTax.van.private.small;
        } else if (vehicleType === 'motorcycle') {
            // 이륜차는 배기량에 따라 세율과 등록면허세 결정
            const isLargeMotorcycle = displacement > 125 || (fuelType === 'electric' && displacement > 12);
            if (vehicleUse === 'private') {
                taxRate = isLargeMotorcycle ? TAX_RATES.acquisitionTax.motorcycle.private.large : TAX_RATES.acquisitionTax.motorcycle.private.small;
            } else {
                taxRate = isLargeMotorcycle ? TAX_RATES.acquisitionTax.motorcycle.business.large : TAX_RATES.acquisitionTax.motorcycle.business.small;
            }
            // 125cc 초과 이륜차는 등록면허세 추가
            if (isLargeMotorcycle) {
                registrationLicense = TAX_RATES.registrationLicense;
            }
        } else {
            taxRate = TAX_RATES.acquisitionTax[vehicleType][vehicleUse];
        }
        
        let tax = taxBase * taxRate + registrationLicense;

        // 장애인/국가유공자 면제가 최우선 (배타조건)
        if (discounts.disabled) {
            // 장애인 면제 조건 (법령 기준)
            const isEligible = this.isDisabledExemptionEligible(vehicleType, displacement, seatingCapacity);
            console.log('장애인 면제 조건 확인:', { vehicleType, displacement, seatingCapacity, isEligible });
            if (isEligible) {
                console.log('장애인 면제 적용: 취득세 0원');
                return 0; // 즉시 0으로 반환, 다른 감면 적용하지 않음
            }
        } else if (discounts.veteran) {
            // 국가유공자 1~3급 - 취득세 면제
            return 0; // 즉시 0으로 반환, 다른 감면 적용하지 않음
        } else if (discounts.multiChild2) {
            // 다자녀 2명
            tax = this.calculateMultiChildDiscount(tax, seatingCapacity, 2);
            return Math.floor(tax); // 다자녀 감면 적용 후 반환
        } else if (discounts.multiChild3) {
            // 다자녀 3명 이상
            tax = this.calculateMultiChildDiscount(tax, seatingCapacity, 3);
            return Math.floor(tax); // 다자녀 감면 적용 후 반환
        }

        // 장애인/국가유공자/다자녀가 아닌 경우에만 친환경차 및 기타 감면 적용
        
        // 경차 감면 (1,875만원 이하 시 면제)
        if (discounts.compact && vehicleType === 'compact') {
            const today = new Date();
            if (today <= DISCOUNT_END_DATES.compact) {
                if (taxBase <= DISCOUNT_LIMITS.compact.acquisitionTax) {
                    tax = 0;
                }
            }
        }

        // 하이브리드차 감면 (2024년 종료)
        if (discounts.hybrid && fuelType === 'hybrid') {
            const today = new Date();
            if (today <= DISCOUNT_END_DATES.hybrid) {
                tax = Math.max(0, tax - DISCOUNT_LIMITS.hybrid.acquisitionTax);
            }
        }

        // 전기차 감면
        if (discounts.electric && fuelType === 'electric') {
            const today = new Date();
            console.log('전기차 취득세 감면 확인:', { 
                today: today.toISOString().split('T')[0], 
                endDate: DISCOUNT_END_DATES.electric.toISOString().split('T')[0],
                withinPeriod: today <= DISCOUNT_END_DATES.electric 
            });
            if (today <= DISCOUNT_END_DATES.electric) {
                const originalTax = tax;
                tax = Math.max(0, tax - DISCOUNT_LIMITS.electric.acquisitionTax);
                console.log('전기차 취득세 감면 적용:', { 
                    originalTax: originalTax, 
                    limit: DISCOUNT_LIMITS.electric.acquisitionTax, 
                    finalTax: tax,
                    discount: originalTax - tax
                });
            }
        }

        // 수소전기차 감면
        if (discounts.hydrogen && fuelType === 'hydrogen') {
            const today = new Date();
            if (today <= DISCOUNT_END_DATES.hydrogen) {
                tax = Math.max(0, tax - DISCOUNT_LIMITS.hydrogen.acquisitionTax);
            }
        }

        // 노후차량 감면
        if (discounts.oldCar) {
            tax = Math.max(0, tax - DISCOUNT_LIMITS.oldCar.acquisitionTax);
        }

        return Math.floor(tax);
    }

    // 장애인 면제 대상 판별 (법령 기준)
    isDisabledExemptionEligible(vehicleType, displacement, seatingCapacity) {
        // 배기량을 숫자로 변환 (전기차/수소전기차의 경우 0)
        const displacementNum = parseFloat(displacement) || 0;
        
        switch (vehicleType) {
            case 'compact':
                // 경차: 모든 경차 면제 대상
                return true;
                
            case 'passenger':
                // 승용차: 배기량 2천cc 이하 또는 승차정원 7~10명
                return displacementNum <= 2000 || (seatingCapacity === '7-10');
                
            case 'van':
                // 승합차: 승차정원 15명 이하
                return seatingCapacity === '7-10' || seatingCapacity === '11-15';
                
            case 'truck':
                // 화물차: 최대적재량 1톤 이하 (배기량으로 추정)
                return displacementNum <= 2500; // 일반적으로 1톤 트럭은 2.5L 이하
                
            case 'motorcycle':
                // 이륜차: 배기량 250cc 이하
                return displacementNum <= 250;
                
            default:
                return false;
        }
    }

    // 다자녀 감면 계산
    calculateMultiChildDiscount(tax, seatingCapacity, childCount) {
        const isLargeSeating = seatingCapacity === '7-10' || seatingCapacity === '11-15' || seatingCapacity === '16+';
        
        if (childCount === 3) {
            if (isLargeSeating) {
                // 승차정원 7인승 이상 시 100% 감면, 단 취득세 200만원 초과 시 85%까지 감면
                if (tax > 2000000) {
                    return Math.floor(tax * 0.15); // 85% 감면
                } else {
                    return 0; // 100% 감면
                }
            } else {
                // 승차정원 6인승 이하 시 취득세 140만원 이하인 경우 전체 감면, 140만원 이상 시 140만원까지 감면
                if (tax <= 1400000) {
                    return 0; // 100% 감면
                } else {
                    return Math.floor(tax - 1400000); // 140만원만큼 감면
                }
            }
        } else if (childCount === 2) {
            if (isLargeSeating) {
                // 승차정원 7인승 이상 시 취득세 50% 감면
                return Math.floor(tax * 0.5);
            } else {
                // 승차정원 6인승 이하 시 취득세 140만원 이하 시 50% 감면, 140만원 초과 시 70만원까지 감면
                if (tax <= 1400000) {
                    return Math.floor(tax * 0.5); // 50% 감면
                } else {
                    return Math.floor(tax - 700000); // 70만원만큼 감면
                }
            }
        }
        
        return tax;
    }



    // 자동차세 계산
    calculateAnnualTax(displacement, carAge, vehicleType, vehicleUse, fuelType, seatingCapacity) {
        // 전기차는 정액제
        if (fuelType === 'electric' || fuelType === 'hydrogen') {
            let carTax, educationTax;
            if (vehicleUse === 'private') {
                carTax = 100000; // 비영업용 10만원
                educationTax = 30000; // 교육세 3만원
            } else {
                carTax = 20000; // 영업용 2만원
                educationTax = 6000; // 교육세 6천원
            }
            
            const totalTax = carTax + educationTax;
            
            const fuelTypeLabel = fuelType === 'electric' ? '전기차' : '수소전기차';
            const useLabel = vehicleUse === 'private' ? '비영업용' : '영업용';
            
            return { 
                tax: totalTax, 
                formula: `${fuelTypeLabel} ${useLabel} 정액: ${this.formatCurrency(carTax)} + 교육세: ${this.formatCurrency(educationTax)} = ${this.formatCurrency(totalTax)}` 
            };
        }

        let rate;
        let rateLabel = '';

        // 차량 형태별 세율 계산
        switch (vehicleType) {
            case 'compact':
                // 경차: 800cc 이하
                const compactRates = TAX_RATES.carTax.compact[vehicleUse];
                rate = compactRates.under800;
                rateLabel = `${rate}원/cc (경차)`;
                break;
                
            case 'passenger':
                // 승용차: 배기량별
                const passengerRates = TAX_RATES.carTax.passenger[vehicleUse];
                if (displacement <= 1000) {
                    rate = passengerRates.under1000;
                    rateLabel = `${rate}원/cc`;
                } else if (displacement <= 1600) {
                    rate = passengerRates.under1600;
                    rateLabel = `${rate}원/cc`;
                } else {
                    rate = passengerRates.over1600;
                    rateLabel = `${rate}원/cc`;
                }
                break;
                
            case 'van':
                // 승합차: 승차정원별
                const vanRates = TAX_RATES.carTax.van[vehicleUse];
                if (seatingCapacity === '1-6') {
                    rate = vanRates.under7seats;
                    rateLabel = `${rate}원/cc (6인승 이하)`;
                } else if (seatingCapacity === '7-10') {
                    rate = vanRates.seats7to10;
                    rateLabel = `${rate}원/cc (7~10인승)`;
                } else if (seatingCapacity === '11-15') {
                    rate = vanRates.seats11to15;
                    rateLabel = `${rate}원/cc (11~15인승)`;
                } else {
                    rate = vanRates.over15seats;
                    rateLabel = `${rate}원/cc (16인승 이상)`;
                }
                break;
                
            case 'truck':
                // 화물차: 적재량별 (배기량으로 추정)
                const truckRates = TAX_RATES.carTax.truck[vehicleUse];
                if (displacement <= 2000) {
                    rate = truckRates.under1ton;
                    rateLabel = `${rate}원/cc (1톤 이하)`;
                } else if (displacement <= 3000) {
                    rate = truckRates.tons1to2;
                    rateLabel = `${rate}원/cc (1~2톤)`;
                } else if (displacement <= 4000) {
                    rate = truckRates.tons2to3;
                    rateLabel = `${rate}원/cc (2~3톤)`;
                } else {
                    rate = truckRates.over3tons;
                    rateLabel = `${rate}원/cc (3톤 초과)`;
                }
                break;
                

                
            case 'motorcycle':
                // 이륜차: 배기량별
                const motorcycleRates = TAX_RATES.carTax.motorcycle[vehicleUse];
                if (displacement <= 125) {
                    rate = motorcycleRates.under125;
                    rateLabel = `${rate}원/cc (125cc 이하)`;
                } else if (displacement <= 250) {
                    rate = motorcycleRates.under250;
                    rateLabel = `${rate}원/cc (250cc 이하)`;
                } else {
                    rate = motorcycleRates.over250;
                    rateLabel = `${rate}원/cc (250cc 초과)`;
                }
                break;
        }

        // 차령별 할인율 적용
        const discountRate = CAR_AGE_DISCOUNT[Math.min(carAge, 6)];
        const discountPercent = Math.round(discountRate * 100);
        
        const baseTax = displacement * rate;
        const carTax = Math.floor(baseTax * discountRate);
        const educationTax = Math.floor(carTax * 0.3); // 교육세 30%
        const totalTax = carTax + educationTax;
        
        const formula = `${displacement}cc × ${rateLabel} × ${discountPercent}% (${carAge}년차) = ${this.formatCurrency(carTax)} + 교육세: ${this.formatCurrency(educationTax)} = ${this.formatCurrency(totalTax)}`;

        return { 
            tax: totalTax, 
            formula: formula 
        };
    }

    // 결과 표시
    displayResults(taxes) {
        // 안전한 DOM 요소 접근 (테스트 환경에서는 요소가 없을 수 있음)
        const setElementContent = (id, content) => {
            const element = document.getElementById(id);
            if (element) {
                if (typeof content === 'string' && content.includes('<')) {
                    element.innerHTML = content;
                } else {
                    element.textContent = content;
                }
            }
        };
        
        const setElementStyle = (id, property, value) => {
            const element = document.getElementById(id);
            if (element) element.style[property] = value;
        };
        
        // 계산된 차량가격 표시 (입력 필드 아래)
        const calculatedPriceDisplay = document.getElementById('calculatedPriceDisplay');
        if (calculatedPriceDisplay) {
            if (taxes.basePrice !== taxes.finalPrice) {
                calculatedPriceDisplay.textContent = `→ 계산된 차량가격: ${this.formatCurrency(taxes.finalPrice)}`;
                calculatedPriceDisplay.style.color = '#e74c3c';
                calculatedPriceDisplay.style.fontWeight = '600';
            } else {
                calculatedPriceDisplay.textContent = '';
            }
        }
        
        // 순수 차량 가격
        setElementContent('purePrice', this.formatCurrency(taxes.purePrice));
        
        // 개별소비세 관련
        setElementContent('individualTaxLabel', `개별소비세 (${taxes.individualTaxRate})`);
        setElementContent('individualTax', this.formatCurrency(taxes.individualTax));
        setElementContent('educationTax', this.formatCurrency(taxes.educationTax));
        setElementContent('vatTax', this.formatCurrency(taxes.vatTax));
        
        // 과세표준 (= 계산된 최종 차량가격)
        setElementContent('taxBase', this.formatCurrency(taxes.taxBase));
        
        // 취득세 (차량 형태별)
        const vehicleData = this.getVehicleData();
        let taxRate;
        
        if (vehicleData.vehicleType === 'van' && vehicleData.vehicleUse === 'private') {
            const isLargeVan = vehicleData.seatingCapacity === '11-15' || vehicleData.seatingCapacity === '16+';
            taxRate = isLargeVan ? TAX_RATES.acquisitionTax.van.private.large : TAX_RATES.acquisitionTax.van.private.small;
        } else if (vehicleData.vehicleType === 'motorcycle') {
            const isLargeMotorcycle = vehicleData.displacement > 125 || (vehicleData.fuelType === 'electric' && vehicleData.displacement > 12);
            if (vehicleData.vehicleUse === 'private') {
                taxRate = isLargeMotorcycle ? TAX_RATES.acquisitionTax.motorcycle.private.large : TAX_RATES.acquisitionTax.motorcycle.private.small;
            } else {
                taxRate = isLargeMotorcycle ? TAX_RATES.acquisitionTax.motorcycle.business.large : TAX_RATES.acquisitionTax.motorcycle.business.small;
            }
        } else {
            taxRate = TAX_RATES.acquisitionTax[vehicleData.vehicleType][vehicleData.vehicleUse];
        }
        
        const taxRatePercent = (taxRate * 100).toFixed(1);
        let labelText = `취득세 (과세표준의 ${taxRatePercent}%)`;
        
        // 이륜차 125cc 초과는 등록면허세 추가
        if (vehicleData.vehicleType === 'motorcycle' && 
            (vehicleData.displacement > 125 || (vehicleData.fuelType === 'electric' && vehicleData.displacement > 12))) {
            labelText += ' + 등록면허세 15,000원';
        }
        
        setElementContent('acquisitionTaxLabel', labelText);
        setElementContent('acquisitionTax', this.formatCurrency(taxes.acquisitionTax));
        
        // 자동차세
        setElementContent('annualTax', this.formatCurrency(taxes.annualTax));
        setElementContent('annualTaxFormula', taxes.annualTaxFormula);
        
        // 총 지불 금액
        setElementContent('totalTax', this.formatCurrency(taxes.totalTax));

        // 하이브리드 감면 종료 알림 표시
        this.showHybridDiscountNotice();

        // 결과 카드 표시
        const resultCard = document.getElementById('resultCard');
        if (resultCard) {
            resultCard.classList.add('show');
        }
    }

    // 하이브리드 감면 종료 알림
    showHybridDiscountNotice() {
        const vehicleData = this.getVehicleData();
        if (vehicleData.fuelType === 'hybrid') {
            const noticeElement = document.getElementById('hybridNotice');
            if (noticeElement) {
                noticeElement.textContent = '※ 하이브리드 차량 감면 혜택이 종료되었습니다.';
                noticeElement.style.color = '#ef4444';
                noticeElement.style.fontWeight = '500';
            }
        }
    }

    // 통화 형식 변환
    formatCurrency(amount) {
        return new Intl.NumberFormat('ko-KR').format(amount) + '원';
    }

    // 에러 메시지 표시
    showError(message) {
        alert(message);
    }

    // 차량 저장
    saveVehicle() {
        const vehicleData = this.getVehicleData();
        
        if (!this.validateInput(vehicleData)) {
            return;
        }

        if (!vehicleData.name) {
            this.showError('차량명을 입력해주세요.');
            return;
        }

        const taxes = this.calculateAllTaxes(vehicleData);
        const vehicle = {
            ...vehicleData,
            taxes
        };

        this.storage.saveVehicle(vehicle);
        this.loadVehicleList();
        this.showSuccess('차량이 저장되었습니다.');
    }

    // 성공 메시지 표시
    showSuccess(message) {
        alert(message);
    }

    // 차량 목록 불러오기
    loadVehicleList() {
        const vehicles = this.storage.getVehicles();
        const vehicleListElement = document.getElementById('vehicleList');

        // vehicleList 요소가 없으면 (테스트 환경 등) 건너뛰기
        if (!vehicleListElement) {
            return;
        }

        if (vehicles.length === 0) {
            vehicleListElement.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🚗</div>
                    <h3>저장된 차량이 없습니다</h3>
                    <p>차량 정보를 입력하고 저장해보세요.</p>
                </div>
            `;
            return;
        }

        vehicleListElement.innerHTML = vehicles.map(vehicle => this.createVehicleCard(vehicle)).join('');
    }

    // 차량 카드 생성
    createVehicleCard(vehicle) {
        const fuelTypeNames = {
            gasoline: '가솔린',
            diesel: '디젤',
            hybrid: '하이브리드',
            electric: '전기차'
        };

        const vehicleTypeNames = {
            compact: '경차',
            passenger: '승용차',
            van: '승합차',
            truck: '화물차',
            motorcycle: '이륜차'
        };

        const vehicleUseNames = {
            private: '비영업용',
            business: '영업용'
        };

        const basePrice = vehicle.taxes.basePrice || vehicle.price;
        const finalPrice = vehicle.taxes.finalPrice || vehicle.taxes.taxBase || vehicle.price;
        const seatingCapacityText = vehicle.seatingCapacity || '1-6';
        const vehicleTypeText = vehicleTypeNames[vehicle.vehicleType] || '승용차';
        const vehicleUseText = vehicleUseNames[vehicle.vehicleUse] || '비영업용';
        
        return `
            <div class="vehicle-card">
                <div class="vehicle-name">${vehicle.name}</div>
                <div class="vehicle-details">
                    기준가격: ${this.formatCurrency(basePrice)} • ${vehicle.displacement}cc • ${vehicle.carAge || 0}년차 • ${vehicleTypeText} • ${vehicleUseText} • ${fuelTypeNames[vehicle.fuelType]} • ${seatingCapacityText}
                    ${basePrice !== finalPrice ? `<br/>최종가격: ${this.formatCurrency(finalPrice)}` : ''}
                </div>
                <div class="vehicle-taxes">
                    <div class="tax-item">
                        <span>순수 가격</span>
                        <span>${this.formatCurrency(vehicle.taxes.purePrice || 0)}</span>
                    </div>
                    <div class="tax-item">
                        <span>개별소비세</span>
                        <span>${this.formatCurrency(vehicle.taxes.individualTax || 0)}</span>
                    </div>
                    <div class="tax-item">
                        <span>교육세</span>
                        <span>${this.formatCurrency(vehicle.taxes.educationTax || 0)}</span>
                    </div>
                    <div class="tax-item">
                        <span>부가가치세</span>
                        <span>${this.formatCurrency(vehicle.taxes.vatTax || 0)}</span>
                    </div>
                    <div class="tax-item">
                        <span>취득세</span>
                        <span>${this.formatCurrency(vehicle.taxes.acquisitionTax || 0)}</span>
                    </div>
                    <div class="tax-item total-tax">
                        <span>총 지불 금액</span>
                        <span>${this.formatCurrency(vehicle.taxes.totalTax || 0)}</span>
                    </div>
                </div>
                <div class="vehicle-actions">
                    <button class="load-btn" onclick="taxCalculator.loadVehicle('${vehicle.id}')">불러오기</button>
                    <button class="delete-btn" onclick="taxCalculator.deleteVehicle('${vehicle.id}')">삭제</button>
                </div>
            </div>
        `;
    }

    // 차량 정보 불러오기
    loadVehicle(id) {
        const vehicles = this.storage.getVehicles();
        const vehicle = vehicles.find(v => v.id === id);
        
        if (!vehicle) {
            this.showError('차량을 찾을 수 없습니다.');
            return;
        }

        // 폼에 데이터 채우기
        document.getElementById('carName').value = vehicle.name;
        document.getElementById('carPrice').value = vehicle.taxes.basePrice || vehicle.price;
        document.getElementById('displacement').value = vehicle.displacement;
        document.getElementById('carAge').value = vehicle.carAge || 0;
        document.getElementById('vehicleType').value = vehicle.vehicleType || 'passenger';
        document.getElementById('vehicleUse').value = vehicle.vehicleUse || 'private';
        document.getElementById('fuelType').value = vehicle.fuelType;
        document.getElementById('seatingCapacity').value = vehicle.seatingCapacity || '1-6';
        document.getElementById('region').value = vehicle.region;
        document.getElementById('individualTaxDiscount').checked = vehicle.discounts.individualTaxDiscount || false;
        document.getElementById('oldCarDiscount').checked = vehicle.discounts.oldCar || false;
        // 친환경차 감면은 연료타입에 따라 자동 적용되므로 별도 체크박스 설정 불필요
        // 취득세 할인 대상 라디오 버튼 설정
        if (vehicle.discounts.disabled) {
            document.getElementById('disabledDiscount').checked = true;
        } else if (vehicle.discounts.veteran) {
            document.getElementById('veteranDiscount').checked = true;
        } else if (vehicle.discounts.multiChild2) {
            document.getElementById('multiChild2').checked = true;
        } else if (vehicle.discounts.multiChild3) {
            document.getElementById('multiChild3').checked = true;
        } else {
            document.getElementById('acquisitionNone').checked = true;
        }

        // 배기량 필드 상태 업데이트
        this.updateDisplacementField();
        
        // 계산 결과 표시
        this.displayResults(vehicle.taxes);

        // 상단으로 스크롤
        document.querySelector('.calculator-section').scrollIntoView({ behavior: 'smooth' });
    }

    // 차량 삭제
    deleteVehicle(id) {
        if (confirm('정말로 이 차량을 삭제하시겠습니까?')) {
            this.storage.deleteVehicle(id);
            this.loadVehicleList();
            this.showSuccess('차량이 삭제되었습니다.');
        }
    }
}

// 전역 함수들
function calculateTax() {
    taxCalculator.calculateTax();
}

function saveVehicle() {
    taxCalculator.saveVehicle();
}

// 페이지 로드 시 초기화
let taxCalculator;
document.addEventListener('DOMContentLoaded', function() {
    taxCalculator = new TaxCalculator();
    
    // 애니메이션 효과
    const cards = document.querySelectorAll('.calculator-card, .info-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in-up');
        }, index * 100);
    });
});

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 추가 초기화 로직이 필요하면 여기에 추가
});

// 서비스 워커 등록 (PWA 지원)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
                // 강제로 새로운 service worker 활성화
                if (registration.waiting) {
                    registration.waiting.postMessage({type: 'SKIP_WAITING'});
                }
                return registration.update();
            })
            .then(registration => {
                console.log('SW updated: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 