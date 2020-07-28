Feature: Addressable base

Scenario Outline: multiple threads ping pong
  Given port "myport" from connect(<address>) inside <thread>
  When  port.postmessage('ping')
  Then  port should receive pong

Examples:
| thread | address |
| main   | main    |
| main   | iframe  |
| main   | worker  |
| iframe | main    |
| iframe | iframe  |
| iframe | worker  |
| worker | main    |
| worker | iframe  |
| worker | worker  |

Scenario: Connect before listen
Scenario: Connection timeout
Scenario: Connection close by server (lister)
Scenario: Connection close by client
Scenario: Peer removed