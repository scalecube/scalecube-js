# Scalecube CLI
> **NOTICE** this package is experimental

Scalecube CLI build to excellent your development and give

### sc def [file] [interface]
Take interface and create service definition

### sc doc [file] [interface]
Take interface with ts doc and create documentation

### sc sandbox-agent --port [port] --seed [seed] --registry [registry] 
### sc registry --f [file]
### sc sandbox --registry [registry]
Create sandbox

```plantuml
@startuml
left to right direction
cloud CDN
rectangle CLI #grey
rectangle WEB  #fff
rectangle CI 
cloud "SC Cluster" {
  usecase "ServiceA" as UC1
  usecase "ServiceB" as UC2
  usecase "ServiceC" as UC3
  usecase "Sandbox agent" as SBA
}
User --> WEB
User --> CLI
usecase "Sandbox" as SB
usecase "Registry" as REG
SB --> SBA: use SC gateway
CLI --> REG
CI --> CLI
WEB --> SB
note "Discover runtime env\nGet definition and metadata\nGet fe services metadata" as N1
SB - N1
N1 -> REG
CDN <- SB 
'SB -> REG
REG <-- SBA
@enduml
```