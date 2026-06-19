// seed/imagePosts.js — real demo photos to seed as user posts (matched to the sport in each image).
// `src` is the original file in the local "picture" folder (used once to copy into seed/images/).
// `file` is the committed copy under seed/images/ that the seed script publishes to /uploads/.
module.exports = [
  { src: "הורדה.jpg", file: "tennis-1.jpg", sport: "Tennis", author: "noa", group: null,
    text: "golden hour rally 🎾 obsessed with this court.", workout: { durationMin: 60, calories: 420 } },
  { src: "Tennis photoshoot.jpg", file: "tennis-2.jpg", sport: "Tennis", author: "shira", group: null,
    text: "serve practice finally paid off 🎾", workout: { durationMin: 75, calories: 500 } },
  { src: "Tennis photoshoot (1).jpg", file: "tennis-3.jpg", sport: "Tennis", author: "omer", group: null,
    text: "court day ☀️🎾 nothing beats it.", workout: { durationMin: 50, calories: 380 } },
  { src: "C2H4® x LACOSTE_ The Future Tennis Championship - Fucking Young!.jpg", file: "tennis-4.jpg", sport: "Tennis", author: "lior", group: null,
    text: "future of tennis fits 🎾🔥", workout: { durationMin: 45, calories: 300 } },

  { src: "הורדה (1).jpg", file: "pilates-1.jpg", sport: "Pilates", author: "tamar", group: null,
    text: "reformer flow this morning 🤍 core on fire.", workout: { durationMin: 50, calories: 280 } },
  { src: "הורדה (2).jpg", file: "pilates-2.jpg", sport: "Pilates", author: "noa", group: null,
    text: "balance & control — pilates never gets easier, you just get stronger.", workout: { durationMin: 55, calories: 300 } },
  { src: "הורדה (3).jpg", file: "pilates-3.jpg", sport: "Pilates", author: "maya", group: null,
    text: "magic circle class with the girls ✨", workout: { durationMin: 60, calories: 320 } },
  { src: "Pilates __3.jpg", file: "pilates-4.jpg", sport: "Pilates", author: "shira", group: null,
    text: "stretch it out 🧘‍♀️ pilates glow.", workout: { durationMin: 45, calories: 240 } },
  { src: "Pilates aesthetic.jpg", file: "pilates-5.jpg", sport: "Pilates", author: "tamar", group: null,
    text: "soft mornings, strong core 🤍", workout: { durationMin: 50, calories: 260 } },

  { src: "הורדה (4).jpg", file: "running-1.jpg", sport: "Running", author: "shira", group: "Tel Aviv Runners",
    text: "sunset run with this view 🌅 hills > treadmill.", workout: { durationMin: 55, distanceKm: 11, calories: 640 } },
  { src: "LET ME HELP YOU START RUNNING! Use the code “ALEX2” with the link below! 🤍.jpg", file: "running-2.jpg", sport: "Running", author: "maya", group: "Tel Aviv Runners",
    text: "your sign to start running today 🏃‍♀️ who's in for the weekend session?", workout: { durationMin: 40, distanceKm: 7, calories: 430 } },
  { src: "Track and field.jpg", file: "running-3.jpg", sport: "Running", author: "maya", group: "Tel Aviv Runners",
    text: "track session done ✅ speed work hurts so good.", workout: { durationMin: 50, distanceKm: 9, calories: 560 } },

  { src: "הורדה (5).jpg", file: "crossfit-1.jpg", sport: "CrossFit", author: "daniel", group: "CrossFit Warriors",
    text: "box jumps for days 📦 legs absolutely destroyed.", workout: { durationMin: 65, calories: 700 } },
  { src: "Your recent Acid styles 📷.jpg", file: "crossfit-2.jpg", sport: "CrossFit", author: "yossi", group: "CrossFit Warriors",
    text: "sandbag carries at the comp 💪 left it all on the floor.", workout: { durationMin: 70, calories: 780 } },
];
