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
    this.app.bind('Conceptho/StateMachine/Event', () => {
      const Event = require('../src/Event')
      return Event
    })
  }
}

module.exports = StateMachineProvider
