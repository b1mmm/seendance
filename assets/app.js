/**
 * Minimal random video feed (GitHub Pages) — FULL app.js
 * Requirements:
 * - NO like button, NO user info, NO time, NO filename shown (except consent button "Like")
 * - Random shuffle videos on each visit
 * - Random TikTok-style hook title from BANK per video
 * - Autoplay muted; tap to pause/play; mute toggle
 * - Gift icon redirects to google.com
 * - Collect minimal session analytics (non-identifying) and send to Worker on session end
 *   Endpoint: POST https://seedance.testmail12071997.workers.dev/api/session
 *   Uses sendBeacon/keepalive
 *
 * Extra (Fix nhanh để “vào là có log”):
 * - When user clicks Like (consent), send a quick event "consent_ok" immediately (keepalive)
 */

const WORKER_BASE = "https://seedance.testmail12071997.workers.dev";
const SESSION_ENDPOINT = `${WORKER_BASE}/api/session`;
/**
const RAW_LIST = [
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example1.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example2.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example3.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example4.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example5.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example6.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example7.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example8.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example9.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example10.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example11.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example12.mp4"
];
 */
const RAW_LIST = [
  "https://video.xx.fbcdn.net/o1/v/t2/f2/m366/AQP4VXBLefooERws2IkstBzmuqrHwYCopBxiB8yHWGcgEqtrXPGlFVUapjryE-JyWrZapOo4EJaKgo_CFO8-TGsvqa9fi6xYx6zGDQnJOAIsig.mp4?_nc_cat=109&_nc_oc=AdmJXB2YmkrFENjjnrVgJvJRtxUr4mLlW8Li_Xi_h0vCilnAGxVCqooQAToqxvFHQek&_nc_sid=5e9851&_nc_ht=video.fsgn8-3.fna.fbcdn.net&_nc_ohc=tj9go5At0XIQ7kNvwErX-He&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoxNzAyODYzOTg0NDIxMDQ3LCJhc3NldF9hZ2VfZGF5cyI6MSwidmlfdXNlY2FzZV9pZCI6MTAxMjEsImR1cmF0aW9uX3MiOjExLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=c7ea1428073d0db0&_nc_vs=HBksFQIYRWZiX2VwaGVtZXJhbC9EQzREMTAyQTU3QzczMjE5NzM4NzdBNDM3MTc2OEE5M19tdF8xX3ZpZGVvX2Rhc2hpbml0Lm1wNBUAAsgBEgAVAhhAZmJfcGVybWFuZW50LzU3NDA3MTY2QTlBRjU5RTlBNDJGRUMwNjI3QTMwRjg2X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbuoqOu3a-GBhUCKAJDMywXQCZEGJN0vGoYGWRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHARAHUCZZKeAQA&_nc_gid=9Q1fz-3LuAoGAVo9tCHWlQ&_nc_zt=28&oh=00_AfvHqGQ1R5_93K-5s125UKfAsMk2OQFHV8NLyCntUj8R7Q&oe=69A0A46B&bitrate=2108467&tag=dash_h264-basic-gen2_720p",
  "https://video.xx.fbcdn.net/o1/v/t2/f2/m366/AQMkeiJlHwd8k1VsOeIbnOTUTyRfoACRmVD67MDYR_8iP5dKEVgwySLk8tqYv6pczJDcc8OtnoqTYJCih5Y6KcXqloYFJtN2z9JsDbhae4FSnQ.mp4?_nc_cat=100&_nc_oc=Adl78cv0vRyl92GYiJGhwTzZbDa6h_9DpFaHIXp2nSDT_AWJol5V7HujTYqf_ZbLNvA&_nc_sid=5e9851&_nc_ht=video.fdad3-4.fna.fbcdn.net&_nc_ohc=d_mngr4wRM4Q7kNvwGPPDF3&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuNzIwLmRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHAiLCJ4cHZfYXNzZXRfaWQiOjIzMjYxMzUzMjEyMzcxNTQsImFzc2V0X2FnZV9kYXlzIjo1MSwidmlfdXNlY2FzZV9pZCI6MTAxMjEsImR1cmF0aW9uX3MiOjE0LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=b744adceb6e63a45&_nc_vs=HBksFQIYRWZiX2VwaGVtZXJhbC83NzQ5NEJFRDBEM0I5NkE2MkUzMjdDOUMzMDkxN0ZCMl9tdF8xX3ZpZGVvX2Rhc2hpbml0Lm1wNBUAAsgBEgAVAhhAZmJfcGVybWFuZW50LzVGNENGMDRGQzc2NUZGQTgzMDI0OEM1RjQ2OEE4Rjk4X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbE2qzY8uahCBUCKAJDMywXQCzMzMzMzM0YGWRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHARAHUCZZKeAQA&_nc_gid=ysh9pOQmkRaOhFxVAV7VgQ&_nc_zt=28&oh=00_Aftv-cVgxZquFxeeR1K4cY3kcQWvPrH2hidpqRm2df3UXg&oe=69A09F44&bitrate=1631808&tag=dash_h264-basic-gen2_720p",
  "https://video.xx.fbcdn.net/o1/v/t2/f2/m412/AQOgUtBVUnauvy2Wm7VFbikIEHrcwLbAsUoSqirH-gVDhuuVGz4ui1s_bhYYCiUrUs7zkZdQkGKbO39EEC2Sc4n3-qvQxPyk4Pz3DxT7CA.mp4?_nc_cat=105&_nc_oc=AdlS_IjSnTRN1BCl2q_9joTXdaA9eweiwApKZof9pvO4MsHJopKqvr3lpH5HM3ITPDI&_nc_sid=8bf8fe&_nc_ht=video.fsgn5-6.fna.fbcdn.net&_nc_ohc=kXp0WLy50ikQ7kNvwGKQ8kg&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuMzYwLnN2ZV9zZCIsInhwdl9hc3NldF9pZCI6MTM3MTY5MTY1NDUxMDg3MCwiYXNzZXRfYWdlX2RheXMiOjg4LCJ2aV91c2VjYXNlX2lkIjoxMDEyMSwiZHVyYXRpb25fcyI6MTIsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&_nc_gid=Ko1B7PK-fVigC2soXZEP3A&_nc_zt=28&oh=00_AfvDgZgLJyGnZZvDEezCWW7ltFHfT17XymoqY3-qIG_73w&oe=69A0BF89&bitrate=193847&tag=sve_sd",
  "https://video.xx.fbcdn.net/o1/v/t2/f2/m366/AQMj-gs4XDoV-Vi1P7HULEIF2LDV9C8owAZboDVd_0mlMWdfT35qhsWefK4zJ8Qj_muK_niS6yxu5JzZIAvGYOQQA9B_fidini43cNBiLOmFVQ.mp4?_nc_cat=105&_nc_oc=AdnChMV9PFrYTvj2HFpPsUJUwkpzj3__denHVGLX1TV5sS36jy4J2JZupq5C8V8qEjY&_nc_sid=5e9851&_nc_ht=video.fdad3-4.fna.fbcdn.net&_nc_ohc=vOi1EaaG0eoQ7kNvwF32KJF&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuNzIwLmRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHAiLCJ4cHZfYXNzZXRfaWQiOjIwNzI5OTk0OTY4NTc5MDEsImFzc2V0X2FnZV9kYXlzIjo5OCwidmlfdXNlY2FzZV9pZCI6MTAxMjEsImR1cmF0aW9uX3MiOjE1LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=31302883bfe96235&_nc_vs=HBksFQIYRWZiX2VwaGVtZXJhbC8zMjQzMUZDMjhCQjhBM0I2RTIyMzUzRkREMjU0ODQ4NF9tdF8xX3ZpZGVvX2Rhc2hpbml0Lm1wNBUAAsgBEgAVAhhAZmJfcGVybWFuZW50L0M2NDk0MzM5NkI4Rjc3NTJCODFFNTlERDY1MzFEM0JFX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACba5InqudiuBxUCKAJDMywXQC4Q5WBBiTcYGWRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHARAHUCZZKeAQA&_nc_gid=u4lRUQIjGky6Wx1F73HIMQ&_nc_zt=28&oh=00_Afuv0F9DDFFUaH7IYyjEc-X-oQYELaIBIGA-ZdIreh4G9w&oe=69A0BD63&bitrate=2466789&tag=dash_h264-basic-gen2_720p",
  "https://video.xx.fbcdn.net/o1/v/t2/f2/m412/AQP7PXHiwsLn1l0gtzrEGc9GmVfNbN8AGcqAAAULWjYXOhH7expAJBuAzzBtAYynuPmRdssqFb5pxAXPRnxAF4GGrtlHOf7i5UP8uvWizw.mp4?_nc_cat=106&_nc_oc=Adn7adqLEMPl51wrh7waiGOoC0heoxDukCALy9wtvHqG1IRoEVzE1PStKOXxy3pUWhU&_nc_sid=8bf8fe&_nc_ht=video.fsgn5-13.fna.fbcdn.net&_nc_ohc=uC6hZ2dK25AQ7kNvwEwV61d&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuMzYwLnN2ZV9zZCIsInhwdl9hc3NldF9pZCI6MTg0NTMwMjAzNjA3NjU5MCwiYXNzZXRfYWdlX2RheXMiOjEwOCwidmlfdXNlY2FzZV9pZCI6MTAxMjEsImR1cmF0aW9uX3MiOjksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&_nc_gid=iPRcOFO9epErL124C3SGGw&_nc_zt=28&oh=00_AfvTRtpJq7G6TKbUQrWaIXVPsa3XgtElN6aC7xmS6la22w&oe=69A0AED0&bitrate=513050&tag=sve_sd",
  "https://video.xx.fbcdn.net/o1/v/t2/f2/m412/AQOQMRZOv9DZpbm9mLsCS_KuyQnm4CK2TMOASgb_ydsQ-3YfcTyfvohZGiFd_gRtmC1lLlI_vXc0VSjRBkvjJllg1d39bTAm_eY8HjwAyg.mp4?_nc_cat=111&_nc_oc=AdniyBaXx5tl7uS3Pqxa9OUdAYLTws0n36OLdSyseK-iJ6-gZadfz2NK-GN5PxKvI_o&_nc_sid=8bf8fe&_nc_ht=video.fhan5-10.fna.fbcdn.net&_nc_ohc=Oh-d2RZpHo0Q7kNvwHq_sxg&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuMzYwLnN2ZV9zZCIsInhwdl9hc3NldF9pZCI6MTE0OTc5MzY4Mzc1MDQ5MSwiYXNzZXRfYWdlX2RheXMiOjEzNywidmlfdXNlY2FzZV9pZCI6MTAxMjEsImR1cmF0aW9uX3MiOjEwLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&_nc_gid=u-MgwdHHHW9xXw7uWQmuBg&_nc_zt=28&oh=00_AftXoGXhTFy8ZcNS1L5oO9JKJGo9P-QQ3YyPTcy2xQv6kw&oe=69A0CC03&bitrate=586676&tag=sve_sd",
  "https://video.xx.fbcdn.net/o1/v/t2/f2/m366/AQPGETo8R2jISNli34WGl3SjupFoGK6YHz70McSoCu4U9EXG6FCe-3a3tQDGhixWKVLGriHm6GfQooLYvDBClC4RfInjFS34VIP0l3IyYB9-sg.mp4?_nc_cat=107&_nc_oc=AdndMoYVxrwEYp4n8uJbhk1eN03xRa1gxfBa2hKCy3lmtAFybX3TNbt3miukk6QJgx8&_nc_sid=5e9851&_nc_ht=video.fthd1-1.fna.fbcdn.net&_nc_ohc=WQSZ2a4l_IIQ7kNvwGwF9dN&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuNzIwLmRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHAiLCJ4cHZfYXNzZXRfaWQiOjI2NjEzMzA5NjA4NzI4NjEsImFzc2V0X2FnZV9kYXlzIjoxNDMsInZpX3VzZWNhc2VfaWQiOjEwMTIxLCJkdXJhdGlvbl9zIjoxNCwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&ccb=17-1&vs=f5bd9f8e93a227d3&_nc_vs=HBksFQIYRWZiX2VwaGVtZXJhbC9FNTQ1RUFDMjdGMDc1REFFQTg1REIxMjJBQ0QxN0Q4Q19tdF8xX3ZpZGVvX2Rhc2hpbml0Lm1wNBUAAsgBEgAVAhhAZmJfcGVybWFuZW50Lzc2NDdEMjJCOUYzRkZBNjc0Mzc5MUIxQTBFNTI4M0E2X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACa61uvo7J26CRUCKAJDMywXQCyZmZmZmZoYGWRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHARAHUCZZKeAQA&_nc_gid=tPEKAPWTBI0oLnogNWN7tg&_nc_zt=28&oh=00_Afs-drrixyOFmXSZYSf_ObqV7Dg26NwNJ9TkdEAGVXCz9g&oe=69A0D0D5&bitrate=2023943&tag=dash_h264-basic-gen2_720p",
  "https://video.xx.fbcdn.net/o1/v/t2/f2/m412/AQObGVeYoiq7ho-DX34eP0K9S3ffJymvon4tA8M3KxKDEps86Majqdz07Hm7T8KYu6i7126VojUXwbPaVUtNYu8JpsnL4vLid9prxkVuGw.mp4?_nc_cat=111&_nc_oc=AdnfKA7xx1T63dJyXd7oOPpE4jhwVh8Gt2zUipXn1n7bxvc6BQkOvqMVdnJeW5wHbbo&_nc_sid=8bf8fe&_nc_ht=video.fhan14-3.fna.fbcdn.net&_nc_ohc=_mWD08sV-VsQ7kNvwF61HyQ&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuMzYwLnN2ZV9zZCIsInhwdl9hc3NldF9pZCI6Mzc1MTI0NDMzODM0NjE0NSwiYXNzZXRfYWdlX2RheXMiOjE1NSwidmlfdXNlY2FzZV9pZCI6MTAxMjEsImR1cmF0aW9uX3MiOjIwLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&_nc_gid=vqiusHvU54Qr0b65e0nn3A&_nc_zt=28&oh=00_AfuqQ06E7JehG1TNhaamC3W33MzTMNPBllY7h_abvkVFsA&oe=69A0B457&bitrate=531422&tag=sve_sd",
  "https://video.xx.fbcdn.net/o1/v/t2/f2/m366/AQM4hOgJwh-ACjaBOka90D1fbJ0H9rdPSJGTw_ypJrY8j0rV8tiurRAyFsOCV1gySP0FpFVwfdB3pR92oFJYkCuKcU4y15bmaunh60z_9w.mp4?_nc_cat=110&_nc_oc=AdnMwu2MzPZWC5HfLF1ivDv20dl-HNNq5yj474WvzCo2OlKHXkYPmIv03C7AAsImtUE&_nc_sid=8bf8fe&_nc_ht=video.fhan4-4.fna.fbcdn.net&_nc_ohc=P_jLXDet3gwQ7kNvwGyGGVV&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuMzYwLnN2ZV9zZCIsInhwdl9hc3NldF9pZCI6ODAyMzgyNDE1NTgwMTIzLCJhc3NldF9hZ2VfZGF5cyI6MTU2LCJ2aV91c2VjYXNlX2lkIjoxMDEyMSwiZHVyYXRpb25fcyI6OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&ccb=17-1&_nc_gid=GNb2tRUTtvN7YJgklmJXow&_nc_zt=28&oh=00_Afv3806p0nBW9MnZoIQlfyxUgJrPAkLxswbYAMQ8CC0bJw&oe=69A0D3E4&bitrate=358288&tag=sve_sd"
];

const TITLE_BANK = [
  "ĐỪNG LƯỚT! Xem tới cuối là hiểu 😳",
  "ỦA CÁI GÌ VẬY TRỜI… 😱",
  "Cảnh này mà lên TikTok là cháy 🔥",
  "Nhìn 3 giây là dính…",
  "Cú plot twist làm mình đứng hình 😵",
  "Ai nghĩ ra cái này vậy trời 😂",
  "Chỉ 1 pha thôi mà ‘đỉnh’ thật sự!",
  "Đoạn này ai cũng xem lại 2 lần 😭",
  "Coi xong là muốn thử liền!",
  "Không ngờ nó lại ra thế này…",
  "Mượt kiểu điện ảnh luôn 😮‍💨",
  "Cảnh ‘ảo’ nhất hôm nay đây!",
  "Chốt đơn vibe này ngay!",
  "Tự nhiên nổi da gà…",
  "Cảnh này dựng quảng cáo là auto win!"
];

// ---------- helpers ----------
function normalizeToUrl(item) {
  return (item || "").toString().trim();
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function now() { return Date.now(); }

function muteIcon(muted) {
  return muted
    ? `<svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M11 5L6 9H3v6h3l5 4V5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M23 9l-6 6M17 9l6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`
    : `<svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M11 5L6 9H3v6h3l5 4V5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M15 9a4 4 0 0 1 0 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
}

// ---------- DOM ----------
const feedEl = document.getElementById("feed");
const captionEl = document.getElementById("caption");
const toastEl = document.getElementById("toast");
const btnMute = document.getElementById("btnMute");
const btnGift = document.getElementById("btnGift");

// Gift redirect
if (btnGift) {
  btnGift.addEventListener("click", () => {
    window.location.href = "https://google.com";
  });
}

function toast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 900);
}

// ---------- Session analytics (minimal) ----------
function getUID() {
  const key = "vid_uid";
  let v = localStorage.getItem(key);
  if (!v) {
    v = (crypto?.randomUUID?.() || `u_${Math.random().toString(16).slice(2)}_${Date.now()}`);
    localStorage.setItem(key, v);
  }
  return v;
}

function getOrCreateSessionId() {
  const key = "vid_session_id";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = (crypto?.randomUUID?.() || `s_${Math.random().toString(16).slice(2)}_${Date.now()}`);
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

const UID = getUID();
const SESSION_ID = getOrCreateSessionId();

const session = {
  sid: SESSION_ID,
  uid: UID,
  startedAt: now(),
  endedAt: null,
  durationMs: 0,
  videosSeen: 0,
  videoIdsSeen: [],
  activeVideoId: null,
  watchMsByVideo: {},  // {id: ms}
  lastTickAt: now(),
  muted: true,
  ref: document.referrer || "",
  url: location.href,
  lang: navigator.language || "",
  tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
  screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
  ua: (navigator.userAgent || "").slice(0, 220),
};

function markVideoSeen(feedId) {
  if (!feedId) return;
  if (!session.videoIdsSeen.includes(feedId)) {
    session.videoIdsSeen.push(feedId);
    session.videosSeen = session.videoIdsSeen.length;
  }
}

function tickWatchTime() {
  const t = now();
  const dt = Math.max(0, t - session.lastTickAt);
  session.lastTickAt = t;

  if (document.visibilityState !== "visible") return;
  const vid = session.activeVideoId;
  if (!vid) return;

  session.watchMsByVideo[vid] = (session.watchMsByVideo[vid] || 0) + dt;
}
setInterval(tickWatchTime, 1000);

// ---------- Quick log helper (send immediately on consent) ----------
function sendQuickEvent(eventName) {
  const payload = {
    sid: SESSION_ID,
    uid: UID,
    event: eventName,
    ts: Date.now(),
    url: location.href,
    ref: document.referrer || "",
    lang: navigator.language || "",
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    ua: (navigator.userAgent || "").slice(0, 220),
  };

  const body = JSON.stringify(payload);

  // Prefer keepalive fetch for immediate event
  try {
    fetch(SESSION_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true
    }).catch(() => {});
  } catch {}
}

// ---------- Consent (minimal, 1-time) ----------
function ensureConsent() {
  const key = "vid_analytics_ok";
  if (localStorage.getItem(key) === "1") return true;

  // ✅ mini bar that hugs the Like button
  const bar = document.createElement("div");
  bar.style.cssText = `
    position:fixed;
    left:50%;
    bottom:16px;
    transform:translateX(-50%);
    z-index:9999;
  `;

  bar.innerHTML = `
    <button id="vidOk" style="
      display:inline-flex;
      align-items:center;
      justify-content:center;
      gap:6px;

      height:40px;
      padding:0 14px;

      border:2px solid #000;
      border-radius:999px;

      font-weight:900;
      font-size:14px;

      background:#fff;
      color:#000;
      cursor:pointer;

      box-sizing:border-box;
    ">
      <span>Like</span>
      <span style="font-size:16px;line-height:1">👍</span>
    </button>
  `;

  document.body.appendChild(bar);

  bar.querySelector("#vidOk").addEventListener("click", () => {
    localStorage.setItem(key, "1");
    // ✅ Fix nhanh: bấm Like là có log ngay
    sendQuickEvent("consent_ok");
    bar.remove();
  });

  return false;
}
ensureConsent();

// ---------- Feed build (random each visit) ----------
const URLS = RAW_LIST.map(normalizeToUrl);
shuffleInPlace(URLS);

const FEED = URLS.map((url, idx) => ({
  id: `v${idx + 1}`,
  url,
  title: pickRandom(TITLE_BANK),
}));

// ---------- Render feed ----------
let observer = null;
let globalMuted = true;

function setMuteAll(muted) {
  globalMuted = muted;
  session.muted = muted;
  document.querySelectorAll(".slide video").forEach(v => (v.muted = muted));
  if (btnMute) btnMute.innerHTML = muteIcon(muted);
  toast(muted ? "Muted" : "Unmuted");
}

if (btnMute) {
  btnMute.addEventListener("click", () => setMuteAll(!globalMuted));
}

function render() {
  if (!feedEl) return;
  feedEl.innerHTML = "";

  FEED.forEach(item => {
    const s = document.createElement("section");
    s.className = "slide";
    s.dataset.id = item.id;
    s.dataset.title = item.title;

    s.innerHTML = `<video playsinline muted loop preload="metadata" src="${item.url}"></video>`;

    s.addEventListener("click", () => {
      const v = s.querySelector("video");
      if (!v) return;
      if (v.paused) v.play().catch(() => {});
      else v.pause();
    });

    feedEl.appendChild(s);
  });

  const first = document.querySelector(".slide");
  if (first?.dataset?.id) {
    session.activeVideoId = first.dataset.id;
    markVideoSeen(first.dataset.id);
    if (captionEl) captionEl.textContent = first.dataset.title || "";
  }

  setupObserver();
}

function setupObserver() {
  if (observer) observer.disconnect();

  observer = new IntersectionObserver((entries) => {
    entries.forEach(async (entry) => {
      const slide = entry.target;
      const video = slide.querySelector("video");
      if (!video) return;

      if (entry.isIntersecting) {
        document.querySelectorAll(".slide video").forEach(v => {
          if (v !== video) v.pause();
        });

        const id = slide.dataset.id || null;
        if (id && id !== session.activeVideoId) {
          session.activeVideoId = id;
          markVideoSeen(id);
        }
        if (captionEl) captionEl.textContent = slide.dataset.title || "";

        try {
          video.muted = globalMuted;
          await video.play();
        } catch {}
      } else {
        video.pause();
      }
    });
  }, { root: feedEl, threshold: 0.66 });

  document.querySelectorAll(".slide").forEach(s => observer.observe(s));
}

// ---------- Send session on end ----------
function buildSessionPayload() {
  const endedAt = now();
  session.endedAt = endedAt;
  session.durationMs = Math.max(0, endedAt - session.startedAt);

  const top = Object.entries(session.watchMsByVideo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([feedId, ms]) => ({ feedId, ms }));

  return {
    sid: session.sid,
    uid: session.uid,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    durationMs: session.durationMs,
    videosSeen: session.videosSeen,
    videoIdsSeen: session.videoIdsSeen.slice(0, 50),
    topWatch: top,
    muted: !!session.muted,
    ref: session.ref,
    url: session.url,
    lang: session.lang,
    tz: session.tz,
    screen: session.screen,
    ua: session.ua,
  };
}

let sent = false;
function sendSession() {
  if (sent) return;
  sent = true;

  if (localStorage.getItem("vid_analytics_ok") !== "1") return;

  const payload = buildSessionPayload();
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(SESSION_ENDPOINT, blob);
    return;
  }

  fetch(SESSION_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  }).catch(() => {});
}

// end-of-session signals
window.addEventListener("pagehide", sendSession);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") sendSession();
});

// ---------- Init ----------
render();
setMuteAll(true);

// If you want ZERO text overlay (ultra minimal), uncomment:
// if (captionEl) captionEl.style.display = "none";
