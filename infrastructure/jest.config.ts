module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
  moduleNameMapper: {
    "@src(.*)$": "<rootDir>/src/$1",
    "@sls(.*)$": "<rootDir>/sls/$1",
    "@libs(.*)$": "<rootDir>/src/libs/$1",
    "@types(.*)$": "<rootDir>/src/types/$1",
  },
};
