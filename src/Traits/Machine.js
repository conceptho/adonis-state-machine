const _ = require('lodash')

const Status = require('../Status')
const Event = require('../Event')

class Machine {
  register (Model, customOptions = {}) {
    const defaultOptions = {
      $namespace : '',
      $attr : 'status',
      $initial : '',
      $transitions : {},
      $options : []
    }
    const options = _.assign(defaultOptions, customOptions)

    Model.prototype._onAfterFind = function (model) {
      model = model || this
      model.setStatusObject(model[model.$attr])
    }

    if (!options.$initial)
      throw new Error('It\'s required to set an initial state')
    if (!options.$namespace)
      throw new Error('Its required to specify the namespace')

    options.$options = _.keys(options.$transitions)


    Model.prototype.canChangeTo = function (id) {
      return this.$options.indexOf(id) >= 0 && this.$transitions[this.getStatusId()].indexOf(id) >= 0 && this[this.$attr].canChangeTo(id)
    }
    Model.prototype.changeTo = function (id, data = [], force = false) {
      const oldStatusId = this.getStatusId()
      if (oldStatusId === id) {
        return true
      }
      if (!this.canChangeTo(id) && force === false) {
        throw new Error('Its not possible to change this status: ' + this.getStatus().label + ' => ' + this.getStatusObject(id).label)
      }
      const event = new Event({ 'data': data })
      if (!this[this.$attr]){
        this[this.$attr] = this.$initial
      }
      if (this[this.$attr].onExit(id, event)) {
        this.setStatusObject(id)
        if (!this[this.$attr].onEntry(id, event)) {
          this.setStatusObject(oldStatusId)
        }
        return false
      }
      return true
    }

    Model.prototype.allowedStatusChanges = function () {
      const allowedStatusChange = this.$transitions[this.getStatusId()]
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
      this[this.$attr] = this.getStatusObject(id)
      return this[this.$attr]
    }

    Model.prototype.getStatusId = function () {
      if (this[this.$attr] instanceof Status) {
        return this[this.$attr].id
      } else {
        return this[this.$attr]
      }
    }

    Model.prototype.getStatus = function () {
      if (!this[this.$attr]){
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
        throw new Error( 'Assert that the ' + className + ' exists.')
      }
    }

    Model.prototype._convertToString = function (model) {
      if (model[model.$attr] instanceof Status) {
        model[model.$attr] = model[model.$attr].id
      }
    }

    _.assign(Model.prototype, options)

    Model.addHook('beforeCreate', Model.prototype._convertToString)
    Model.addHook('afterCreate', Model.prototype._onAfterFind)
    Model.addHook('afterUpdate', Model.prototype._onAfterFind)
    Model.addHook('beforeUpdate', Model.prototype._convertToString)
    Model.addHook('beforeSave', Model.prototype._convertToString)
    Model.addHook('afterSave', Model.prototype._onAfterFind)
    Model.addHook('afterFind', Model.prototype._onAfterFind )
    Model.addHook('afterFetch', (models) => models.map(Model.prototype._onAfterFind))
    Model.addHook('afterPaginate', (models) => models.map(Model.prototype._onAfterFind))
  }
}

module.exports = Machine
