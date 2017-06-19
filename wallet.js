"use strict";

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

Wallet.prototype.withdraw = function(amount,wallet){
	
}

module.exports = Wallet;