const test = require('japa')

const { ioc } = require('@adonisjs/fold')

test.group('StateMachine', group => {
  group.before(async () => {
    ioc.restore()

    const Model = use('Model')
    const State = use('Conceptho/StateMachine/Status')
    ioc.fake('App/Models/User', () =>{
      class User extends Model {
        static boot () {
          super.boot()
          this.addTrait('@provider:Conceptho/StateMachine', {
            $attr: 'status', // Attribute name
            $namespace: 'App/Models/Status/User', // Namespace where the status objects are stored.
            $initial: 'active', // Initial status id
            $transitions: { // Transitions for the status change diagram
              active: ['unactive', 'deleted' ],
              unactive: ['deleted', 'active'],
              deleted: []
            }
          })
        }
      }
      User.boot()
      return User
    })

    /** App/Models/Status/User/Deleted **/
    ioc.fake('App/Models/Status/User/Deleted', () =>
     class Deleted extends State {
      static get ID () {
        return 'deleted'
      }
    })

    /** App/Models/Status/User/Unactive **/
    ioc.fake('App/Models/Status/User/Unactive', () => 
    class Unactive extends State {
      static get ID () {
        return 'unactive'
      }
    })

    /** App/Models/Status/User/Active **/
    ioc.fake('App/Models/Status/User/Active', () => 
    class Active extends State {
      static get ID () {
        return 'active'
      }
    })
  })

  group.afterEach(async () => {
    await use('Database').truncate('users')
  })

  test('getStatus should be defined in the Traited Model and should be equal to the initial value in a new instance', async assert => {
    const User = use('App/Models/User')
    const user = new User()
    assert.isFunction(user.getStatus)
    assert.isTrue(user.getStatus().toString() === user.$initial)
  })

  test('saves with initial status', async assert => {
    const User = use('App/Models/User')
    const user = new User()
    await user.save()
    assert.deepEqual(user.toJSON().status, user.$initial)
  })

  test('getAvailableStatus should be defined in the Traited Model', async assert => {
    const User = use('App/Models/User')
    const user = new User()
    assert.isFunction(user.getAvailableStatus)
    assert.isArray(await user.getAvailableStatus())
  })

  test('allowedStatusChanges should be defined in the Traited Model', async assert => {
    const User = use('App/Models/User')
    const user = new User()
    assert.isFunction(user.allowedStatusChanges)
    assert.isArray(await user.allowedStatusChanges())
  })

  test('changeTo should be defined in the Traited Model', async assert => {
    const User = use('App/Models/User')
    const user = new User()
    assert.isFunction(user.changeTo)
    const changeToInitial = await user.changeTo(user.$initial)
    assert.isTrue(changeToInitial)
  })

  test('can changeTo Unactive', async assert => {
    const User = use('App/Models/User')
    const Unactive = use('App/Models/Status/User/Unactive')
    const user = new User()
    assert.isFunction(user.changeTo)
    const changeToUnactive = await user.changeTo(Unactive.ID)
    assert.isTrue(changeToUnactive)
  })

  test('cant change from Deleted', async assert => {
    assert.plan(4)
    const User = use('App/Models/User')
    const Active = use('App/Models/Status/User/Active')
    const Deleted = use('App/Models/Status/User/Deleted')
    const user = new User()
    assert.isFunction(user.changeTo)
    assert.isTrue(user.getStatus().toString() === user.$initial)
    const changeToDeleted = await user.changeTo(Deleted.ID)
    assert.isTrue(changeToDeleted)
    try {
      await user.changeTo(Active.ID)
    } catch ({ message }) {
      assert.equal(message, 'User: Its not possible to change this status: deleted => active')
    }
  })
})
