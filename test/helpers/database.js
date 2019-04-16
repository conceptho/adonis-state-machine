function createTables () {
    const Database = use('Database')
  
    return Promise.all([
      Database.schema.createTable('users', table => {
        table.increments()
        table.string('email')
        table.string('password')
        table.string('status')
        table.boolean('deleted').defaultTo(false)
        table.timestamps()
      })
    ])
  }
  
  module.exports = {
    createTables
  }
  