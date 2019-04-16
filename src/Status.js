class State {
  static get ID () {
    return 'state'
  }

  get id () {
    return this.constructor.ID
  }

  constructor () {
    if (!this.id) { this.id = this.constructor.ID }
    if (!this.label) { this.label = this.constructor.ID }
  }

  getAvailableStatus () {
    return this.stateBehavior.getAvailableStatus()
  }

  getAvailableStatusObjects () {
    return this.stateBehavior.getAvailableStatusObjects()
  }

  canChangeTo (id, event) {
    return true
  }

  onExit (id, event) {
    return true
  }

  onEntry (id, event) {
    return true
  }

  toJSON () {
    return this.id
  }

  toString () {
    return this.id
  }
}

module.exports = State
