export default [
  {
    ignores: [
      "**/node_modules/**",
      "dist/**",
      "build/**",
      "out/**",
      ".next/**",
      "supabase/**",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
];
