
const API_URL = 'https://script.google.com/macros/s/AKfycbwmeveXSc0ihOnOgQhtX5Mtaj1QWiATUlGXEIJwlBAgl_yGe7ULgjpVfYwC8IWiOS4/exec';

function stageIndex(count, thresholds) {
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (count >= thresholds[i]) return i;
  }
  return 0;
}

async function fetchData() {
  try {
    const res = await fetch(API_URL + '?action=count', {cache:'no-store'});
    const data = await res.json();
    return data;
  } catch (e) {
    console.error(e);
    return {count:0, respondents:0, thresholds:[0]};
  }
}

async function init() {
  // init Swiper
  const swiper = new Swiper('.swiper', {
    loop: false,
    pagination: { el: '.swiper-pagination', type: 'progressbar' },
  });

  async function update() {
    const {count, respondents, thresholds=[0]} = await fetchData();
    document.getElementById('totalDialog').textContent = count;
    document.getElementById('totalPeople').textContent = respondents;
    const idx = stageIndex(count, thresholds);
    swiper.slideTo(idx, 0);
  }
  await update();
  setInterval(update, 60000);
}

init();
