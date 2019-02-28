# Adonis State Machine

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