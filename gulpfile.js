/* Build tools */
const gulp = require("gulp");
const concat = require("gulp-concat");

/* Build modules for scripts */
const commonjs = require("@rollup/plugin-commonjs"); // loader
const { eslint } = require("rollup-plugin-eslint"); // linter
const { babel } = require("@rollup/plugin-babel"); // transpiler + polyfills
const resolve = require("@rollup/plugin-node-resolve"); // loader
const strip = require("@rollup/plugin-strip"); // remove console.log statements
const rollup = require("rollup"); // bundler
const { terser } = require("rollup-plugin-terser"); // minifier
const nodeResolve = resolve.default;
const alias = require("@rollup/plugin-alias");
const replace = require("@rollup/plugin-replace");

/* Build modules for styles */
const scssLint = require("stylelint"); // linter
const cssMinify = require("cssnano"); // minifier
const cssPolyfills = require("postcss-preset-env"); // autoprefixer + polyfills
const postcss = require("gulp-postcss"); // css
const scss = require("postcss-scss"); // understand scss syntax
const sass = require("@csstools/postcss-sass"); // sass compiler
const sourcemaps = require("gulp-sourcemaps"); // sourcemaps

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

function buildStyle(app, module) {
  const cb = (file) => {
    // https://github.com/postcss/gulp-postcss#advanced-usage
    return {
      plugins: [
        scssLint(),
        sass({ includePaths: ["node_modules/"] }),
        cssPolyfills(),
        cssMinify(),
      ],
      options: {
        parser: scss,
      },
    };
  };
  const build = gulp
    .src(
      [
        `./${app}/static/${app}/css/${module}/**/*.scss`,
        `./${app}/static/${app}/css/${module}.scss`,
      ],
      { allowEmpty: true }
    )
    .pipe(sourcemaps.init())
    .pipe(postcss(cb))
    .pipe(concat(`${module}.min.css`))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(`./${app}/static/${app}/css`));

  return build;
}

exports.scripts = () => buildScript("user_feedback", "app");
exports.styles = () => buildStyle("user_feedback", "styles");
exports.watch = () =>
  gulp.watch("./user_feedback/static/user_feedback/js/app.js", () => {
    buildScript("user_feedback", "app");
    buildStyle("user_feedback", "app");
  });
