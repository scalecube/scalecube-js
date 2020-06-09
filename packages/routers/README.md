[![Join the chat at https://gitter.im/scalecube-js/Lobby](https://badges.gitter.im/scalecube-js/Lobby.svg)](https://gitter.im/scalecube-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> This is part of [scalecube-js](https://github.com/scalecube/scalecube-js) project, see more at <https://github.com/scalecube/scalecube-js>  
> [Full documentation](http://scalecube.io/javascript-docs)

# Index

Index is responsible for picking the right Item from a Item\[].

#### Default

Pick the first available item.
This is very good option for monolith (When all the services are one the same microservice instance) applications built with scalecube  

#### RetryRouter

Pick the first available item, Retry if service not found  
`period`- interval between retry, `maxRetry`- how much retries before giving up  
This is the prefer behavior for browsers 

#### RoundRobin

Pick the next item from a list of available items.  
This is very common router for servers
