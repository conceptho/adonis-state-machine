class State {
  static get ID () {
    return 'state'
  }
  
  get id () {
    return this.id || this.constructor.toString()
  }

  constructor () {
    if (!this.id) { this.id = this.constructor.toString() }
    if (!this.label) { this.label = this.constructor.toString() }
  }

  getAvailableStatus () {
    return this.stateBehavior.getAvailableStatus()
  }

  getAvailableStatusObjects () {
    return this.stateBehavior.getAvailableStatusObjects()
  }

  canChangeTo (id) {
    return true
  }

  onExit (id, event) {
    return true
  }

  onEntry (id, event) {
    return true
  }

  toJSON() {
    return this.id
  }

  toString() {
    return this.id
  }
}

module.exports = State
