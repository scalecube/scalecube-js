##############################
# scalecube-js microservices #
##############################

Feature: Tests for the general flow of microservices in scalecube-js

Scenario: Successfuly create microservice using htmlServiceDefinition, htmlService & ASYNC_MODEL_TYPES
	Given 	htmlServiceDefinition
	And 		htmlService
	When 		user imports htmlServiceDefinition with htmlService
	Then 		ASYNC_MODEL_TYPES renders it
	And 		htmlServiceProxy is created

Scenario: 