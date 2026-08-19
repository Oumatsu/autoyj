import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    ignores: [
      ".next/**",
      ".vinext/**",
      "dist/**",
      "node_modules/**",
      ".agents/**",
      "coverage/**",
      "test-results/**",
      "public/**",
      "scripts/**",
    ],
  },
  {
    files: ["components/**/*.{ts,tsx}", "views/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.object.name='document'][callee.property.name=/^(getElementById|getElementsByClassName|getElementsByTagName)$/]",
          message: "🚫 严禁在 React 组件中直接调用 document.getElementById 等 DOM 查找方法，请使用 React useRef 或声明式 props/state。",
        },
        {
          selector: "MemberExpression[property.name=/^(classList|innerHTML|outerHTML)$/]",
          message: "🚫 严禁直接操作 element.classList / innerHTML，请使用 className={cn(...)} 和声明式 JSX。",
        },
      ],
    },
  },
];
