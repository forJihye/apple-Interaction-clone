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

  // 부드러운 애니메이션 감속 설정
  let acc = 0.2;
  let delayedYOffset = 0;
  let rafId;
  let rafState;

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
        canvas: $("#video-canvas-0"),
        context: $("#video-canvas-0").getContext('2d'),
        videoImages: [],
      },
      values: { // [애니메이션 시작 값, 종료 값, 애니메이션 재생 구간(비율), {키프레임}]
        videoImageCount: 300,
        imageSequence: [0, 299], 
        canvas_opacity: [1, 0, { start: 0.9, end: 1 }],
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
        messageA: $('#scroll-section-2 .a'),
        messageB: $('#scroll-section-2 .b'),
        messageC: $('#scroll-section-2 .c'),
        pinB: $('#scroll-section-2 .b .pin'),
        pinC: $('#scroll-section-2 .c .pin'),
        canvas: $("#video-canvas-1"),
        context: $("#video-canvas-1").getContext('2d'),
        videoImages: [],
      },
      values: {
        videoImageCount: 960,
        imageSequence: [0, 959], 
        canvas_opacity_in: [0, 1, { start: 0, end: 0.1 }],
        canvas_opacity_out: [1, 0, { start: 0.95, end: 1 }],
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
        canvasCaption: $('.canvas-caption'),
        canvas: $('.image-blend-canvas'),
        context: $('.image-blend-canvas').getContext('2d'),
        imagePath: [ "../images/blend-image-1.jpg", "../images/blend-image-2.jpg" ]
      },
      values: {
        images: [],
        // 화면크기를 알 수 없기에, 스크롤 시 계산해서 갱신
        rect1X: [ 0, 0, { start: 0, end: 0 }], 
        rect2X: [ 0, 0, { start: 0, end: 0 }],
        blendHeight: [ 0, 0, { start: 0, end: 0 }],
        canvasScale: [ 0, 0, { start: 0, end: 0 }],
        canvasCaption_opacity: [ 0, 1, { start: 0, end: 0 }],
        canvasCaption_translateY: [ 20, 0, { start: 0, end: 0 }],
        rectStartY: 0,
      }
    }
  ]
  
  // 캔버스 이미지 저장
  function setCanvasImages() { 
    for (let i = 0; i < sceneInfo[0].values.videoImageCount; i++) {
      const img = new Image();
      img.src = `./video/001/IMG_${6726 + i}.JPG`;
      sceneInfo[0].elms.videoImages.push(img)
    }
    for (let i = 0; i < sceneInfo[2].values.videoImageCount; i++) {
      const img = new Image();
      img.src = `./video/002/IMG_${7027 + i}.JPG`;
      sceneInfo[2].elms.videoImages.push(img)
    }
    for (let i = 0; i < sceneInfo[3].elms.imagePath.length; i++) {
      const img = new Image();
      img.src = sceneInfo[3].elms.imagePath[i];
      sceneInfo[3].values.images.push(img)
    }
  }

  // 네비게이션 sticky 적용
  function checkMenu() {
    if (yOffset > 44) {
      document.body.classList.add('local-nav-sticky');
    } else {
      document.body.classList.remove('local-nav-sticky');
    }
  }

  // 각 섹션의 높이 세팅
  function setLayout() {
    for (let i = 0; i < sceneInfo.length; i++) {
      if (sceneInfo[i].type === 'sticky') {
        sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;
      } else { 
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

    // 캔버스 크기를 브라우저 크기에 맞추기
    const heightRatio = window.innerHeight / 1080;
    sceneInfo[0].elms.canvas.style.transform = `translate3d(-50%, -50%, 0) scale(${heightRatio})`;
    sceneInfo[2].elms.canvas.style.transform = `translate3d(-50%, -50%, 0) scale(${heightRatio})`;
  }

  // 스크롤 시 실행 될 핸들러
  function scrollLoop() {
    enterNewScene = false;
    prevScrollHeight = 0; // prevScrollHeight 값이 누적되지 않도록 초기화
    for (let i = 0; i < currentScene; i++) {
      prevScrollHeight += sceneInfo[i].scrollHeight;
    }
    
    // 애니메이션 활성화 섹션 찾기
    if (delayedYOffset > prevScrollHeight + sceneInfo[currentScene]?.scrollHeight) { // 스크롤 내릴 때
      enterNewScene = true;
      currentScene++;
      document.body.setAttribute("id", `show-scene-${currentScene}`);
    } 

    if (delayedYOffset < prevScrollHeight) { // 스크롤 올릴 때
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
   * 현재 스크롤 구간에 따른 애니메이션 비율 계산
   * @param {object} values 애니메이션 값
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
    
    if (values.length === 3) { // 전체 구각이 아닌 해당 구간에 있을 경우
      const { start, end } = values[2];
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
      // console.log(rv)
    } else {
      rv = scrollRatio * (to - from) + from;
    }
    return rv;
  }

  // 애니메이션 진행 핸들러
  function playAnimation() {
    const elms = sceneInfo[currentScene]?.elms;
    const values = sceneInfo[currentScene]?.values;
    const currentYOffset = yOffset - prevScrollHeight; // 현재 스크롤 비율 = 전체 스크롤 높이 / 현재 섹션 스크롤 높이
    const scrollHeight = sceneInfo[currentScene].scrollHeight; // 현재 섹션 스크롤 높이
    const scrollRatio = currentYOffset / scrollHeight; // 현재 스크롤 비율
    // console.log(currentScene, currentYOffset)

    // 해당되는 구간 애니메이션을 재생시킨다. (나머지 애니메이션은 정지) 
    if (currentScene === 0) {
      // 비디오 시퀀시
      // let sequence = Math.round(calcValues(values.imageSequence, currentYOffset));
      // elms.videoImages[sequence] && elms.context.drawImage(elms.videoImages[sequence], 0, 0, 1920, 1080);
      elms.canvas.style.opacity = calcValues(values.canvas_opacity, currentYOffset);

      if (scrollRatio <= 0.22) { // in
        elms.messageA.style.opacity = calcValues(values.messageA_opacity_in, currentYOffset);
        elms.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_in, currentYOffset)}%, 0)`;
      } else { // out
        elms.messageA.style.opacity = calcValues(values.messageA_opacity_out, currentYOffset);
        elms.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_out, currentYOffset)}%, 0)`;
      }

      if (scrollRatio <= 0.42) { // in
        elms.messageB.style.opacity = calcValues(values.messageB_opacity_in, currentYOffset);
        elms.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_in, currentYOffset)}%, 0)`;
      } else { // out
        elms.messageB.style.opacity = calcValues(values.messageB_opacity_out, currentYOffset);
        elms.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_out, currentYOffset)}%, 0)`;
      }

      if (scrollRatio <= 0.62) { // in
        elms.messageC.style.opacity = calcValues(values.messageC_opacity_in, currentYOffset);
        elms.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_in, currentYOffset)}%, 0)`;
      } else { // out
        elms.messageC.style.opacity = calcValues(values.messageC_opacity_out, currentYOffset);
        elms.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_out, currentYOffset)}%, 0)`;
      }

      if (scrollRatio <= 0.82) { // in
        elms.messageD.style.opacity = calcValues(values.messageD_opacity_in, currentYOffset);
        elms.messageD.style.transform = `translate3d(0, ${calcValues(values.messageD_translateY_in, currentYOffset)}%, 0)`;
      } else { // out
        elms.messageD.style.opacity = calcValues(values.messageD_opacity_out, currentYOffset);
        elms.messageD.style.transform = `translate3d(0, ${calcValues(values.messageD_translateY_out, currentYOffset)}%, 0)`;
      }
    }
    else if (currentScene === 1) {

    }
    else if (currentScene === 2) {
      // let sequence2 = Math.round(calcValues(values.imageSequence, currentYOffset));
      // elms.videoImages[sequence2] && elms.context.drawImage(elms.videoImages[sequence2], 0, 0, 1920, 1080);

      if (scrollRatio <= 0.5) {
        elms.canvas.style.opacity = calcValues(values.canvas_opacity_in, currentYOffset);
      } else {
        elms.canvas.style.opacity = calcValues(values.canvas_opacity_out, currentYOffset);
      }

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

      // 현재 씬 3에서 초기 캔버스 렌더링 로직 미리 시작
      if (scrollRatio > 0.9) {
        const elms = sceneInfo[3]?.elms;
        const values = sceneInfo[3]?.values;

        // 캔버스 가로/세로 모두 꽉 채우기 위해 계산 필요.
        const widthRatio = window.innerWidth / elms.canvas.width; // 현재 브라우저 크기에 따른 캔버스 너비 비율
        const heightRatio = window.innerHeight / elms.canvas.height; // 현재 브라우저 크기에 따른 캔버스 높이 비율
        
        let canvasScaleRatio;
        if (widthRatio <= heightRatio) canvasScaleRatio = heightRatio; // 캔버스보다 브라우저 창이 홀쭉한 경우
        else canvasScaleRatio = widthRatio; // 캔버스보다 브라우저 창이 납작한 경우
        
        // 첫번째 사진 초기 렌더링
        elms.canvas.style.transform = `scale(${canvasScaleRatio})`;
        elms.context.fillStyle = 'white';
        elms.context.drawImage(values.images[0], 0, 0);

        const recalculatedInnerWidth = document.body.offsetWidth / canvasScaleRatio;
        const recalculatedInnerHeight = window.innerHeight / canvasScaleRatio;

        const whiteRectWidth = recalculatedInnerWidth * 0.15 // 상대 크기로 (innerWidth의 15%)
        values.rect1X[0] = (elms.canvas.width - recalculatedInnerWidth) / 2;
        values.rect1X[1] = values.rect1X[0] - whiteRectWidth; // 화면 밖으로 나가야 함.
        values.rect2X[0] = (values.rect1X[0] + recalculatedInnerWidth) - whiteRectWidth;
        values.rect2X[1] = values.rect2X[0] + whiteRectWidth;
        
        // 좌우 흰색 박스 그리기
        elms.context.fillRect(values.rect1X[0], 0, whiteRectWidth, elms.canvas.height)
        elms.context.fillRect(values.rect2X[0], 0, whiteRectWidth, elms.canvas.height)
      }
    }
    else if (currentScene === 3) {
      // 캔버스 가로/세로 모두 꽉 채우기 위해 계산 필요.
      const widthRatio = window.innerWidth / elms.canvas.width; // 현재 브라우저 크기에 따른 캔버스 너비 비율
      const heightRatio = window.innerHeight / elms.canvas.height; // 현재 브라우저 크기에 따른 캔버스 높이 비율
      
      let canvasScaleRatio;
      if (widthRatio <= heightRatio) canvasScaleRatio = heightRatio; // 캔버스보다 브라우저 창이 홀쭉한 경우
      else canvasScaleRatio = widthRatio; // 캔버스보다 브라우저 창이 납작한 경우
      
      // 첫번째 사진 초기 렌더링
      elms.canvas.style.transform = `scale(${canvasScaleRatio})`;
      elms.context.fillStyle = 'white';
      elms.context.drawImage(values.images[0], 0, 0);

      // 캔버스 사이즈에 맞춰 가정한 innerWidth와 innerHeight
      // window.innerWidth -> 스크롤 바 포함된 총 크기임
      const recalculatedInnerWidth = document.body.offsetWidth / canvasScaleRatio;
      const recalculatedInnerHeight = window.innerHeight / canvasScaleRatio;
      // console.log(recalculatedInnerWidth, recalculatedInnerHeight) 
      
      // 스크롤 시 기준값 한 번 저장 (스크롤 할 떄마다 기준값이 바뀌면 안됨)
      if (values.rectStartY === 0) { // 좌우 흰색 박스 애니메이션 시작 시작점 - 종료점 구간 설정
        // values.rectStartY = elms.canvas.getBoundingClientRect().top; // 스크롤 속도에 따라 결과가 반환됨 (고정되지않고 계속 바뀌는것이 문제)
        // 3번 구간이 시작 될 때 정확한 스크롤 값을 구하기 위함
        // offsetTop 기준점을 바쑬 수 있음 - 위치 기준을  내 부모 기준으로 나의 위치를 가져오기 위해 CSS position: relative 추가
        // 캔버스는 트랜스폼 스케일로 줄어들어 있음, 트랜스폼은 자기자신 크기 요소에만 영향을 끼침 + 스케일 비율이 적용된 크기까지 포함해야함
        const scaledCanvasHeight = elms.canvas.height * canvasScaleRatio; // 스케일 적용된 캔버스 높이 크기
        values.rectStartY = elms.canvas.offsetTop + (elms.canvas.height - scaledCanvasHeight) / 2;
        values.rect1X[2].start = (window.innerHeight / 2) / scrollHeight;
        values.rect2X[2].start = (window.innerHeight / 2) / scrollHeight;
        values.rect1X[2].end = values.rectStartY / scrollHeight;
        values.rect2X[2].end = values.rectStartY / scrollHeight;
        // console.log(values.rectStartY)
      }

      const whiteRectWidth = recalculatedInnerWidth * 0.15 // 상대 크기로 (innerWidth의 15%)
      values.rect1X[0] = (elms.canvas.width - recalculatedInnerWidth) / 2;
      values.rect1X[1] = values.rect1X[0] - whiteRectWidth; // 화면 밖으로 나가야 함.
      values.rect2X[0] = (values.rect1X[0] + recalculatedInnerWidth) - whiteRectWidth;
      values.rect2X[1] = values.rect2X[0] + whiteRectWidth;
      // console.log(values.rect1X, values.rect2X)

      // 좌우 흰색 박스 그리기
      elms.context.fillRect(calcValues(values.rect1X, currentYOffset), 0, whiteRectWidth, elms.canvas.height)
      elms.context.fillRect(calcValues(values.rect2X, currentYOffset), 0, whiteRectWidth, elms.canvas.height)
      // elms.context.fillRect(values.rect1X[0], 0, whiteRectWidth, elms.canvas.height)
      // elms.context.fillRect(values.rect2X[0], 0, whiteRectWidth, elms.canvas.height)

      let step = 0;
      if (scrollRatio < values.rect1X[2].end) { // 캔버스가 브라우저 상단에 닿기 전
        step = 1;
        // console.log(1)
        elms.canvas.classList.remove('sticky');
      } else { // 캔버스가 브라우저 상단에 닿은 후 - 이미지 블렌드 시작
        step = 2;
        // console.log(2)
        elms.canvas.classList.add('sticky');
        elms.canvas.style.top = `${-(elms.canvas.height - (elms.canvas.height * canvasScaleRatio)) / 2}px`; // 캔버스 트랜스폼 스케일 CSS 때문에 top으로 땡겨줘야함

        // blendHeight: [ 0, 0, { start: 0, end: 0 }] - 블렌드 이미지 (바다 사진)
        values.blendHeight[0] = 0;
        values.blendHeight[1] = elms.canvas.height; 
        // 블렌드 이미지 애니메이션 키프레임 설정
        values.blendHeight[2].start = values.rect1X[2].end; 
        values.blendHeight[2].end = values.blendHeight[2].start + 0.2; // 애니메이션 속도 설정 (0 ~ 1까지) 더하기, 20% 구간만큼 재생 설정
        
        // 블렌드 이미지 높이 애니메이션 진행 값 반환
        const blendHeight = calcValues(values.blendHeight, currentYOffset);

        // y축과 높이의 변화가 필요함 (X와 너비는 고정)
        elms.context.drawImage(
          values.images[1], 
          0, elms.canvas.height - blendHeight, elms.canvas.width, blendHeight,
          0, elms.canvas.height - blendHeight, elms.canvas.width, blendHeight
        );

        // 크기 스케일 조절 시작
        if (scrollRatio > values.blendHeight[2].end) {
          // console.log('크기 조절 시작');
          values.canvasScale[0] = canvasScaleRatio;
          values.canvasScale[1] = document.body.offsetWidth / (elms.canvas.width * 1.5);
          values.canvasScale[2].start = values.blendHeight[2].end;
          values.canvasScale[2].end = values.canvasScale[2].start + 0.2;
          // console.log(values.canvasScale)
          elms.canvas.style.transform = `scale(${calcValues(values.canvasScale, currentYOffset)})`;
          elms.canvas.style.marginTop = 0;
        }

        // 크기 스케일 조절이 종료 된 후
        if (
          scrollRatio > values.canvasScale[2].end &&
          values.canvasScale[2].end > 0
        ) {
          // 스케일 하면서 중심에 와야하기 때문에 위치가 중간에 와야함
          elms.canvas.classList.remove('sticky');
          elms.canvas.style.marginTop = `${scrollHeight * 0.4}px`;

          values.canvasCaption_opacity[2].start = values.canvasScale[2].end;
          values.canvasCaption_opacity[2].end = values.canvasCaption_opacity[2].start + 0.1;
          elms.canvasCaption.style.opacity = calcValues(values.canvasCaption_opacity, currentYOffset);

          values.canvasCaption_translateY[2].start = values.canvasScale[2].end;
          values.canvasCaption_translateY[2].end = values.canvasCaption_opacity[2].end;
          elms.canvasCaption.style.transform = `translate3D(0, ${calcValues(values.canvasCaption_translateY, currentYOffset)}, 0)`;
        } else {
          elms.canvasCaption.style.opacity = values.canvasCaption_opacity[0];
        }
      }
    }
  }
  
  // requestAnimationFrame Loop
  function loop() {
    delayedYOffset = delayedYOffset + (yOffset - delayedYOffset) * acc; // 감속이 있는 스크롤 값

    const currentYOffset = delayedYOffset - prevScrollHeight; // 현재 스크롤 비율 = 전체 스크롤 높이 / 현재 섹션 스크롤 높이
    
    if (!enterNewScene) {
      if (currentScene === 0 || currentScene === 2) {
        const { elms, values } = sceneInfo[currentScene];
        let sequence = Math.round(calcValues(values.imageSequence, currentYOffset));
        elms.videoImages[sequence] && elms.context.drawImage(elms.videoImages[sequence], 0, 0, 1920, 1080);
      } 
    }

    rafId = requestAnimationFrame(loop);

    // console.log('loop');
    if (Math.abs(yOffset - delayedYOffset) < 1) {
      cancelAnimationFrame(rafId);
      rafState = false;
    }
  }

  // window.addEventListener('DOMContentLoaded', setLayout); // HTML 돔 구조 로드가 끝나면 실행
  window.addEventListener('load', () => {
    setLayout();
    const canvas0Image = sceneInfo[0].elms.videoImages[0] // 초기화 작업 
    sceneInfo[0].elms.context.drawImage(canvas0Image, 0, 0);
  }); 

  window.addEventListener('resize', setLayout);

  window.addEventListener('scroll', (ev) => {
    yOffset = window.scrollY;
    checkMenu()
    scrollLoop();

    window.addEventListener('scroll', () => {
			if (!rafState) {
				rafId = requestAnimationFrame(loop);
				rafState = true;
			}
		});
  });
  
  setCanvasImages();
  console.log(sceneInfo);
})();