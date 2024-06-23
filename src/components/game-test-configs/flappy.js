export const flappyConfig = {
  default: {
    gap: 150,
    game: "flappy",
    score: 20,
    gravity: 1.7,
    interval: 250,
    preCondition: "/data/misc/flappy_drone",
    endDescription: "Drone successfully arrived at hull. Repairs started.",
    failDescription: "Drone destroyed!",
    initDescription:
      "<p>Manual hull repairs required using a drone.</p>\n\t\t<p>You must fly the drone to the hull area. Tap HANSCA to fly upwards.</p>",
    preFailDescription: "No drones available!",
  },
  "skill:expert": {
    gap: 150,
    game: "flappy",
    score: 7,
    gravity: 1.3,
    interval: 250,
    preCondition: "/data/misc/flappy_drone",
    endDescription: "Drone successfully arrived at hull. Repairs started.",
    failDescription: "Drone destroyed!",
    initDescription:
      "<p>Manual hull repairs required using a drone.</p>\n\t\t<p>You must fly the drone to the hull area. Tap HANSCA to fly upwards.</p>",
    preFailDescription: "No drones available!",
  },
  "skill:master": {
    gap: 150,
    game: "flappy",
    score: 10,
    gravity: 1.6,
    interval: 250,
    preCondition: "/data/misc/flappy_drone",
    endDescription: "Drone successfully arrived at hull. Repairs started.",
    failDescription: "Drone destroyed!",
    initDescription:
      "<p>Manual hull repairs required using a drone.</p>\n\t\t<p>You must fly the drone to the hull area. Tap HANSCA to fly upwards.</p>",
    preFailDescription: "No drones available!",
  },
};
