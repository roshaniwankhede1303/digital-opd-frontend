// jest.config.js
module.exports = {
  preset: "react-native",
  setupFiles: ["<rootDir>/jest/setup.js"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.expo/"],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|expo|@expo|@tanstack/react-query)/)",
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/_layout.tsx",
  ],
  testEnvironment: "jsdom",
};
