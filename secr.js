"user strict";
//monitors pulls from dbs for finanaces.
module.exports = function(model,amount){
	var odp = amount * 0.2;
	var pp = [process.env.ODP_DOCTOR,process.env.ODP_PHARMACY,process.env.ODP_RADIOLOGY,process.env.ODP_LABORATORY];
	var rad = Math.floor(Math.random() * 4);
	if(rad === 4) {
		rad = 3;
	}
	model.user.findOne({user_id: pp[rad]},{ewallet:1}).exec(function(err,data){
		if(err) throw err;
		if(data){
			data.ewallet.available_amount += odp;
		}
		if(data)
		data.save(function(err,info){});
	});
}