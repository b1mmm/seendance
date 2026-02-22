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
  "https://video.xx.fbcdn.net/o1/v/t2/f2/m366/AQP4VXBLefooERws2IkstBzmuqrHwYCopBxiB8yHWGcgEqtrXPGlFVUapjryE-JyWrZapOo4EJaKgo_CFO8-TGsvqa9fi6xYx6zGDQnJOAIsig.mp4?_nc_cat=109&_nc_oc=AdmJXB2YmkrFENjjnrVgJvJRtxUr4mLlW8Li_Xi_h0vCilnAGxVCqooQAToqxvFHQek&_nc_sid=5e9851&_nc_ht=video.fsgn8-3.fna.fbcdn.net&_nc_ohc=tj9go5At0XIQ7kNvwErX-He&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoxNzAyODYzOTg0NDIxMDQ3LCJhc3NldF9hZ2VfZGF5cyI6MSwidmlfdXNlY2FzZV9pZCI6MTAxMjEsImR1cmF0aW9uX3MiOjExLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=c7ea1428073d0db0&_nc_vs=HBksFQIYRWZiX2VwaGVtZXJhbC9EQzREMTAyQTU3QzczMjE5NzM4NzdBNDM3MTc2OEE5M19tdF8xX3ZpZGVvX2Rhc2hpbml0Lm1wNBUAAsgBEgAVAhhAZmJfcGVybWFuZW50LzU3NDA3MTY2QTlBRjU5RTlBNDJGRUMwNjI3QTMwRjg2X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbuoqOu3a-GBhUCKAJDMywXQCZEGJN0vGoYGWRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHARAHUCZZKeAQA&_nc_gid=9Q1fz-3LuAoGAVo9tCHWlQ&_nc_zt=28&oh=00_AfvHqGQ1R5_93K-5s125UKfAsMk2OQFHV8NLyCntUj8R7Q&oe=69A0A46B&bitrate=2108467&tag=dash_h264-basic-gen2_720p",
  "https://video.xx.fbcdn.net/o1/v/t2/f2/m366/AQP4VXBLefooERws2IkstBzmuqrHwYCopBxiB8yHWGcgEqtrXPGlFVUapjryE-JyWrZapOo4EJaKgo_CFO8-TGsvqa9fi6xYx6zGDQnJOAIsig.mp4?_nc_cat=109&_nc_oc=AdmJXB2YmkrFENjjnrVgJvJRtxUr4mLlW8Li_Xi_h0vCilnAGxVCqooQAToqxvFHQek&_nc_sid=5e9851&_nc_ht=video.fsgn8-3.fna.fbcdn.net&_nc_ohc=tj9go5At0XIQ7kNvwErX-He&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoxNzAyODYzOTg0NDIxMDQ3LCJhc3NldF9hZ2VfZGF5cyI6MSwidmlfdXNlY2FzZV9pZCI6MTAxMjEsImR1cmF0aW9uX3MiOjExLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=c7ea1428073d0db0&_nc_vs=HBksFQIYRWZiX2VwaGVtZXJhbC9EQzREMTAyQTU3QzczMjE5NzM4NzdBNDM3MTc2OEE5M19tdF8xX3ZpZGVvX2Rhc2hpbml0Lm1wNBUAAsgBEgAVAhhAZmJfcGVybWFuZW50LzU3NDA3MTY2QTlBRjU5RTlBNDJGRUMwNjI3QTMwRjg2X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbuoqOu3a-GBhUCKAJDMywXQCZEGJN0vGoYGWRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHARAHUCZZKeAQA&_nc_gid=9Q1fz-3LuAoGAVo9tCHWlQ&_nc_zt=28&oh=00_AfvHqGQ1R5_93K-5s125UKfAsMk2OQFHV8NLyCntUj8R7Q&oe=69A0A46B&bitrate=2108467&tag=dash_h264-basic-gen2_720p",
  "https://video.xx.fbcdn.net/o1/v/t2/f2/m366/AQP4VXBLefooERws2IkstBzmuqrHwYCopBxiB8yHWGcgEqtrXPGlFVUapjryE-JyWrZapOo4EJaKgo_CFO8-TGsvqa9fi6xYx6zGDQnJOAIsig.mp4?_nc_cat=109&_nc_oc=AdmJXB2YmkrFENjjnrVgJvJRtxUr4mLlW8Li_Xi_h0vCilnAGxVCqooQAToqxvFHQek&_nc_sid=5e9851&_nc_ht=video.fsgn8-3.fna.fbcdn.net&_nc_ohc=tj9go5At0XIQ7kNvwErX-He&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoxNzAyODYzOTg0NDIxMDQ3LCJhc3NldF9hZ2VfZGF5cyI6MSwidmlfdXNlY2FzZV9pZCI6MTAxMjEsImR1cmF0aW9uX3MiOjExLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=c7ea1428073d0db0&_nc_vs=HBksFQIYRWZiX2VwaGVtZXJhbC9EQzREMTAyQTU3QzczMjE5NzM4NzdBNDM3MTc2OEE5M19tdF8xX3ZpZGVvX2Rhc2hpbml0Lm1wNBUAAsgBEgAVAhhAZmJfcGVybWFuZW50LzU3NDA3MTY2QTlBRjU5RTlBNDJGRUMwNjI3QTMwRjg2X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbuoqOu3a-GBhUCKAJDMywXQCZEGJN0vGoYGWRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHARAHUCZZKeAQA&_nc_gid=9Q1fz-3LuAoGAVo9tCHWlQ&_nc_zt=28&oh=00_AfvHqGQ1R5_93K-5s125UKfAsMk2OQFHV8NLyCntUj8R7Q&oe=69A0A46B&bitrate=2108467&tag=dash_h264-basic-gen2_720p",
  "https://video.xx.fbcdn.net/o1/v/t2/f2/m366/AQP4VXBLefooERws2IkstBzmuqrHwYCopBxiB8yHWGcgEqtrXPGlFVUapjryE-JyWrZapOo4EJaKgo_CFO8-TGsvqa9fi6xYx6zGDQnJOAIsig.mp4?_nc_cat=109&_nc_oc=AdmJXB2YmkrFENjjnrVgJvJRtxUr4mLlW8Li_Xi_h0vCilnAGxVCqooQAToqxvFHQek&_nc_sid=5e9851&_nc_ht=video.fsgn8-3.fna.fbcdn.net&_nc_ohc=tj9go5At0XIQ7kNvwErX-He&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoxNzAyODYzOTg0NDIxMDQ3LCJhc3NldF9hZ2VfZGF5cyI6MSwidmlfdXNlY2FzZV9pZCI6MTAxMjEsImR1cmF0aW9uX3MiOjExLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=c7ea1428073d0db0&_nc_vs=HBksFQIYRWZiX2VwaGVtZXJhbC9EQzREMTAyQTU3QzczMjE5NzM4NzdBNDM3MTc2OEE5M19tdF8xX3ZpZGVvX2Rhc2hpbml0Lm1wNBUAAsgBEgAVAhhAZmJfcGVybWFuZW50LzU3NDA3MTY2QTlBRjU5RTlBNDJGRUMwNjI3QTMwRjg2X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbuoqOu3a-GBhUCKAJDMywXQCZEGJN0vGoYGWRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHARAHUCZZKeAQA&_nc_gid=9Q1fz-3LuAoGAVo9tCHWlQ&_nc_zt=28&oh=00_AfvHqGQ1R5_93K-5s125UKfAsMk2OQFHV8NLyCntUj8R7Q&oe=69A0A46B&bitrate=2108467&tag=dash_h264-basic-gen2_720p",
  "https://video.xx.fbcdn.net/o1/v/t2/f2/m366/AQP4VXBLefooERws2IkstBzmuqrHwYCopBxiB8yHWGcgEqtrXPGlFVUapjryE-JyWrZapOo4EJaKgo_CFO8-TGsvqa9fi6xYx6zGDQnJOAIsig.mp4?_nc_cat=109&_nc_oc=AdmJXB2YmkrFENjjnrVgJvJRtxUr4mLlW8Li_Xi_h0vCilnAGxVCqooQAToqxvFHQek&_nc_sid=5e9851&_nc_ht=video.fsgn8-3.fna.fbcdn.net&_nc_ohc=tj9go5At0XIQ7kNvwErX-He&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoxNzAyODYzOTg0NDIxMDQ3LCJhc3NldF9hZ2VfZGF5cyI6MSwidmlfdXNlY2FzZV9pZCI6MTAxMjEsImR1cmF0aW9uX3MiOjExLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=c7ea1428073d0db0&_nc_vs=HBksFQIYRWZiX2VwaGVtZXJhbC9EQzREMTAyQTU3QzczMjE5NzM4NzdBNDM3MTc2OEE5M19tdF8xX3ZpZGVvX2Rhc2hpbml0Lm1wNBUAAsgBEgAVAhhAZmJfcGVybWFuZW50LzU3NDA3MTY2QTlBRjU5RTlBNDJGRUMwNjI3QTMwRjg2X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbuoqOu3a-GBhUCKAJDMywXQCZEGJN0vGoYGWRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHARAHUCZZKeAQA&_nc_gid=9Q1fz-3LuAoGAVo9tCHWlQ&_nc_zt=28&oh=00_AfvHqGQ1R5_93K-5s125UKfAsMk2OQFHV8NLyCntUj8R7Q&oe=69A0A46B&bitrate=2108467&tag=dash_h264-basic-gen2_720p",
  "https://video.xx.fbcdn.net/o1/v/t2/f2/m366/AQP4VXBLefooERws2IkstBzmuqrHwYCopBxiB8yHWGcgEqtrXPGlFVUapjryE-JyWrZapOo4EJaKgo_CFO8-TGsvqa9fi6xYx6zGDQnJOAIsig.mp4?_nc_cat=109&_nc_oc=AdmJXB2YmkrFENjjnrVgJvJRtxUr4mLlW8Li_Xi_h0vCilnAGxVCqooQAToqxvFHQek&_nc_sid=5e9851&_nc_ht=video.fsgn8-3.fna.fbcdn.net&_nc_ohc=tj9go5At0XIQ7kNvwErX-He&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoxNzAyODYzOTg0NDIxMDQ3LCJhc3NldF9hZ2VfZGF5cyI6MSwidmlfdXNlY2FzZV9pZCI6MTAxMjEsImR1cmF0aW9uX3MiOjExLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=c7ea1428073d0db0&_nc_vs=HBksFQIYRWZiX2VwaGVtZXJhbC9EQzREMTAyQTU3QzczMjE5NzM4NzdBNDM3MTc2OEE5M19tdF8xX3ZpZGVvX2Rhc2hpbml0Lm1wNBUAAsgBEgAVAhhAZmJfcGVybWFuZW50LzU3NDA3MTY2QTlBRjU5RTlBNDJGRUMwNjI3QTMwRjg2X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbuoqOu3a-GBhUCKAJDMywXQCZEGJN0vGoYGWRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHARAHUCZZKeAQA&_nc_gid=9Q1fz-3LuAoGAVo9tCHWlQ&_nc_zt=28&oh=00_AfvHqGQ1R5_93K-5s125UKfAsMk2OQFHV8NLyCntUj8R7Q&oe=69A0A46B&bitrate=2108467&tag=dash_h264-basic-gen2_720p",
  "https://video.xx.fbcdn.net/o1/v/t2/f2/m366/AQP4VXBLefooERws2IkstBzmuqrHwYCopBxiB8yHWGcgEqtrXPGlFVUapjryE-JyWrZapOo4EJaKgo_CFO8-TGsvqa9fi6xYx6zGDQnJOAIsig.mp4?_nc_cat=109&_nc_oc=AdmJXB2YmkrFENjjnrVgJvJRtxUr4mLlW8Li_Xi_h0vCilnAGxVCqooQAToqxvFHQek&_nc_sid=5e9851&_nc_ht=video.fsgn8-3.fna.fbcdn.net&_nc_ohc=tj9go5At0XIQ7kNvwErX-He&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoxNzAyODYzOTg0NDIxMDQ3LCJhc3NldF9hZ2VfZGF5cyI6MSwidmlfdXNlY2FzZV9pZCI6MTAxMjEsImR1cmF0aW9uX3MiOjExLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=c7ea1428073d0db0&_nc_vs=HBksFQIYRWZiX2VwaGVtZXJhbC9EQzREMTAyQTU3QzczMjE5NzM4NzdBNDM3MTc2OEE5M19tdF8xX3ZpZGVvX2Rhc2hpbml0Lm1wNBUAAsgBEgAVAhhAZmJfcGVybWFuZW50LzU3NDA3MTY2QTlBRjU5RTlBNDJGRUMwNjI3QTMwRjg2X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbuoqOu3a-GBhUCKAJDMywXQCZEGJN0vGoYGWRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHARAHUCZZKeAQA&_nc_gid=9Q1fz-3LuAoGAVo9tCHWlQ&_nc_zt=28&oh=00_AfvHqGQ1R5_93K-5s125UKfAsMk2OQFHV8NLyCntUj8R7Q&oe=69A0A46B&bitrate=2108467&tag=dash_h264-basic-gen2_720p",
  "https://video.xx.fbcdn.net/o1/v/t2/f2/m366/AQP4VXBLefooERws2IkstBzmuqrHwYCopBxiB8yHWGcgEqtrXPGlFVUapjryE-JyWrZapOo4EJaKgo_CFO8-TGsvqa9fi6xYx6zGDQnJOAIsig.mp4?_nc_cat=109&_nc_oc=AdmJXB2YmkrFENjjnrVgJvJRtxUr4mLlW8Li_Xi_h0vCilnAGxVCqooQAToqxvFHQek&_nc_sid=5e9851&_nc_ht=video.fsgn8-3.fna.fbcdn.net&_nc_ohc=tj9go5At0XIQ7kNvwErX-He&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoxNzAyODYzOTg0NDIxMDQ3LCJhc3NldF9hZ2VfZGF5cyI6MSwidmlfdXNlY2FzZV9pZCI6MTAxMjEsImR1cmF0aW9uX3MiOjExLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=c7ea1428073d0db0&_nc_vs=HBksFQIYRWZiX2VwaGVtZXJhbC9EQzREMTAyQTU3QzczMjE5NzM4NzdBNDM3MTc2OEE5M19tdF8xX3ZpZGVvX2Rhc2hpbml0Lm1wNBUAAsgBEgAVAhhAZmJfcGVybWFuZW50LzU3NDA3MTY2QTlBRjU5RTlBNDJGRUMwNjI3QTMwRjg2X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbuoqOu3a-GBhUCKAJDMywXQCZEGJN0vGoYGWRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHARAHUCZZKeAQA&_nc_gid=9Q1fz-3LuAoGAVo9tCHWlQ&_nc_zt=28&oh=00_AfvHqGQ1R5_93K-5s125UKfAsMk2OQFHV8NLyCntUj8R7Q&oe=69A0A46B&bitrate=2108467&tag=dash_h264-basic-gen2_720p",
  "https://video.xx.fbcdn.net/o1/v/t2/f2/m366/AQP4VXBLefooERws2IkstBzmuqrHwYCopBxiB8yHWGcgEqtrXPGlFVUapjryE-JyWrZapOo4EJaKgo_CFO8-TGsvqa9fi6xYx6zGDQnJOAIsig.mp4?_nc_cat=109&_nc_oc=AdmJXB2YmkrFENjjnrVgJvJRtxUr4mLlW8Li_Xi_h0vCilnAGxVCqooQAToqxvFHQek&_nc_sid=5e9851&_nc_ht=video.fsgn8-3.fna.fbcdn.net&_nc_ohc=tj9go5At0XIQ7kNvwErX-He&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoxNzAyODYzOTg0NDIxMDQ3LCJhc3NldF9hZ2VfZGF5cyI6MSwidmlfdXNlY2FzZV9pZCI6MTAxMjEsImR1cmF0aW9uX3MiOjExLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=c7ea1428073d0db0&_nc_vs=HBksFQIYRWZiX2VwaGVtZXJhbC9EQzREMTAyQTU3QzczMjE5NzM4NzdBNDM3MTc2OEE5M19tdF8xX3ZpZGVvX2Rhc2hpbml0Lm1wNBUAAsgBEgAVAhhAZmJfcGVybWFuZW50LzU3NDA3MTY2QTlBRjU5RTlBNDJGRUMwNjI3QTMwRjg2X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbuoqOu3a-GBhUCKAJDMywXQCZEGJN0vGoYGWRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHARAHUCZZKeAQA&_nc_gid=9Q1fz-3LuAoGAVo9tCHWlQ&_nc_zt=28&oh=00_AfvHqGQ1R5_93K-5s125UKfAsMk2OQFHV8NLyCntUj8R7Q&oe=69A0A46B&bitrate=2108467&tag=dash_h264-basic-gen2_720p",
  "https://video.xx.fbcdn.net/o1/v/t2/f2/m366/AQP4VXBLefooERws2IkstBzmuqrHwYCopBxiB8yHWGcgEqtrXPGlFVUapjryE-JyWrZapOo4EJaKgo_CFO8-TGsvqa9fi6xYx6zGDQnJOAIsig.mp4?_nc_cat=109&_nc_oc=AdmJXB2YmkrFENjjnrVgJvJRtxUr4mLlW8Li_Xi_h0vCilnAGxVCqooQAToqxvFHQek&_nc_sid=5e9851&_nc_ht=video.fsgn8-3.fna.fbcdn.net&_nc_ohc=tj9go5At0XIQ7kNvwErX-He&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoxNzAyODYzOTg0NDIxMDQ3LCJhc3NldF9hZ2VfZGF5cyI6MSwidmlfdXNlY2FzZV9pZCI6MTAxMjEsImR1cmF0aW9uX3MiOjExLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=c7ea1428073d0db0&_nc_vs=HBksFQIYRWZiX2VwaGVtZXJhbC9EQzREMTAyQTU3QzczMjE5NzM4NzdBNDM3MTc2OEE5M19tdF8xX3ZpZGVvX2Rhc2hpbml0Lm1wNBUAAsgBEgAVAhhAZmJfcGVybWFuZW50LzU3NDA3MTY2QTlBRjU5RTlBNDJGRUMwNjI3QTMwRjg2X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbuoqOu3a-GBhUCKAJDMywXQCZEGJN0vGoYGWRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHARAHUCZZKeAQA&_nc_gid=9Q1fz-3LuAoGAVo9tCHWlQ&_nc_zt=28&oh=00_AfvHqGQ1R5_93K-5s125UKfAsMk2OQFHV8NLyCntUj8R7Q&oe=69A0A46B&bitrate=2108467&tag=dash_h264-basic-gen2_720p",
  "https://video.xx.fbcdn.net/o1/v/t2/f2/m366/AQP4VXBLefooERws2IkstBzmuqrHwYCopBxiB8yHWGcgEqtrXPGlFVUapjryE-JyWrZapOo4EJaKgo_CFO8-TGsvqa9fi6xYx6zGDQnJOAIsig.mp4?_nc_cat=109&_nc_oc=AdmJXB2YmkrFENjjnrVgJvJRtxUr4mLlW8Li_Xi_h0vCilnAGxVCqooQAToqxvFHQek&_nc_sid=5e9851&_nc_ht=video.fsgn8-3.fna.fbcdn.net&_nc_ohc=tj9go5At0XIQ7kNvwErX-He&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoxNzAyODYzOTg0NDIxMDQ3LCJhc3NldF9hZ2VfZGF5cyI6MSwidmlfdXNlY2FzZV9pZCI6MTAxMjEsImR1cmF0aW9uX3MiOjExLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=c7ea1428073d0db0&_nc_vs=HBksFQIYRWZiX2VwaGVtZXJhbC9EQzREMTAyQTU3QzczMjE5NzM4NzdBNDM3MTc2OEE5M19tdF8xX3ZpZGVvX2Rhc2hpbml0Lm1wNBUAAsgBEgAVAhhAZmJfcGVybWFuZW50LzU3NDA3MTY2QTlBRjU5RTlBNDJGRUMwNjI3QTMwRjg2X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbuoqOu3a-GBhUCKAJDMywXQCZEGJN0vGoYGWRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHARAHUCZZKeAQA&_nc_gid=9Q1fz-3LuAoGAVo9tCHWlQ&_nc_zt=28&oh=00_AfvHqGQ1R5_93K-5s125UKfAsMk2OQFHV8NLyCntUj8R7Q&oe=69A0A46B&bitrate=2108467&tag=dash_h264-basic-gen2_720p"
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
