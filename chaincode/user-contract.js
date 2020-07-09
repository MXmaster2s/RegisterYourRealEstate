'use strict';

const {Contract} = require('fabric-contract-api');

/**
* @description Smart contract for Users Organization
*/
class PropRegUsersContract extends Contract {

/**
 * @description Constructor method to initiate contract with unique name in the network
 */
constructor() {
	// Name of this smart contract
	super('org.property-registration-network.regnet.users');
}

/**
 * @description instantiate the smart contract
 * @param ctx The transaction context object
 */
async instantiate(ctx) {
	console.log('UserContract Smart Contract Instantiated');
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/** NEW USER REQUEST
	 * Create a new user account on the network
	 * @param ctx - The transaction context object
	 * @param name - Name of the user
	 * @param email - Email ID of the user
	 * @param phoneNumber - Phone number of the user
	 * @param aadharNumber - Aadhar Card number of the user
	 * @returns {object}
	 */
	async requestNewUser(ctx, name, email, phoneNumber, aadharNumber) {
		// Create a new composite key for the new account
		const requestKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.users', [name, aadharNumber]);
		// Create a user object to be stored in blockchain
		let requestObject = {
			name: name,
			email: email,
			clientIdentity: ctx.clientIdentity.getID(),
			phoneNumber: phoneNumber,
			aadharNumber: aadharNumber,
			status: 'Requested',
			createdAt: new Date(),
			viewCount: parseInt(0),
		};
		// Convert the JSON object to a buffer and send it to blockchain for storage
		let dataBuffer = Buffer.from(JSON.stringify(requestObject));
		await ctx.stub.putState(requestKey, dataBuffer);
		// Return value of new student account created to user
		return requestObject;
	}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/** RECHARGE UPGRAD_COINS
 * Create a new user account on the network
 * @param ctx - The transaction context object
 * @param name - Name of the user
 * @param bankTransactionId - Bank transaction ID of the user
 * @param aadharNumber - Aadhar Card number of the user
 * @returns {object}
 */
 async rechargeAccount(ctx, name, aadharNumber, bankTransactionId) {
	 // Check if the initiator of the function is the account user
	 const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.users', [name, aadharNumber]);
	 //Check bank Transaction ID
	 let rechargeAmount = [{'id':'upg500', 'value':500}, {'id':'upg1000', 'value':1000}, {'id':'upg100', 'value':100}];

		//Fetch upgradCoins based on the bank transaction id
		let txnDetails ;
		for (var i=0; i < rechargeAmount.length; i++) {
			if (rechargeAmount[i].id === bankTransactionId) {
				txnDetails = rechargeAmount[i];
			}
    	}
	 //checking if initiator of transaction is the user account
	 let userBuffer = await ctx.stub
		.getState(userKey)
		.catch(err => console.log(err));
	 
	 //validate bankTransactionId with the expected value and if the user found in the network
	 if(txnDetails && userBuffer){
		//Update user object with new properties
		let userObject = JSON.parse(userBuffer.toString());
		if(userObject.status === 'Approved'){
			userObject.upgradCoins = userObject.upgradCoins + txnDetails.value;
			userObject.updatedAt = new Date();

			// Convert the JSON object to a buffer and send it to blockchain for storage
			let dataBuffer = Buffer.from(JSON.stringify(userObject));
			await ctx.stub.putState(userKey, dataBuffer);

			// Return value of updated  user object
			return userObject;

		}
		else{ //Decline the transaction if user is not registered in the network
			throw new Error('User should be registered in the network to recharge account');
		}
	}
	else{ //Decline the transaction if bank transaction id is invalid
		throw new Error('Invalid Transaction ID: ' + bankTransactionId );
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
	/**PROPERTY REGISTRATION REQUEST
	 * @description Method to request to user's property to be registered in the network.
	 * @param {*} ctx The transaction context object
	 * @param {*} propertyId Unique property id of the property
	 * @param {*} price Price of the property
	 * @param {*} name Name of the user (owner) who want to register their property in the network
	 * @param {*} aadharId Aadhar id of the user (owner) who want to register their property in the network
	 * @returns {object} Propety request object
	 */
	async propertyRegistrationRequest(ctx, propertyId, price, name, aadharId){

		//create composite key for the user detail given
		const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.users', [name, aadharId]);
		const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property', [propertyId]);
		const ownerKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.users', [ctx.clientIdentity.getID(), name, aadharNumber]);
		//fetch the user details from the ledger using composite key fetch the current state of user object and return
		let userBuffer = await ctx.stub
				.getState(userKey)
				.catch(err => console.log(err));
		let userObject = JSON.parse(userBuffer.toString());
		//if user is registered in the network, then proceed, otherwise, decline the transaction
		if(userObject.status === 'Approved'){
			let requestObject = {
				propertyId: propertyId,
				price: price,
				owner: ownerKey,
				createdAt: new date(),
				lastUpdatedAt: new date(),
				viewCount: parseInt(0),
			};
			let dataBuffer = Buffer.from(JSON.stringify(requestObject));
			await ctx.stub.putState(propertyKey, dataBuffer);
			return requestObject;
		}
		else{
			throw new Error('User is not registered in the network');
		}
	}

 //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 	/** VIEW PROPERTY
      * Create a new user account on the network
      * @param ctx - The transaction context object
      * @param propertyId - Property ID of the Property
      * @returns {object}
      */
	async viewProperty(ctx, propertyId) {
    	const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property', [propertyId]);
    	let propertyBuffer = await ctx.stub
        	 .getState(propertyKey)
    		 .catch(err => console.log(err));
    	let property = JSON.parse(propertyBuffer.toString());
        property.viewCount = property.viewCount + parseInt(1);
        return property;
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 	/** UPDATE PROPERTY
	* Create a new user account on the network
	* @param ctx - The transaction context object
	* @param propertyId - Property ID of the Property
	* @param name - Name of the Owner
	* @param aadharNumber - Aadhar number of the owner
	* @param status - updated status of the property (can only be registered or onSale)
	* @returns {object}
	*/
   async updateProperty(ctx, propertyId, name, aadharNumber, status) {
		 const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property', [propertyId]);
		 const ownerKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.users', [ctx.clientIdentity.getID(), name, aadharNumber]);
		 let propertyBuffer = await ctx.stub
		     .getState(propertyKey)
		     .catch(err => console.log(err));
		 let property = JSON.parse(propertyBuffer.toString());
		 if(property.owner === ownerKey){
			property.status = status;
			return property;		 
		}else{
		   throw new Error('You are not the owner of the property');
		};
	}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/**
	 * @param {*} ctx The transaction context object
	 * @param {*} propertyId Unique property id which buyer wants to purchase
	 * @param {*} buyerName name of the buyer who is registered in the network
	 * @param {*} buyerAadharId Aadhar id of the buyer
	 */
async purchaseProperty(ctx, propertyId, buyerName, buyerAadharId){

	//create composite key for property and fetch property details. Proceed further, if the property status is 'onsale'
	//create composite key for the buyer and check whether buyer is already registered in the network.
	const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.users.property', [propertyId]);
	const newOwnerKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.users', [ctx.clientIdentity.getID(), buyerName, buyerAadharId]);
	const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.users', [name, aadharId]);
	//fetch user details from the ledger.
	let buyerUserBuffer = await ctx.stub
		.getState(userKey)
		.catch(err => console.log(err));
	let newOwnerObject = JSON.parse(buyerUserBuffer.toString());

	//if the user is registered, then proceed.
	if(newOwnerObject.status === 'Approved'){
		//fetch property details from the ledger.
		//using composite key fetch the current state of property object and return
		let propertyBuffer = await ctx.stub
			.getState(propertyKey)
			.catch(err => console.log(err));
		let propertyObject = JSON.parse(propertyBuffer.toString());
		//If the property status is 'onSale' then prceed.
		if(propertyObject.status === 'onSale'){
			//then check the buyer has sufficient balance in his/her account

			if(newOwnerObject.upgradCoins >= propertyObject.price){

				//deduct property price from buyer account
				newOwnerObject.upgradCoins = parseInt(newOwnerObject.upgradCoins) - parseInt(propertyObject.price);

				//updated the ownwer of the property as buyer id, status as registered
				propertyObject.owner = newOwnerKey;
				propertyObject.status='Registered';
				propertyObject.updatedAt = new Date();

				//update property details in ledger
				let updateProperty = Buffer.from(JSON.stringify(propertyObject));
				await ctx.stub.putState(propertyKey, updateProperty);

				//update new owner details in ledger.
				let updateBuyer = Buffer.from(JSON.stringify(newOwnerObject));
				await ctx.stub.putState(newOwnerKey, updateBuyer);

				return (JSON.stringify(propertyObject) + JSON.stringify(newOwnerObject));

			}
			else{
				throw new Error("No enough balance, please recharge your account");
			}
		}
		else{
			throw new Error("Property is not for sale");
		}
	}
	else{
		throw new Error("User is not registered in the network");
	}
}
}

module.exports = PropRegUsersContract;
