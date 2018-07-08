const {
  FuseBox,
  WebIndexPlugin,
  SVGPlugin,
  SassPlugin,
  PostCSSPlugin,
  CSSResourcePlugin,
  CSSPlugin,
  ReplacePlugin,
  QuantumPlugin
} = require('fuse-box')
const {src, task, exec, context} = require('fuse-box/sparky')
const portfinder = require('portfinder')
const postCssConfig = require('./postcss.config')

portfinder.basePort = 4444

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

context(class {
  isProduction() {
    return process.env.NODE_ENV === 'production'
  }

  getConfig() {
    return FuseBox.init({
      debug: false,
      homeDir: 'src',
      output: 'dist/$name.js',
      target : 'browser@es5',
      hash: this.isProduction(),
      useTypescriptCompiler: true,
      plugins: [
        [
          SassPlugin(),
          PostCSSPlugin(postCssConfig.plugins),
          CSSResourcePlugin({
            dist: 'dist',
            resolve: (f) => f,
          }),
          CSSPlugin()
        ],
        SVGPlugin(),
        WebIndexPlugin({
          template : 'src/index.html',
        }),
        ReplacePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        }),
        this.isProduction() && QuantumPlugin({
          bakeApiIntoBundle: 'app',
          treeshake: true,
          uglify: true,
          css : true,
        })
      ]
    })
  }

  createBundle(fuse) {
    const app = fuse.bundle('app')
    if (!this.isProduction()) {
      app.watch()
      app.hmr()
    }
    app.instructions(`> index.tsx`)
    return app
  }
})

task('clean', async ctx => {
  await src('dist').clean('dist').exec()
})

task('build', ['clean'], async ctx => {
  const fuse = ctx.getConfig()
  const port = await portfinder.getPortPromise()
  fuse.dev({
    fallback: 'index.html',
    port: port,
    open: true,
  })
  ctx.createBundle(fuse)
  await fuse.run()
})

task('build:dev', async ctx => {
  exec('build')
})

task('build:prod', async ctx => {
  process.env.NODE_ENV = 'production'
  exec('build')
})
