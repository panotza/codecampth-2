const Koa = require('koa')
const Router = require('koa-router')
const render = require('koa-ejs')
const path = require('path')
const koaBody = require('koa-body')
const session = require('koa-session')
const bcrypt = require('bcrypt')

const app = new Koa()
const router = new Router()

render(app, {
  root: path.join(__dirname, 'views'),
  layout: 'template',
  viewExt: 'ejs',
  cache: false
})

const sessionStore = {}
const sessionConfig = {
  key: 'sess',
  maxAge: 1000 * 60 * 60,
  httpOnly: true,
  store: {
    get (key, maxAge, { rolling }) {
      return sessionStore[key]
    },
    set (key, sess, maxAge, { rolling }) {
      sessionStore[key] = sess
    },
    destroy (key) {
      delete sessionStore[key]
    }
  }
}

const flash = async (ctx, next) => { // Flash middleware
  if (!ctx.session) throw new Error('flash message required session')
  ctx.flash = ctx.session.flash
  delete ctx.session.flash
  await next()
}

const checkAuth = async (ctx, next) => {
  if (!ctx.session || !ctx.session.userId) {
    ctx.body = `<p>you are not signed in</p>
      <a href="/signin">signin here</a>
    `
    return
  }
  await next()
}

const signinGetHandler = async ctx => {
  const data = {
    flash: ctx.flash
  }
  await ctx.render('signin', data)
}

const signinPostHandler = async ctx => {
  const hashedPassword = '$2a$10$Q49GCf4uEOVoBCVqlaPmeOs481Jz2ygQN4GaIaDhLqjFC2gtY7sZq'
  if (!ctx.request.body.username) {
    ctx.session.flash = { error: 'username required' }
    return ctx.redirect('/signin')
  }

  const same = await bcrypt.compare(ctx.request.body.password, hashedPassword)
  if (!same) {
    ctx.session.flash = { error: 'wrong password' }
    return ctx.redirect('/signin')
  }

  ctx.session.userId = 5125
  ctx.redirect('/')
}

router.get('/', checkAuth, ctx => {
  ctx.body = 'you are signed in'
})
router.get('/signin', signinGetHandler)
router.post('/signin', signinPostHandler)

app.keys = ['supersecret']
app.use(session(sessionConfig, app))
app.use(flash)
app.use(koaBody())
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000)
