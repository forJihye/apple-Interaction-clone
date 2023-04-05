/**
 * 1. 애니메이션 타임라인 (스크롤) 구간을 나눈다.
 * 2. 구간 별로 정보를 세팅 해서 애니메이션을 구현한다,
 * 3. 보이는 구간만 애니메이션이 재생 되도록,
 * 4. 각 스크롤 값 구간이 왔을 때 해당되는 애니메이션을 재생시킨다. (나머지 애니메이션은 정지)
 * 5. 스크롤 높이 설정에 따라서 애니메이션 재생의 속도를 조절할 수 있다.
 * 
 */

// 즉시 함수 호출 (전역 변수 사용을 줄이도록)
(() => {
  const $ = document.querySelector.bind(document);
  
  let yOffset = 0; // window.pageYOffset 저장 변수
  let prevScrollHeight = 0; // 현재 스크롤 위치보다 이전에 위치한 스크롤 섹션들의 스크롤 높이의 값
  let currentScene = 0; // 현재 활성화 된 영역 스크롤 섹션
  let enterNewScene = false // 새로운 구간이 시작되었다는 깃발 역할

  // 섹션 (신) 정보 기본 환경 설정
  const sceneInfo = [
    {
      id: 0,
      type: 'sticky',
      heightNum: 5, // 브라우저 높이의 5배로 scrollHeight 세팅 (디바이스 크기가 다 다르기 때문에 상대 크기)
      scrollHeight: 0, // 애니메이션 스크롤 기준 높이
      elms: {
        container: $('#scroll-section-0'),
        messageA: $("#scroll-section-0 .main-message.a"),
        messageB: $("#scroll-section-0 .main-message.b"),
        messageC: $("#scroll-section-0 .main-message.c"),
        messageD: $("#scroll-section-0 .main-message.d"),
      },
      values: { // [애니메이션 시작 값, 종료 값, 애니메이션 재생 구간(비율)]
        messageA_opacity_in: [0, 1, { start: 0.1, end: 0.2 }],
        messageB_opacity_in: [0, 1, { start: 0.3, end: 0.4 }],
        messageC_opacity_in: [0, 1, { start: 0.5, end: 0.6 }],
        messageD_opacity_in: [0, 1, { start: 0.7, end: 0.8 }],
        messageA_translateY_in: [20, 0, { start: 0.1, end: 0.2 }],
        messageB_translateY_in: [20, 0, { start: 0.3, end: 0.4 }],
        messageC_translateY_in: [20, 0, { start: 0.5, end: 0.6 }],
        messageD_translateY_in: [20, 0, { start: 0.7, end: 0.8 }],
        messageA_opacity_out: [1, 0, { start: 0.25, end: 0.3 }],
        messageB_opacity_out: [1, 0, { start: 0.45, end: 0.5 }],
        messageC_opacity_out: [1, 0, { start: 0.65, end: 0.7 }],
        messageD_opacity_out: [1, 0, { start: 0.85, end: 0.9 }],
        messageA_translateY_out: [0, -20, { start: 0.25, end: 0.3 }],
        messageB_translateY_out: [0, -20, { start: 0.45, end: 0.5 }],
        messageC_translateY_out: [0, -20, { start: 0.65, end: 0.7 }],
        messageD_translateY_out: [0, -20, { start: 0.85, end: 0.9 }]
      }
    },
    {
      id: 1,
      type: 'normal',
      heightNum: 5,
      scrollHeight: 0,
      elms: {
        container: $('#scroll-section-1'),
      }
    },
    {
      id: 2,
      type: 'sticky',
      heightNum: 5,
      scrollHeight: 0,
      elms: {
        container: $('#scroll-section-2'),
        messageA: document.querySelector('#scroll-section-2 .a'),
        messageB: document.querySelector('#scroll-section-2 .b'),
        messageC: document.querySelector('#scroll-section-2 .c'),
        pinB: document.querySelector('#scroll-section-2 .b .pin'),
        pinC: document.querySelector('#scroll-section-2 .c .pin')
      },
      values: {
        messageA_translateY_in: [20, 0, { start: 0.15, end: 0.2 }],
        messageB_translateY_in: [30, 0, { start: 0.5, end: 0.55 }],
        messageC_translateY_in: [30, 0, { start: 0.72, end: 0.77 }],
        messageA_opacity_in: [0, 1, { start: 0.15, end: 0.2 }],
        messageB_opacity_in: [0, 1, { start: 0.5, end: 0.55 }],
        messageC_opacity_in: [0, 1, { start: 0.72, end: 0.77 }],
        messageA_translateY_out: [0, -20, { start: 0.3, end: 0.35 }],
        messageB_translateY_out: [0, -20, { start: 0.58, end: 0.63 }],
        messageC_translateY_out: [0, -20, { start: 0.85, end: 0.9 }],
        messageA_opacity_out: [1, 0, { start: 0.3, end: 0.35 }],
        messageB_opacity_out: [1, 0, { start: 0.58, end: 0.63 }],
        messageC_opacity_out: [1, 0, { start: 0.85, end: 0.9 }],
        pinB_scaleY: [0.5, 1, { start: 0.5, end: 0.55 }],
        pinC_scaleY: [0.5, 1, { start: 0.72, end: 0.77 }],
        pinB_opacity_in: [0, 1, { start: 0.5, end: 0.55 }],
        pinC_opacity_in: [0, 1, { start: 0.72, end: 0.77 }],
        pinB_opacity_out: [1, 0, { start: 0.58, end: 0.63 }],
        pinC_opacity_out: [1, 0, { start: 0.85, end: 0.9 }]
      }
    },
    {
      id: 3,
      type: 'sticky',
      heightNum: 5,
      scrollHeight: 0,
      elms: {
        container: $('#scroll-section-3'),
        canvasCaption: document.querySelector('.canvas-caption')
      },
      values: {

      }
    }
  ]

  // 각 섹션의 높이 세팅
  function setLayout() {
    for (let i = 0; i < sceneInfo.length; i++) {
      if (sceneInfo[i].type === 'sticky') {
        sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;
      } else { // 애니메이션 타입 노말
        sceneInfo[i].scrollHeight = sceneInfo[i].elms.container.offsetHeight;
      }
      sceneInfo[i].elms.container.style.height = `${sceneInfo[i].scrollHeight}px`;
    }

    yOffset = window.pageYOffset;

    let totalScrollHeight = 0;
    for (let i = 0; i < sceneInfo.length; i++) {
      totalScrollHeight += sceneInfo[i].scrollHeight;
      if (totalScrollHeight >= yOffset) {
        currentScene = i;
        break;
      }
    }
    document.body.setAttribute("id", `show-scene-${currentScene}`);
  }

  // 스크롤 시 실행 될 핸들러
  function scrollLoop() {
    enterNewScene = false;
    prevScrollHeight = 0; // prevScrollHeight 값이 누적되지 않도록 초기화
    for (let i = 0; i < currentScene; i++) {
      prevScrollHeight += sceneInfo[i].scrollHeight;
    }
    
    // 애니메이션 활성화 섹션 찾기
    if (yOffset > prevScrollHeight + sceneInfo[currentScene].scrollHeight) { // 스크롤 내릴 때
      enterNewScene = true;
      currentScene++;
      document.body.setAttribute("id", `show-scene-${currentScene}`);
    } 

    if (yOffset < prevScrollHeight) { // 스크롤 올릴 때
      enterNewScene = true;
      if (currentScene === 0) return; // 맥이나 모바일에서 스크롤 위로 올릴 때 위로 바운스 되어서 마이너스값을 막아주는 역할
      currentScene--;
      document.body.setAttribute("id", `show-scene-${currentScene}`);
    }
    // console.log('currentScene', currentScene)
    if (enterNewScene) return;
    playAnimation();
  }

  /**
   * 
   * @param {object} values 
   * @param {number} currentYOffset 현재 구간에서 얼마만큼 스크롤 되었는지 (현재 스크롤 높이 (yOffset) - 총 스크롤 높이 (prevScrollHeight))
   * @returns {number} 
   */
  function calcValues(values, currentYOffset) { 
    let rv; 
    // console.log(currentScene, values)
    const scrollHeight = sceneInfo[currentScene].scrollHeight;
    const scrollRatio = currentYOffset / scrollHeight; // 현재 구간에서 스크롤된 범위 비율 구함 - 얼마만큼 스크롤 되었는지 비율
    const from = values[0];
    const to = values[1];
    const {start, end} = values[2];

    if (start && end) { // 전체 구각이 아닌 해당 구간에 있을 경우
      const partScrollStart = scrollHeight * start; // 현재 구간에서 시작점
      const partScrollEnd = scrollHeight * end; // 현재 구간에서 종료점
      const partScrollHeight = partScrollEnd - partScrollStart; // 시작점 ~ 종료점 범위 구간

      if (currentYOffset >= partScrollStart && currentYOffset <= partScrollEnd) { // 현재 스크롤 높이가 애니메이션 범위 구간에 진입하면 애니메이션 실행
        rv = (currentYOffset - partScrollStart) / partScrollHeight * (to - from) + from;
      } else if (currentYOffset < partScrollStart) { // 현재 스크롤 높이가 애니메이션 시작 구간보다 작으면 애니메이션 시작값으로 초기화
        rv = from;
      } else if (currentYOffset > partScrollEnd ){
        rv = to;
      }
    } else {
      rv = scrollRatio * (to - from) + from;
    }
    return rv;
  }

  // 애니메이션 진행 핸들러
  function playAnimation() {
    const elms = sceneInfo[currentScene].elms;
    const values = sceneInfo[currentScene].values;
    const currentYOffset = yOffset - prevScrollHeight; // 현재 스크롤 비율 = 전체 스크롤 높이 / 현재 섹션 스크롤 높이
    const scrollHeight = sceneInfo[currentScene].scrollHeight; // 현재 섹션 스크롤 높이
    const scrollRatio = currentYOffset / scrollHeight; // 현재 스크롤 비율
    // console.log(currentScene, currentYOffset)

    // 해당되는 구간 애니메이션을 재생시킨다. (나머지 애니메이션은 정지) 
    if (currentScene === 0) {
      if (scrollRatio <= 0.22) {
        // in
        elms.messageA.style.opacity = calcValues(values.messageA_opacity_in, currentYOffset);
        elms.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_in, currentYOffset)}%, 0)`;
      } else {
        // out
        elms.messageA.style.opacity = calcValues(values.messageA_opacity_out, currentYOffset);
        elms.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_out, currentYOffset)}%, 0)`;
      }

      if (scrollRatio <= 0.42) {
        // in
        elms.messageB.style.opacity = calcValues(values.messageB_opacity_in, currentYOffset);
        elms.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_in, currentYOffset)}%, 0)`;
      } else {
          // out
        elms.messageB.style.opacity = calcValues(values.messageB_opacity_out, currentYOffset);
        elms.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_out, currentYOffset)}%, 0)`;
      }

      if (scrollRatio <= 0.62) {
        // in
        elms.messageC.style.opacity = calcValues(values.messageC_opacity_in, currentYOffset);
        elms.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_in, currentYOffset)}%, 0)`;
      } else {
        // out
        elms.messageC.style.opacity = calcValues(values.messageC_opacity_out, currentYOffset);
        elms.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_out, currentYOffset)}%, 0)`;
      }

      if (scrollRatio <= 0.82) {
        // in
        elms.messageD.style.opacity = calcValues(values.messageD_opacity_in, currentYOffset);
        elms.messageD.style.transform = `translate3d(0, ${calcValues(values.messageD_translateY_in, currentYOffset)}%, 0)`;
      } else {
        // out
        elms.messageD.style.opacity = calcValues(values.messageD_opacity_out, currentYOffset);
        elms.messageD.style.transform = `translate3d(0, ${calcValues(values.messageD_translateY_out, currentYOffset)}%, 0)`;
      }
    }
    else if (currentScene === 1) {

    }
    else if (currentScene === 2) {
      if (scrollRatio <= 0.25) {
        // in
        elms.messageA.style.opacity = calcValues(values.messageA_opacity_in, currentYOffset);
        elms.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_in, currentYOffset)}%, 0)`;
      } else {
        // out
        elms.messageA.style.opacity = calcValues(values.messageA_opacity_out, currentYOffset);
        elms.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_out, currentYOffset)}%, 0)`;
      }

      if (scrollRatio <= 0.57) {
        // in
        elms.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_in, currentYOffset)}%, 0)`;
        elms.messageB.style.opacity = calcValues(values.messageB_opacity_in, currentYOffset);
        elms.pinB.style.transform = `scaleY(${calcValues(values.pinB_scaleY, currentYOffset)})`;
      } else {
        // out
        elms.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_out, currentYOffset)}%, 0)`;
        elms.messageB.style.opacity = calcValues(values.messageB_opacity_out, currentYOffset);
        elms.pinB.style.transform = `scaleY(${calcValues(values.pinB_scaleY, currentYOffset)})`;
      }

      if (scrollRatio <= 0.83) {
        // in
        elms.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_in, currentYOffset)}%, 0)`;
        elms.messageC.style.opacity = calcValues(values.messageC_opacity_in, currentYOffset);
        elms.pinC.style.transform = `scaleY(${calcValues(values.pinC_scaleY, currentYOffset)})`;
      } else {
        // out
        elms.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_out, currentYOffset)}%, 0)`;
        elms.messageC.style.opacity = calcValues(values.messageC_opacity_out, currentYOffset);
        elms.pinC.style.transform = `scaleY(${calcValues(values.pinC_scaleY, currentYOffset)})`;
      }
    }
    else if (currentScene === 3) {

    }
  }

  // window.addEventListener('DOMContentLoaded', setLayout); // HTML 돔 구조 로드가 끝나면 실행
  window.addEventListener('load', setLayout); // HTML 돔 구조 로드가 끝나면 실행
  window.addEventListener('resize', setLayout);
  window.addEventListener('scroll', (ev) => {
    yOffset = window.scrollY;
    scrollLoop();
  });

  console.log(sceneInfo);
})();