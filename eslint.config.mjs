import nextConfig from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [
      ".next/**",
      "artifacts/**",
      "cache/**",
      "coverage/**",
      "next-env.d.ts",
      "node_modules/**",
      "typechain-types/**"
    ]
  }
];

export default eslintConfig;
