# Adonis State Machine
![Codecov](https://img.shields.io/codecov/c/github/conceptho/adonis-state-machine.svg?logo=codecov&style=for-the-badge)
![CircleCI branch](https://img.shields.io/circleci/project/github/conceptho/adonis-state-machine/master.svg?logo=circleci&style=for-the-badge)
![npm (tag)](https://img.shields.io/npm/v/@conceptho/adonis-state-machine/latest.svg?color=green&logo=npm&style=for-the-badge)

Adonis State Machine adds a functionality for handling status changes inside some model.

## Instalation

1. Add package:

```bash
$ npm i @conceptho/adonis-state-machine --save
```

or

```bash
$ yarn add @conceptho/adonis-state-machine
```

2. Register Adonis State Machine provider inside the start/app.js file.

```js
const providers = [
    ...
    '@conceptho/adonis-state-machine/provider',
    ...
]
```

3. Registering the trait inside a `Model`(User for example).

```js
class User extends Model {
    ...
    static boot () {
        super.boot()
        ...
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
    ...
}
```

4. Changing a Status inside a `Model`

``` js

const user = new User()

user.changeTo(Deleted.ID) // This works
user.changeTo(Active.ID) // This does not work

```

5. Example

```js

const Model = use('Model')
const State = use('Conceptho/StateMachine/Status')

/** App/Models/User **/
class User extends Model {
    ...
    static boot () {
        super.boot()
        ...
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
    ...
}
...

/** App/Models/Status/User/Deleted **/
class Deleted extends State {
    static get ID () {
        return 'deleted'
    }
}
...

/** App/Models/Status/User/Unactive **/
class Unactive extends State {
    static get ID () {
        return 'unactive'
    }
}
...

/** App/Models/Status/User/Active **/
class Active extends State {
    static get ID () {
        return 'active'
    }
}
...

const user = new User()

const initialStatus = user.getStatus()
console.log(initialStatus.toString()) // active

await user.changeTo(Unactive.ID) // true
console.log(user.getStatus().toString()) // unactive
await user.changeTo(Deleted.ID) // true
console.log(user.getStatus().toString()) // deleted
await user.changeTo(Active.ID) // throws a error

```