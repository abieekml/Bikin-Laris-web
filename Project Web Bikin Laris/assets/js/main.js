
const state = {
  ig:     'https://www.instagram.com/bikinlaris.digital/',
  wa:     '6281919573190',
  tiktok: 'https://www.tiktok.com/@bikinlaris.digital?_r=1&_t=zs-95ljznvvpkq',
  gmap:   'https://maps.app.goo.gl/UjdAfbe2yXpU6PvZA',
  form:   'https://forms.gle/o14WWeHmtNGAG3c36',
};

const WA_TEXT = 'Haloo%20Admin%20Saya%20Mau%20Order%20Jasa%20Digitalisasi%20UMKM';

function waURL(num) {
  return `https://wa.me/${num}?text=${WA_TEXT}`;
}

function openSocial(platform) {
  let url = state[platform];

  if (platform === 'wa') {
    url = waURL(state.wa);
  }

  if (url) {
    window.open(url, '_blank');
  } else {
    console.error('Link tidak ditemukan:', platform);
  }
}
