[![Join the chat at https://gitter.im/scalecube-js/Lobby](https://badges.gitter.im/scalecube-js/Lobby.svg)](https://gitter.im/scalecube-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> **NOTICE** versions 0.0.x are experimental without LTS or the API and behavior might change from patch to patch

# Scalecube utils

reusable utils library 

## address

#### getFullAddress

```gherkin
Given valid address: Address
When  calling getFullAddress(address)
Then  fullAddress will be added to the address object
```

#### validateAddress

```gherkin
Given address: any
And   isOptional: boolean
# isOptional = true
When  calling validateAddress(address, isOptional) 
Then  valid address can be undefined or type Address
# isOptional = false
When  calling validateAddress(address, isOptional) 
Then  valid address must be of type Address
```

## constants

```text
NOT_VALID_PROTOCOL
NOT_VALID_ADDRESS 
NOT_VALID_HOST 
NOT_VALID_PATH
NOT_VALID_PORT
```

##check

```text
assert
isDefined
isString
assertNonEmptyString
isArray
isNonEmptyArray
assertArray
isObject
assertObject
assertNonEmptyObject
isOneOf
assertOneOf
isFunction
assertFunction
assertNumber
```
