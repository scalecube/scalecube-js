##############################
# scalecube-js microservices #
##############################

#noinspection CucumberUndefinedStep
Feature: Tests for the general flow of Microservices in scalecube-js

Scenario: Successfully create Microservice using htmlServiceDefinition, htmlService & ASYNC_MODEL_TYPES
	Given 	htmlService
	And 		htmlServiceDefinition
	When 		user imports htmlServiceDefinition with htmlService
	Then 		ASYNC_MODEL_TYPES renders it
	And 		htmlServiceProxy is created

Scenario: Test the creation of Microservice and getting an error from htmlServiceDefinition
	Given 	htmlService
	And 		htmlServiceDefinition 
	When 		user imports htmlServiceDefinition with htmlService 
	And 		htmlServiceDefinition returns an error
	Then 		ASYNC_MODEL_TYPES will NOT render it
	And 		htmlServiceProxy is NOT created
	And 		relevant log message will be written
