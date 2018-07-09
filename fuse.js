const {
  FuseBox,
  WebIndexPlugin,
  // SVGPlugin,
  SassPlugin,
  PostCSSPlugin,
  // CSSResourcePlugin,
  CSSPlugin,
  ReplacePlugin,
  QuantumPlugin
} = require('fuse-box')
// const {YAMLPlugin} = require('fuse-box-yaml')
const {src, task, exec, context} = require('fuse-box/sparky')
const minimist = require('minimist')
const portfinder = require('portfinder')
const postCssConfig = require('./postcss.config')

portfinder.basePort = 4444

///////////////////////////////////////////////////////////////////////////////

context(class {
  constructor() {
    this.parseOptions()
  }

  parseOptions() {
    const argv = minimist(process.argv.slice(2))

    this.prod = argv['prod'] === true

    process.env.NODE_ENV = this.prod ? 'production' : 'development'

    console.log('---> ctx', this)
    console.log('--------------------------\n')
  }

  getBundleConfig() {
    return FuseBox.init({
      debug: false,
      homeDir: 'src',
      output: 'dist/$name.js',
      target : 'browser@es5',
      hash: this.prod,
      useTypescriptCompiler: true,
      plugins: [
        [
          SassPlugin(),
          PostCSSPlugin(postCssConfig.plugins),
          // CSSResourcePlugin({
          //   dist: 'dist',
          //   resolve: (f) => `/${f}`,
          // }),
          CSSPlugin()
        ],
        // SVGPlugin(),
        // YAMLPlugin(),
        WebIndexPlugin({
          template : 'src/index.html',
        }),
        ReplacePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        }),
        this.prod && QuantumPlugin({
          bakeApiIntoBundle: 'app',
          treeshake: true,
          uglify: true,
          css : true,
        })
      ]
    })
  }

  createBundle(fuse) {
    const bundle = fuse.bundle('app')
    bundle.instructions(`> index.tsx`)

    if (this.run && !this.prod) {
      bundle.watch()
      bundle.hmr()
    }

    return bundle
  }
})

///////////////////////////////////////////////////////////////////////////////

task('clean', async ctx => {
  await src('dist').clean('dist').exec()
})

task('build', ['clean'], async ctx => {
  const fuse = ctx.getBundleConfig()

  if (ctx.run) {
    const port = await portfinder.getPortPromise()

    fuse.dev({
      fallback: 'index.html',
      port: port,
      open: true,
    })
  }

  ctx.createBundle(fuse)
  fuse.run()
})

task('run', async ctx => {
  ctx.run = true
  exec('build')
})

task('default', async ctx => {
  exec('run')
})

///////////////////////////////////////////////////////////////////////////////
