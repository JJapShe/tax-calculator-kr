// 자동차 세금 계산기 테스트 스크립트
// 브라우저 콘솔에서 실행하여 모든 기능을 테스트합니다.

console.log('🚗 자동차 세금 계산기 테스트 시작');
console.log('==========================================');

// 테스트 케이스들
const testCases = [
    {
        name: "기본 승용차 세금 계산",
        input: {
            carName: "아반떼",
            carPrice: 30000000,
            displacement: 1600,
            carAge: 0,
            vehicleType: "passenger",
            vehicleUse: "private",
            fuelType: "gasoline",
            seatingCapacity: "1-6",
            individualTaxDiscount: false,
            oldCar: false,
            disabled: false,
            veteran: false,
            multiChild2: false,
            multiChild3: false
        },
        expected: {
            shouldHaveIndividualTax: true,
            shouldHaveAcquisitionTax: true,
            shouldHaveAnnualTax: true
        }
    },
    {
        name: "전기차 자동 감면 적용",
        input: {
            carName: "아이오닉 6",
            carPrice: 50000000,
            displacement: 0,
            carAge: 0,
            vehicleType: "passenger",
            vehicleUse: "private",
            fuelType: "electric",
            seatingCapacity: "1-6",
            individualTaxDiscount: true,
            oldCar: false,
            disabled: false,
            veteran: false,
            multiChild2: false,
            multiChild3: false
        },
        expected: {
            shouldHaveReducedIndividualTax: true,
            shouldHaveReducedAcquisitionTax: true,
            shouldHaveFlatAnnualTax: true
        }
    },
    {
        name: "수소전기차 자동 감면 적용",
        input: {
            carName: "넥쏘",
            carPrice: 70000000,
            displacement: 0,
            carAge: 0,
            vehicleType: "passenger",
            vehicleUse: "private",
            fuelType: "hydrogen",
            seatingCapacity: "1-6",
            individualTaxDiscount: true,
            oldCar: false,
            disabled: false,
            veteran: false,
            multiChild2: false,
            multiChild3: false
        },
        expected: {
            shouldHaveReducedIndividualTax: true,
            shouldHaveReducedAcquisitionTax: true,
            shouldHaveFlatAnnualTax: true
        }
    },
    {
        name: "경차 자동 감면 적용",
        input: {
            carName: "모닝",
            carPrice: 15000000,
            displacement: 800,
            carAge: 0,
            vehicleType: "compact",
            vehicleUse: "private",
            fuelType: "gasoline",
            seatingCapacity: "1-6",
            individualTaxDiscount: true,
            oldCar: false,
            disabled: false,
            veteran: false,
            multiChild2: false,
            multiChild3: false
        },
        expected: {
            shouldHaveZeroIndividualTax: true,
            shouldHaveZeroAcquisitionTax: true
        }
    },
    {
        name: "장애인 면제 적용",
        input: {
            carName: "쏘나타",
            carPrice: 40000000,
            displacement: 2000,
            carAge: 0,
            vehicleType: "passenger",
            vehicleUse: "private",
            fuelType: "gasoline",
            seatingCapacity: "1-6",
            individualTaxDiscount: false,
            oldCar: false,
            disabled: true,
            veteran: false,
            multiChild2: false,
            multiChild3: false
        },
        expected: {
            shouldHaveZeroAcquisitionTax: true,
            shouldHaveReducedIndividualTax: true
        }
    },
    {
        name: "1000cc 이하 비과세",
        input: {
            carName: "레이",
            carPrice: 18000000,
            displacement: 1000,
            carAge: 0,
            vehicleType: "passenger",
            vehicleUse: "private",
            fuelType: "gasoline",
            seatingCapacity: "1-6",
            individualTaxDiscount: false,
            oldCar: false,
            disabled: false,
            veteran: false,
            multiChild2: false,
            multiChild3: false
        },
        expected: {
            shouldHaveZeroIndividualTax: true
        }
    },
    {
        name: "전기차 감면 한도 테스트",
        input: {
            carName: "고급 전기차",
            carPrice: 200000000,
            displacement: 0,
            carAge: 0,
            vehicleType: "passenger",
            vehicleUse: "private",
            fuelType: "electric",
            seatingCapacity: "1-6",
            individualTaxDiscount: true,
            oldCar: false,
            disabled: false,
            veteran: false,
            multiChild2: false,
            multiChild3: false
        },
        expected: {
            shouldHaveElectricTaxLimit: true,
            maxElectricDiscount: 3000000
        }
    }
];

// 테스트 실행 함수
function runTests() {
    if (typeof taxCalculator === 'undefined') {
        console.error('❌ taxCalculator 객체를 찾을 수 없습니다. 먼저 메인 페이지를 로드해주세요.');
        return;
    }

    let passedTests = 0;
    let totalTests = testCases.length;

    testCases.forEach((testCase, index) => {
        console.log(`\n📋 테스트 ${index + 1}/${totalTests}: ${testCase.name}`);
        console.log('──────────────────────────────────────');

        try {
            // 입력값 설정
            setTestInputs(testCase.input);
            
            // 계산 실행
            const vehicleData = taxCalculator.getVehicleData();
            const taxes = taxCalculator.calculateAllTaxes(vehicleData);
            
            // 결과 출력
            console.log('📊 계산 결과:');
            console.log(`  순수 차량 가격: ${taxes.purePrice.toLocaleString()}원`);
            console.log(`  개별소비세: ${taxes.individualTax.toLocaleString()}원`);
            console.log(`  교육세: ${taxes.educationTax.toLocaleString()}원`);
            console.log(`  부가가치세: ${taxes.vatTax.toLocaleString()}원`);
            console.log(`  취득세: ${taxes.acquisitionTax.toLocaleString()}원`);
            console.log(`  자동차세: ${taxes.annualTax.toLocaleString()}원`);
            console.log(`  총 지불금액: ${taxes.totalTax.toLocaleString()}원`);
            
            // 검증
            const isValid = validateTestResult(taxes, testCase.expected, testCase.input);
            
            if (isValid) {
                console.log('✅ 테스트 통과');
                passedTests++;
            } else {
                console.log('❌ 테스트 실패');
            }
            
        } catch (error) {
            console.error(`❌ 테스트 실행 중 오류: ${error.message}`);
        }
    });

    // 결과 요약
    console.log('\n🎯 테스트 결과 요약');
    console.log('==========================================');
    console.log(`총 테스트: ${totalTests}개`);
    console.log(`성공: ${passedTests}개`);
    console.log(`실패: ${totalTests - passedTests}개`);
    console.log(`성공률: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
        console.log('🎉 모든 테스트가 성공했습니다!');
    } else {
        console.log('⚠️  일부 테스트가 실패했습니다. 위의 결과를 확인해주세요.');
    }
}

// 입력값 설정 함수
function setTestInputs(input) {
    // 안전한 DOM 요소 값 설정 (테스트 환경에서는 요소가 없을 수 있음)
    const setElementValue = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.value = value;
    };
    
    const setElementChecked = (id, checked) => {
        const element = document.getElementById(id);
        if (element) element.checked = checked;
    };
    
    setElementValue('carName', input.carName);
    setElementValue('carPrice', input.carPrice);
    setElementValue('displacement', input.displacement);
    setElementValue('carAge', input.carAge);
    setElementValue('vehicleType', input.vehicleType);
    setElementValue('vehicleUse', input.vehicleUse);
    setElementValue('fuelType', input.fuelType);
    setElementValue('seatingCapacity', input.seatingCapacity);
    
    // 체크박스 설정
    setElementChecked('individualTaxDiscount', input.individualTaxDiscount);
    setElementChecked('oldCarDiscount', input.oldCar);
    
    // 라디오 버튼 설정
    setElementChecked('acquisitionNone', true); // 기본값
    if (input.disabled) {
        setElementChecked('disabledDiscount', true);
    } else if (input.veteran) {
        setElementChecked('veteranDiscount', true);
    } else if (input.multiChild2) {
        setElementChecked('multiChild2', true);
    } else if (input.multiChild3) {
        setElementChecked('multiChild3', true);
    }
    
    // 연료타입 변경 시 자동 적용 트리거
    if (input.fuelType === 'electric' || input.fuelType === 'hydrogen') {
        taxCalculator.updateDisplacementField();
    }
    
    // 차량 형태 변경 시 자동 적용 트리거
    if (input.vehicleType === 'compact') {
        taxCalculator.updateVehicleTypeOptions();
    }
}

// 결과 검증 함수
function validateTestResult(taxes, expected, input) {
    let isValid = true;
    
    // 기본 세금 존재 확인
    if (expected.shouldHaveIndividualTax && taxes.individualTax <= 0) {
        console.log('❌ 개별소비세가 계산되지 않았습니다.');
        isValid = false;
    }
    
    if (expected.shouldHaveAcquisitionTax && taxes.acquisitionTax <= 0) {
        console.log('❌ 취득세가 계산되지 않았습니다.');
        isValid = false;
    }
    
    if (expected.shouldHaveAnnualTax && taxes.annualTax <= 0) {
        console.log('❌ 자동차세가 계산되지 않았습니다.');
        isValid = false;
    }
    
    // 면제 확인
    if (expected.shouldHaveZeroIndividualTax && taxes.individualTax > 0) {
        console.log('❌ 개별소비세가 면제되지 않았습니다.');
        isValid = false;
    }
    
    if (expected.shouldHaveZeroAcquisitionTax && taxes.acquisitionTax > 0) {
        console.log('❌ 취득세가 면제되지 않았습니다.');
        isValid = false;
    }
    
    // 감면 확인
    if (expected.shouldHaveReducedIndividualTax) {
        const normalTax = taxes.purePrice * 0.05;
        if (taxes.individualTax >= normalTax) {
            console.log('❌ 개별소비세 감면이 적용되지 않았습니다.');
            isValid = false;
        }
    }
    
    if (expected.shouldHaveReducedAcquisitionTax) {
        const normalTax = taxes.taxBase * 0.07;
        if (taxes.acquisitionTax >= normalTax) {
            console.log('❌ 취득세 감면이 적용되지 않았습니다.');
            isValid = false;
        }
    }
    
    // 전기차 정액 자동차세 확인
    if (expected.shouldHaveFlatAnnualTax) {
        const expectedAnnualTax = input.vehicleUse === 'private' ? 130000 : 26000;
        if (taxes.annualTax !== expectedAnnualTax) {
            console.log(`❌ 전기차 정액 자동차세가 잘못되었습니다. 기대값: ${expectedAnnualTax}원, 실제값: ${taxes.annualTax}원`);
            isValid = false;
        }
    }
    
    // 전기차 감면 한도 확인
    if (expected.shouldHaveElectricTaxLimit) {
        const originalIndividualTax = taxes.purePrice * 0.05;
        const actualDiscount = originalIndividualTax - taxes.individualTax;
        if (actualDiscount > expected.maxElectricDiscount) {
            console.log(`❌ 전기차 감면 한도가 초과되었습니다. 한도: ${expected.maxElectricDiscount}원, 실제 감면: ${actualDiscount}원`);
            isValid = false;
        }
    }
    
    return isValid;
}

// 빠른 테스트 함수들
function testElectricCar() {
    console.log('🔋 전기차 테스트');
    setTestInputs({
        carName: "아이오닉 6",
        carPrice: 50000000,
        displacement: 0,
        carAge: 0,
        vehicleType: "passenger",
        vehicleUse: "private",
        fuelType: "electric",
        seatingCapacity: "1-6",
        individualTaxDiscount: true,
        oldCar: false,
        disabled: false,
        veteran: false,
        multiChild2: false,
        multiChild3: false
    });
    
    const vehicleData = taxCalculator.getVehicleData();
    const taxes = taxCalculator.calculateAllTaxes(vehicleData);
    
    console.log('전기차 계산 결과:');
    console.log(`개별소비세: ${taxes.individualTax.toLocaleString()}원`);
    console.log(`취득세: ${taxes.acquisitionTax.toLocaleString()}원`);
    console.log(`자동차세: ${taxes.annualTax.toLocaleString()}원`);
}

function testDisabledExemption() {
    console.log('♿ 장애인 면제 테스트');
    setTestInputs({
        carName: "쏘나타",
        carPrice: 40000000,
        displacement: 2000,
        carAge: 0,
        vehicleType: "passenger",
        vehicleUse: "private",
        fuelType: "gasoline",
        seatingCapacity: "1-6",
        individualTaxDiscount: false,
        oldCar: false,
        disabled: true,
        veteran: false,
        multiChild2: false,
        multiChild3: false
    });
    
    const vehicleData = taxCalculator.getVehicleData();
    const taxes = taxCalculator.calculateAllTaxes(vehicleData);
    
    console.log('장애인 면제 계산 결과:');
    console.log(`개별소비세: ${taxes.individualTax.toLocaleString()}원`);
    console.log(`취득세: ${taxes.acquisitionTax.toLocaleString()}원 (면제되어야 함)`);
}

function testCompactCar() {
    console.log('🚗 경차 테스트');
    setTestInputs({
        carName: "모닝",
        carPrice: 15000000,
        displacement: 800,
        carAge: 0,
        vehicleType: "compact",
        vehicleUse: "private",
        fuelType: "gasoline",
        seatingCapacity: "1-6",
        individualTaxDiscount: true,
        oldCar: false,
        disabled: false,
        veteran: false,
        multiChild2: false,
        multiChild3: false
    });
    
    const vehicleData = taxCalculator.getVehicleData();
    const taxes = taxCalculator.calculateAllTaxes(vehicleData);
    
    console.log('경차 계산 결과:');
    console.log(`개별소비세: ${taxes.individualTax.toLocaleString()}원 (면제되어야 함)`);
    console.log(`취득세: ${taxes.acquisitionTax.toLocaleString()}원 (면제되어야 함)`);
}

// 전역 함수로 노출
window.runTests = runTests;
window.testElectricCar = testElectricCar;
window.testDisabledExemption = testDisabledExemption;
window.testCompactCar = testCompactCar;

console.log('📝 테스트 함수가 준비되었습니다!');
console.log('사용법:');
console.log('  runTests()           - 전체 테스트 실행');
console.log('  testElectricCar()    - 전기차 테스트');
console.log('  testDisabledExemption() - 장애인 면제 테스트');
console.log('  testCompactCar()     - 경차 테스트'); 