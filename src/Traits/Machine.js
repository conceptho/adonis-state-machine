const _ = require('lodash')

const Status = require('../Status')
const Event = require('../Event')

class Machine {
  register (Model, customOptions = {}) {
    const defaultOptions = {
      $namespace: '',
      $attr: 'status',
      $initial: '',
      $transitions: {},
      $options: []
    }
    const options = _.assign(defaultOptions, customOptions)
    
    Model.prototype._onAfterFind = function (model) {
      model = model || this
      if (!(model[model.$status] instanceof Status)) {
        model[model.$attr] = model.getStatusObject(model[model.$attr])
      }
    }

    if (!options.$initial) { throw new Error('It\'s required to set an initial state') }
    if (!options.$namespace) { throw new Error('Its required to specify the namespace') }

    options.$options = _.keys(options.$transitions)

    Model.prototype.canChangeTo = async function (id, event) {
      return this.$options.indexOf(id) >= 0 && this.$transitions[this.getStatus().id].indexOf(id) >= 0 && (await this[this.$attr].canChangeTo(id, event))
    }

    Model.prototype.changeTo = async function (id, data = [], force = false) {
      const oldStatusId = this.getStatus().id
      if (oldStatusId === id) {
        return true
      }
      const event = new Event({ 'data': data })
      if (!(await this.canChangeTo(id, event)) && force === false) {
        throw new Error(`${this.constructor.name}: Its not possible to change this status: ` + this.getStatus().toString() + ' => ' + this.getStatusObject(id).toString())
      }
      if (!this[this.$attr]) {
        this[this.$attr] = this.$initial
      }
      if ((await this[this.$attr].onExit(id, event))) {
        this.setStatusObject(id)
        if (!(await this[this.$attr].onEntry(id, event))) {
          const newStatus = this[this.$attr]
          this.setStatusObject(oldStatusId)
          throw new Error(`${this.constructor.name}: The onEntry method at ${newStatus.constructor.name} has failed.`)
        }
        return true
      } else {
        throw new Error(`${this.constructor.name}: The onExit method at ${this.getStatus().constructor.name} has failed.`)
      }
    }

    Model.prototype.allowedStatusChanges = function () {
      const allowedStatusChange = this.$transitions[this.getStatus().toString()]
      return allowedStatusChange.filter(
        status => this.canChangeTo(status)
      )
    }

    Model.prototype.getAvailableStatus = function () {
      const availableStatus = []
      for (let transition in this.$transitions) {
        availableStatus[transition] = this.getStatusObject(transition).label
      }
      return availableStatus
    }

    Model.prototype.getAvailableStatusObjects = function () {
      const availableStatus = []
      for (let transition in this.$transitions) {
        availableStatus[transition] = this.getStatusObject(transition)
      }
      return availableStatus
    }

    Model.prototype.setStatusObject = function (id) {
      if (this.$options.indexOf(id) < 0) {
        throw new Error('Status not available')
      }
      this[this.$attr] = this.getStatusObject(id.toString())
      this[this.$attr].stateBehavior = this
      return this[this.$attr]
    }

    Model.prototype.toObject = function () {
      const obj = Object.getPrototypeOf(Model.prototype).toObject.call(this)
      if (obj[this.$attr]) {
        obj[this.$attr] = obj[this.$attr].toJSON()
      }
      return obj
    }

    Model.prototype.getStatusId = function () {
      if (this[this.$attr] instanceof Status) {
        return this[this.$attr].id
      } else { 
        if (!this[this.$attr]) {
          this[this.$attr] = this.$initial
        }
        return this[this.$attr]
      }
    }

    Model.prototype.getStatus = function () {
      if (!this[this.$attr]) {
        this[this.$attr] = this.$initial
      }
      if (_.isString(this[this.$attr])) {
        return this.setStatusObject(this.getStatusId())
      } else return this[this.$attr]
    }

    Model.prototype.getClassName = function (id) {
      return this.$namespace + '/' + (_.startCase(id)).replace(/\s/g, '')
    }
    Model.prototype.getStatusObject = function (id) {
      const className = this.getClassName(id)
      try {
        return new (use(className))()
      } catch (e) {
        throw new Error('Assert that the ' + className + ' exists.')
      }
    }

    Model.prototype._convertToString = function (model) {
      model = model || this
      if (model[model.$attr] instanceof Status) {
        model[model.$attr] = model[model.$attr].id
      } else {
        model[model.$attr] = model.getStatusId()
      }
    }

    _.assign(Model.prototype, options)

    Model.addHook('beforeCreate', Model.prototype._convertToString)
    Model.addHook('afterCreate', Model.prototype._onAfterFind)
    Model.addHook('afterUpdate', Model.prototype._onAfterFind)
    Model.addHook('beforeUpdate', Model.prototype._convertToString)
    Model.addHook('beforeSave', Model.prototype._convertToString)
    Model.addHook('afterSave', Model.prototype._onAfterFind)
    Model.addHook('afterFind', Model.prototype._onAfterFind)
    Model.addHook('afterFetch', (models) => models.map(Model.prototype._onAfterFind))
    Model.addHook('afterPaginate', (models) => models.map(Model.prototype._onAfterFind))
  }
}

module.exports = Machine
