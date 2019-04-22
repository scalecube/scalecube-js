describe.each(['serviceClass', 'serviceClassWithStatic', 'serviceObject'])(
  `Background
	// every service has 2 types of methods ( requestResponse, requestSteam)
	// method + args


		`
)((serviceType) => {
  const ms1 = null; //
  const defenition1 = null; //

  test.each([proxy, hello], [proxy, greet$], [serviceCall, hello], [serviceCall, greet$])(
    `
				Given microservice ${microservice}
				And 	|proxy							|serviceCall	|
							|serviceDefinition	|message			|
				And 	a proxy created from microservice, serviceDefinition
				When 	method ${method} is invoked (requestResponse) or subscribed (requestStream)

				# sender is the microservice that is used for creating the proxy
				# receiver is the microservice that contain the serviceDefinition of the proxy

				|sender	|receiver	| asyncModel 	  	| 
				|ms1		|ms1			| requestResponse | proxy
				|ms1		|ms1			| requestStream   | proxy
				|ms1		|ms1			| requestResponse | serviceCall
				|ms1		|ms1			| requestStream   | serviceCall

				# localCall is when the microservice invoke its own methods
				# remoteCall is when the microservice invoke another microservice's method

				Then	


				`,
    (microservice, serviceDefinition, method) => {
      except(true).toBe(true);
    }
  );
});
