const test = require('japa')

const { ioc } = require('@adonisjs/fold')

test.group('StateMachine', group => {
    group.before(async () => {
    ioc.restore()

    const Model = use('Model')
    const State = use('Conceptho/StateMachine/Status')
        ioc.fake('App/Models/User', () =>
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
            )
    
        /** App/Models/Status/User/Deleted **/
        ioc.fake('App/Models/Status/User/Deleted', () => class Deleted extends State {
            static get ID () {
                return 'deleted'
            }
        })
            
        /** App/Models/Status/User/Unactive **/
        ioc.fake('App/Models/Status/User/Unactive', () => class Unactive extends State {
            static get ID () {
                return 'unactive'
            }
        })    
            
            
        /** App/Models/Status/User/Active **/
        ioc.fake('App/Models/Status/User/Active', () => class Active extends State {
            static get ID () {
                return 'active'
            }
        })    
    })
    
    group.afterEach(async () => {
        await use('Database').truncate('users')
    })

    test('getStatus should be defined in User', assert => {
        const User = use('App/Models/User')
        const user = new User()
        console.log()
        //assert.isTrue(user.getStatus().toString() === 'active')
    })
})

