/* Build tools */
const gulp = require("gulp");

/* Build modules for scripts */
const commonjs = require("@rollup/plugin-commonjs"); // loader
const { eslint } = require("rollup-plugin-eslint"); // linter
const { babel } = require("@rollup/plugin-babel"); // transpiler + polyfills
const resolve = require("@rollup/plugin-node-resolve"); // loader
const strip = require("@rollup/plugin-strip"); // remove console.log statements
const rollup = require("rollup"); // bundler
const { terser } = require("rollup-plugin-terser"); // minifier
const nodeResolve = resolve.default;
const embedCSS = require("rollup-plugin-postcss");
const alias = require("@rollup/plugin-alias");
const replace = require("@rollup/plugin-replace");

/* Configure */
const babelConfig = {
  babelHelpers: "bundled",
  presets: [
    "@babel/preset-flow",
    [
      "@babel/preset-env",
      {
        useBuiltIns: "usage",
        corejs: 3,
      },
    ],
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    ["@babel/plugin-transform-react-jsx", { pragma: "h" }],
  ],
  exclude: "node_modules/**",
  babelrc: false,
};

function buildScript(app, module) {
  const name = module === "index" ? "bundle" : module;
  const inputOptions = {
    input: `./${app}/static/${app}/js/${module}.js`,
    plugins: [
      alias({
        entries: [
          { find: "react", replacement: "preact/compat" },
          { find: "react-dom", replacement: "preact/compat" },
        ],
      }),
      replace({
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
      eslint({
        fix: true,
      }),
      babel(babelConfig),
      // https://github.com/rollup/plugins/tree/master/packages/commonjs#using-with-rollupplugin-node-resolve
      nodeResolve({
        mainFields: ["module", "main", "browser"],
      }),
      commonjs(),
      embedCSS({ extract: true }),
      strip(),
    ],
  };
  const outputOptions = {
    extend: true,
    file: `./${app}/static/${app}/js/${module}.min.js`,
    format: "iife",
    name,
    plugins: [terser()],
    sourcemap: true,
  };

  return rollup
    .rollup(inputOptions)
    .then((bundle) => bundle.write(outputOptions));
}

exports.build = () => buildScript("user_feedback", "app");
exports.watch = () =>
  gulp.watch("./user_feedback/static/user_feedback/js/app.js", () =>
    buildScript("user_feedback", "app")
  );
