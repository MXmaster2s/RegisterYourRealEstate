'use strict';

const {Contract} = require('fabric-contract-api');

/**
 * @description Registrar smart contract
 */
class PropRegRegistrarContract extends Contract {
  
  /**
   * @description Constructor of the smart contract
   */
	constructor() {
		// Name of this smart contract
		super('org.property-registration-network.regnet.registrar');
	}

  /**
   * @description Method to instantiate the smart contract
   * @param {*} ctx - The transaction context object 
   */
	async instantiate(ctx) {
		console.log('RegistrarContract Smart Contract Instantiated');
	}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/** APPROVE NEW USER
	 * Accepting a new user on the network
	 * @param {*} ctx - The transaction context object
	 * @param {*} name - Name of the user
	 * @param {*} aadharNumber - Aadhar Card number of the user
	 * @returns {object}
	 */
	async approveNewUser(ctx, name, aadharNumber) {
		// Recreate the composite key 
		const requestKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.users', [name, aadharNumber]);
    // Return user account from blockchain
      let userBuffer = await ctx.stub
          .getState(requestKey)
          .catch(err => console.log(err));
      let updatedUserObject = JSON.parse(userBuffer.toString());

      //If the user is already registered in the network reject the transaction
		if(updatedUserObject.status === 'Approved'){
			throw new Error('Duplicate Request: User is already registered in the network, request will be rejected');
		}
		else{
			updatedUserObject.upgradCoins = parseInt(0);
			updatedUserObject.updatedAt = new Date(); //For audit purpose
			updatedUserObject.registrarId = ctx.clientIdentity.getID(); //For audit purpose and to identify who has approved the request
			updatedUserObject.status = 'Approved'; //To differentiate between approved and non-approved user.

			// Convert the JSON object to a buffer and send it to blockchain for storage
			let dataBuffer = Buffer.from(JSON.stringify(updatedUserObject));
			await ctx.stub.putState(userKey, dataBuffer);
	
			// Return updated user object
			return updatedUserObject;
		}
  }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 	/** VIEW USER
    * Create a new user account on the network
    * @param {*} ctx - The transaction context object
    * @param {*} name - Name of the target user
    * @param {*} aadharNumber - Aadhar number of the target user
    * @returns {object}
    */
	async viewUser(ctx, name, aadharNumber) {
  		const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.users', [name, aadharNumber]);
  		let userBuffer = await ctx.stub
   			.getState(userKey)
   			.catch(err => console.log(err));
  		let user = JSON.parse(userBuffer.toString());
  		let userObject = {
  			name: user.name,
  			email: user.email,
  			clientId: 'HIDDEN. CONTACT USER TO GRANT ACCESS. ',
  			phoneNumber: 'HIDDEN. CONTACT USER TO GRANT ACCESS. ',
  			aadharNumber: 'HIDDEN. CONTACT USER TO GRANT ACCESS. ',
  			upgradCoins: 'HIDDEN. CONTACT USER TO GRANT ACCESS. ',
  			createdAt: user.createdAt,
        lastUpdatedAt: user.lastUpdatedAt,
        status: user.status,
        viewCount: user.viewCount + parseInt(1),
  		};
  			 return userObject;
  		 }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /** APPROVE PROPERTY REGISTRATION
  * Register new property in the network
  * @param ctx - The transaction context object
  * @param propertyId - Property ID of the Property
  * @returns
  */
  async approvePropertyRegistration(ctx, propertyId) {
    const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property', [propertyId]);
    let propertyBuffer = await ctx.stub
    		 .getState(propertyKey)
    		 .catch(err => console.log(err));
    let propertyObject = JSON.parse(propertyBuffer.toString());
    propertyObject.status = 'Registered';
    propertyObject.lastUpdatedAt = new Date();
    let dataBuffer = Buffer.from(JSON.stringify(propertyObject));
    await ctx.stub.putState(propertyKey, dataBuffer);
    return propertyObject;
  }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 	/** VIEW PROPERTY
      * Create a new user account on the network
      * @param ctx - The transaction context object
      * @param propertyId - Property ID of the Property
      * @returns {object}
      */
	async viewProperty(ctx, propertyId) {
    let propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property', [propertyId]);
    let propertyBuffer = await ctx.stub
         .getState(propertyKey)
    		 .catch(err => console.log(err));
    let property = JSON.parse(propertyBuffer.toString());     
    property.viewCount = property.viewCount + parseInt(1);
    return property;
  }
}

module.exports = PropRegRegistrarContract;
