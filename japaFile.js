const { ioc } = require('@adonisjs/fold')
const { setup, cleanupTempDir, createTempDir } = require('./test/helpers')
const { configure } = require('japa')

configure({
  before: [
    async () => {
      require('@adonisjs/lucid/lib/iocResolver').setFold(require('@adonisjs/fold'))

      await setup(ioc)
      await createTempDir()
    }
  ],

  after: [
    async () => {
      await use('Database').close()
      await cleanupTempDir()
    }
  ],

  files: [
    'test/**/*.spec.js'
  ]
})
