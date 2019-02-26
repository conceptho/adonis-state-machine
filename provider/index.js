const { ServiceProvider } = require('@adonisjs/fold')

class StateMachineProvider extends ServiceProvider {
  register () {
    this.app.bind('Conceptho/StateMachine', () => {
      const Machine = require('../src/Traits/Machine')
      return new (Machine)()
    })
    this.app.bind('Conceptho/StateMachine/Status', () => {
      const Status = require('../src/Status')
      return Status
    })
  }
}

module.exports = StateMachineProvider
