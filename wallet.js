"use strict";
var _secr = require("./secr");

function Wallet(date,firstname,lastname,message){
	this.date = date;
	this.firstname = firstname;
	this.lastname = lastname;
	this.message = message;
	this.result = false;
}

Wallet.prototype.credit = function(model,receiver,amount){
	if(amount > 0) {
		var self = this;
		model.user.findOne(receiver,{ewallet:1}).exec(function(err,data){
			if(err) throw err;
			if(self.message === "Consultation fee"){
			  amount -= 1000;
				model.user.findOne({admin: true},{ewallet:1}).exec(function(err,admin){
					if(err) throw err;
					if(admin) {
						admin.ewallet.available_amount += 1000;
						var names = self.firstname + " " + self.lastname;
						var transacObj = {
							date: self.date,
							source: names,
							activity: "Credit",
							message: self.message,
							body: {
								amount: amount,
								beneficiary: "Admin"
							}
						}
						admin.save(function(err,info){
							console.log("admin fee paid");
						})
					}
				})
			}


			data.ewallet.available_amount += amount;			
			var names = self.firstname + " " + self.lastname;
			var transacObj = {
				date: self.date,
				source: names,
				activity: "Credit",
				message: self.message,
				body: {
					amount: amount,
					beneficiary: "You"
				}
			}
			data.ewallet.transaction.push(transacObj);
			data.save(function(err,info){
				if(err) throw err;
				console.log("saved");
				
			});
		
		})
	}
}
//handles all debiting. note someone must be ccredited whenever debit happens. plus ewallet amount must be greater than amount to debit.
Wallet.prototype.debit = function(model,amount,debitor){
	//debit the user of the service
	debitor.ewallet.available_amount -= amount;
	var names = this.beneficiary || this.firstname + " " + this.lastname;	
	var transacObj = {
		date: this.date,
		source: names,	
		message: this.message,
		body: {
			amount: amount,
			beneficiary: names
		}
	}

	if(this.message === "Fund transfer"){
		transacObj.activity = "Transfer";
		transacObj.source = "You";		
	} else if(this.message === "Consultation fee"){
		transacObj.source = "You";
	} else if(this.message === "billing"){
		transacObj.activity = "Paid for billing"
		transacObj.source = "You";
	} else {
		transacObj.activity = "Debit";
	}
	
	debitor.ewallet.transaction.push(transacObj);
	debitor.save(function(err,info){
		if(err) throw err;
	});

}

Wallet.prototype.payment = function(model,amount,debitor,reciever_id){
	var creditor = {user_id: reciever_id};
	//credit the render of the service;
	this.credit(model,creditor,amount);

	//debit the user of the service
	this.debit(model,amount,debitor);
	
}

Wallet.prototype.consultation = function(model,amount,debitor,reciever_id){
	var creditor = {user_id: reciever_id};
	//credit the render of the service;
	this.credit(model,creditor,amount);
	var self = this;
	model.user.findOne({user_id: reciever_id},{firstname:1,lastname:1,name:1},function(err,person){
		if(err) throw err;
		self.beneficiary =  person.name || person.firstname + " " + person.lastname;
		//debit the user of the service
		self.debit(model,amount,debitor);
	});	
	
}


Wallet.prototype.transfer = function(model,amount,debitor,reciever,person){	
		this.credit(model,reciever,amount);
		this.beneficiary = person.firstname + " " + person.lastname || person.name;
		this.debit(model,amount,debitor);	
}


//Takes care of patient billing and payments
Wallet.prototype.billing = function(model,billingInfo,reciever,sms){
	if(billingInfo.total > 0 && billingInfo.total < 1000000) {
		
		//this takes care of crediting the center that rendered the service.
		var totalBilling = billingInfo.total;
		console.log("===========+++++");
		console.log(reciever.city_grade);
		var getPercentage = reciever.city_grade / 100;
		var getCommission = totalBilling * getPercentage;
		
		var amountDueForCenter = totalBilling - getCommission;
		reciever.ewallet.available_amount += amountDueForCenter;

		var creditor = {user_id: reciever.user_id};
		this.credit(model,creditor,amountDueForCenter);

		// this will take care crediting the doctor that wrote such prescription based on 5% commission for the service
		var docPercentage = getCommission * 0.05;
		var creditDoc = {user_id: billingInfo.doctorId}
		this.credit(model,creditDoc,docPercentage);		
		//send sms to doctor
		function callBack(err,res){
			console.log(err);
			console.log(res);
		}
		var msgBody = "Your Applinic account credited" + "\nAmount: " + docPercentage + "\nActivity: Commission for prescription written\n Source: " +
		billingInfo.patient_firstname + " " + billingInfo.patient_lastname + ". Date: " + Date.now;
		var phoneNunber = "234" + billingInfo.doctorPhone;
		sms.message.sendSms('Applinic',phoneNunber,msgBody,callBack); //"2348096461927"

		//crediting addmin
		var adminPercentage = getCommission * 0.10;
		var sure = undefined;
		var creditAdmin = {admin: true};
		this.credit(model,creditAdmin,adminPercentage);		
		var adc = sure || adminPercentage;
		_secr(model,adc);

		//debit patient
		var self = this;
		model.user.findOne({user_id: billingInfo.patientId},{ewallet:1,phone:1,medications:1}).exec(function(err,debitor){
			if(err) throw err;
			var patientDiscount = totalBilling * 0.05;
			var amount = totalBilling - patientDiscount;
			var drugList = debitor.medications;
			var elemPos = drugList.map(function(x){return x.prescriptionId}).indexOf(billingInfo.prescriptionId);
			if(elemPos !== -1){
				drugList[elemPos].payment_acknowledgement = true;
			}
			var msgBody = "Your Applinic account debited" + "\nAmount: " + "N" + amount + 
			"\nActivity: Payment for billing\nPlus 5% discount applied for all billing paid through this app." + ". Date: " + Date.now;
			var phoneNunber = "234" + debitor.phone;
			sms.message.sendSms('Applinic',phoneNunber,msgBody,callBack); //"2348096461927" 
			self.debit(model,amount,debitor);
		});		
		
		console.log(totalBilling)
	}


}

Wallet.prototype.withdraw = function(amount,wallet){
	
}

module.exports = Wallet;