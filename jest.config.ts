import globalSetup from "./test/globalSetup";

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  globalSetup: "<rootDir>/test/globalSetup.ts",
  globalTeardown: "<rootDir>/test/globalTeardown.ts",
  testTimeout: 120000, // 2 minutes for integration tests
  verbose: true,
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
};
