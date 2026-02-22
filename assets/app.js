/**
 * Seedance — FULL app.js (Tap Hint UI)
 * - Tap while playing => show controls briefly then auto-hide
 * - Toggle mute => hide controls immediately
 * - Pause => show controls (fade in) and keep visible
 * - Consent Like => send quick event immediately ("consent_ok")
 * - Send session analytics on end
 */

const WORKER_BASE = "https://seedance.testmail12071997.workers.dev";
const SESSION_ENDPOINT = `${WORKER_BASE}/api/session`;

/* KEEP YOUR VIDEO URLS */

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
  "Khoan vuốt… coi cái này thử đi 😳",
  "Ủa sao tự nhiên coi mà cười hoài vậy 😂",
  "Góc này mà không coi là thiếu sót đó nha",
  "Nhìn nhẹ vậy thôi chứ cuốn dữ lắm 😮‍💨",
  "3 giây đầu chưa đủ đâu… coi tiếp đi 😭",
  "Không biết mọi người sao chứ mình dính rồi đó",
  "Cảnh này coi xong là muốn coi lại liền",
  "Ủa alo? Sao clip này coi hoài không chán",
  "Tự nhiên thấy dễ thương ngang 😳",
  "Coi chơi thôi mà ai ngờ coi tới cuối",
  "Vibe này mà coi buổi tối là hết nước chấm",
  "Ủa sao coi mà quên mất thời gian luôn vậy",
  "Đoạn này mà bỏ là tiếc lắm nha",
  "Coi tới cuối mới thấy cái hay của nó 😮‍💨",
  "Nhẹ nhàng vậy mà dính ghê",
  "Ủa sao tự nhiên thấy tim rung rung vậy trời",
  "Coi mà quên luôn mình đang lướt TikTok",
  "Không hiểu sao coi mà thấy chill ghê",
  "Cảnh này bật full màn hình coi mới đã",
  "Ai coi tới đây chắc cũng giống mình thôi 😭",
  "Thoạt nhìn bình thường mà coi kỹ lại cuốn lắm",
  "Coi lần đầu chưa đủ đâu…",
  "Ủa sao coi mà thấy dễ chịu ghê",
  "Góc này mà quay là auto dính",
  "Coi mà tự nhiên muốn lưu lại liền",
  "Không phải khoe chứ clip này coi hơi bị ổn",
  "Coi tới cuối đi rồi quay lại nói chuyện tiếp 😳",
  "Ủa sao coi mà thấy thương ngang vậy trời",
  "Nhìn vậy thôi chứ coi cuốn lắm nha",
  "Ai đang mệt coi cái này thử đi",
  "Cảnh này mà coi ban đêm là hợp vibe lắm",
  "Ủa sao coi mà thấy muốn coi tiếp nữa",
  "Không hiểu sao clip này coi hoài không ngán",
  "Coi tới đoạn sau mới thấy cái hay",
  "Vibe nhẹ nhẹ mà coi đã ghê",
  "Ủa sao coi mà tự nhiên cười vậy nè",
  "Coi mà quên luôn đang định làm gì",
  "Đoạn này mà bỏ là hơi uổng đó",
  "Coi tới cuối thử coi 😳",
  "Không biết sao chứ mình coi lại lần nữa rồi",
  "Cảnh này coi trên màn hình lớn là hết bài",
  "Ủa sao coi mà thấy yên yên vậy trời",
  "Nhìn đơn giản mà coi cuốn ghê",
  "Coi mà tự nhiên thấy dễ chịu ngang",
  "Đoạn sau mới là đoạn hay nè",
  "Coi thử đi rồi hiểu cảm giác này",
  "Ủa sao coi mà thấy thích nhẹ vậy ta",
  "Coi mà quên luôn thời gian trôi",
  "Cảnh này coi lại vẫn thấy ổn",
  "Không biết mọi người sao chứ mình thấy cuốn",
  "Coi mà tự nhiên muốn share cho bạn bè",
  "Góc này mà quay là hợp TikTok lắm",
  "Coi mà thấy vibe dịu ghê",
  "Ủa sao coi mà thấy vui vui vậy",
  "Coi tới cuối đi đừng bỏ giữa chừng",
  "Không hiểu sao coi mà thấy nhẹ lòng",
  "Cảnh này coi hoài vẫn thấy ổn",
  "Coi mà tự nhiên muốn coi thêm nữa",
  "Ủa sao clip này coi mà không tua nổi",
  "Coi mà quên luôn đang lướt mạng",
  "Nhìn vậy thôi chứ coi là dính đó",
  "Coi thử đi biết đâu hợp vibe bạn",
  "Ủa sao coi mà thấy chill dữ vậy",
  "Coi mà tự nhiên thấy dễ thương ghê",
  "Đoạn này coi lại vẫn thấy hay",
  "Coi mà quên luôn mình vô app làm gì",
  "Không biết sao chứ mình thấy clip này ổn",
  "Coi tới cuối thử nha 😳",
  "Cảnh này coi buổi tối là hợp lắm",
  "Coi mà tự nhiên thấy muốn coi thêm",
  "Nhìn đơn giản mà coi là cuốn",
  "Ủa sao coi mà thấy thích ngang vậy",
  "Coi mà quên luôn thời gian",
  "Đoạn này coi lại lần nữa cũng được",
  "Coi thử đi rồi quay lại đây nói chuyện tiếp 😭"
];
// ---------- helpers ----------
function normalizeToUrl(item) { return (item || "").toString().trim(); }
function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
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
if (btnGift) btnGift.addEventListener("click", () => (window.location.href = "https://google.com"));

function toast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 900);
}

// ---------- Session analytics ----------
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
  watchMsByVideo: {},
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

// ---------- Quick log (immediate) ----------
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

  try {
    fetch(SESSION_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {});
  } catch {}
}

// ---------- Consent Like (mini, centered) ----------
function ensureConsent() {
  const key = "vid_analytics_ok";
  if (localStorage.getItem(key) === "1") return true;

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
    sendQuickEvent("consent_ok"); // ✅ vào là có log
    bar.remove();
  });

  return false;
}
ensureConsent();

// ---------- Build feed ----------
const URLS = RAW_LIST.map(normalizeToUrl);
shuffleInPlace(URLS);

const FEED = URLS.map((url, idx) => ({
  id: `v${idx + 1}`,
  url,
  title: pickRandom(TITLE_BANK),
}));

// ---------- Tap Hint UI: controls show/hide ----------
let observer = null;
let globalMuted = true;
let lastTapAt = 0;
let hintTimer = null;

function showControls() {
  if (btnMute) btnMute.classList.remove("is-hidden");
  if (btnGift) btnGift.classList.remove("is-hidden");
  if (captionEl) captionEl.classList.remove("is-hidden");
}

function hideControls() {
  if (btnMute) btnMute.classList.add("is-hidden");
  if (btnGift) btnGift.classList.add("is-hidden");
  if (captionEl) captionEl.classList.add("is-hidden");
}

function showControlsBrief(ms = 1600) {
  showControls();
  if (hintTimer) clearTimeout(hintTimer);
  hintTimer = setTimeout(() => {
    // Only auto-hide if currently playing
    const v = getActiveVideo();
    if (v && !v.paused) hideControls();
  }, ms);
}

function getActiveSlide() {
  const id = session.activeVideoId;
  if (!id) return null;
  return document.querySelector(`.slide[data-id="${CSS.escape(id)}"]`);
}

function getActiveVideo() {
  const slide = getActiveSlide();
  return slide ? slide.querySelector("video") : null;
}

function setMuteAll(muted) {
  globalMuted = muted;
  session.muted = muted;
  document.querySelectorAll(".slide video").forEach(v => (v.muted = muted));
  if (btnMute) btnMute.innerHTML = muteIcon(muted);
  toast(muted ? "Muted" : "Unmuted");
}

if (btnMute) {
  btnMute.addEventListener("click", (e) => {
    e.stopPropagation();
    setMuteAll(!globalMuted);
    hideControls(); // ✅ bấm mute/unmute ẩn ngay
  });
}

// Gift click shouldn’t pause video
if (btnGift) {
  btnGift.addEventListener("click", (e) => e.stopPropagation());
}

// ---------- Render ----------
function attachVideoSignals(video) {
  video.addEventListener("pause", () => {
    // pause => show controls and keep visible
    showControls();
  });

  video.addEventListener("play", () => {
    // playing => keep UI quiet (hidden), but allow tap-hint
    hideControls();
  });
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
    const v = s.querySelector("video");
    if (v) attachVideoSignals(v);

    // Tap slide:
    // - If paused -> play
    // - If playing -> (1st tap) show hint, (2nd tap quickly) pause
    s.addEventListener("click", () => {
      const video = s.querySelector("video");
      if (!video) return;

      if (video.paused) {
        video.play().catch(() => {});
        hideControls();
        return;
      }

      const t = now();
      const dt = t - lastTapAt;
      lastTapAt = t;

      if (dt < 320) {
        // double-tap (fast) => pause
        video.pause();
        // pause handler will show controls
      } else {
        // single tap while playing => show hint briefly
        showControlsBrief(1600);
      }
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
        // pause others
        document.querySelectorAll(".slide video").forEach(v => {
          if (v !== video) v.pause();
        });

        // update active + seen + caption
        const id = slide.dataset.id || null;
        if (id && id !== session.activeVideoId) {
          session.activeVideoId = id;
          markVideoSeen(id);
        }
        if (captionEl) captionEl.textContent = slide.dataset.title || "";

        // autoplay
        try {
          video.muted = globalMuted;
          await video.play();
          hideControls(); // quiet
        } catch {
          // if autoplay blocked, keep controls visible to hint user
          showControls();
        }
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

  const body = JSON.stringify(buildSessionPayload());

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

window.addEventListener("pagehide", sendSession);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") sendSession();
});

// ---------- Init ----------
render();
setMuteAll(true);
hideControls(); // start quiet
