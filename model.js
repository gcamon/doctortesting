'use strict';

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var dbURL = process.env.MONGODB_ADDON_URI;
mongoose.connect(dbURL);
mongoose.connection.on("error",function(err){
    console.log(err)
});

var Schema = mongoose.Schema;

var myModel = function () {
	var fileSchema = Schema({
		filename: String,
		path: String,
		file_id: String,
	},{
		collections: "fileinfo"
	});

	var service_objSchema = Schema({
		name: String,
		val: Boolean,
		id: Number,
		price: Number
	})

	var serviceSchema = Schema({
		center_name: String,
		center_address: String,
		center_city: String,
		center_country: String,
		user_id: String,
		unavailable_services: [service_objSchema],
		type: String

	},{
		collections: "centerservices"
	});

	var mailSchema = Schema({
		firstname: String,
		message_id: Number,
		title: String,
		lastname: String,
		specialty: String,
		user_id: String,
		date: String,
		consultation_fee: Number,
    service_access: String,
    profile_pic_url: String,
		message: String,
		category: String,//note categories are admin, decline, redirect,need_doctor.
		reason: String,
		complaint_id: String,
		redirect: {
			title: String,
			firstname: String,
			lastname: String,
			specialty: String,
			user_id: String
		}
	});

	var AwardSchema = Schema({
		id: Number,
		type_of_Award: String,
		data: String,
		description: String
	});

	var EducationSchema = Schema({
		id: Number,
		school: String,
		start_year: Date,
		end_year: Date,
		certificate: String
	});

	//prescriptionbodyschema goes inside prescription schema

	var prescriptionBodySchema = Schema({
		sn: Number,
		dosage: String,
		frequency: String,
		drug_name: String,
		duration: String
	});

	var statusSchema = Schema({
		date: Date,
		center_name: String,
		address: String,
		city:String,
		country: String,
		ref_id: Number,
		prescriptionId: Number
	});

	var prescriptionSchema = Schema({
		prescriptionId: Number,
		provisional_diagnosis: String,
		date: String,
		doctor_experience: Number,	
		doctor_firstname: String,
		doctor_lastname: String,
		doctor_address: String,		
		doctor_id: String,
		doctor_verified:Boolean,
		doctor_work_place: String,
		doctor_city: String,
		doctor_country: String,
		doctor_phone: String,
		lab_analysis: String,
		scan_analysis: String,
		Doctor_profile_pic_url: String,
		patient_profile_pic_url: String,
		patient_firstname: String,
		patient_id: String,
		patient_lastname: String,
		patient_address: String,
		patient_gender: String,
		patient_age: String,
		patient_city: String,
		patient_country: String,
		prescription_body: [prescriptionBodySchema],
		ref_id: Number,
		eligible:Boolean
	});

	var transactionSchema = Schema({
		date: String,
		source: String,
		message: String,
		activity: String,		
		body: {
			amount: Number,
			beneficiary: String,
		},
		
	});

	var noteSchema = Schema({
		sender_id: String,
		message_id: Number,
		type: String,
		date: String,
		message: String,
		sender_firstname: String,
		sender_lastname: String,
		sender_profile_pic_url: String
	});

	var periodSchema = Schema({
		day: String,
		from: String,
		to: String
	});

	var subspecialtySchema = Schema({
		id: Number,
		sub_specialty: String
	});

	var procedureSchema = Schema({
		id: Number,
		procedure_description: String
	});

	var accessSchema = Schema({
		patient_id: String,
		access_to_record: Boolean
	});

	var patient_noteSchema = Schema({
		date: String,
		note_id: Number,
		ref_id: Number,
		session_id: Number,
		type: String,
		message: String
	});

	var doc_briefSchema = Schema({
		doctor_id: String,
		date_of_acceptance: String,
		doctor_firstname: String,
		doctor_lastname: String,
		doctor_profile_pic_url: String,
		service_access: Boolean,
		doctor_specialty: String,
		work_place: String,
		office_hour:[periodSchema],
		presence: Boolean		
	});

	var patient_briefSchema = Schema({
		patient_firstname: String,
		patient_lastname: String,
		patient_id: String,
		patient_profile_pic_url: String,
		patient_address: String,
		patient_city: String,
		Patient_country: String,
		patient_gender: String,
		patient_age: Number,
		patient_body_weight: String,
		presence: Boolean
	});
	//this holds records for lab,prescription and scan for the patient
	var diagnosisSchema = Schema({
		doctor_note: String,
		doctor_firstname: String,
		doctor_lastname: String,
		date: Date,
		illness: String
	});

	var patient_TestSchema = Schema({ 
		test_to_run: Array,
		center_name: String,
		center_phone: String,
		center_address: String,
		center_city: String,
		center_country: String,
		center_id: String,
		patient_id: String,
		ref_id: Number,
		referral_firstname: String,
		referral_lastname: String,
		referral_title: String,
		sent_date: String,
		receive_date: String,
		report: String,
		conclusion: String,
		session_id: Number,
		files: Array
	});
	

	
	//this holds the sent test to ba ran by the laboratory center
	var center_refSchema = Schema({
		test_to_run: Array,
		patient_firstname: String,
		patient_lastname: String,
		patient_profile_pic_url: String,
		patient_title: String,
		patient_gender: String,
		patient_age: Number,
		session_id: Number,
		patient_id: String,
		test_id: Number,
		attended: Boolean
	});

	
	var drug_refSchema = Schema({
		dosage: String,
	    drugName: String,
	    frequency: String,
	    duration: String,
	    drugId: Number
	});

	var refSchema = Schema({
		ref_id: Number,
		referral_firstname: String,
		referral_lastname: String,
		referral_title: String,
		referral_id: String,		
		date: String,
		type_of_test: String,		
		laboratory: center_refSchema,
		radiology: center_refSchema,
		pharmacy: prescriptionSchema

	});

	var appointment_schema = Schema({
		date: String,
		time: String,
		last_meeting: String,
		firstname: String,
		lastname: String,
		title: String,
		patient_id: String,
		address: String,
		session_id: Number,
		typeOfSession: String,
		profilePic: String
	});

	var ref_notificationSchema = Schema({
		sender_firstname: String,
		sender_lastname: String,
		sender_title : String,
		sent_date: Date,
		ref_id: Number,
		note_id: Number,
		sender_profile_pic_url: String,
		message: String
	});
//for session
	var conversationSchema = Schema({
		date: Date,
		messages: String
	});

	var testResultSchema = Schema({ //note received date will be set as pending if the test has not returned. other be updated to date when returned
		receive_date: String,
		test_to_run: Array,
		report: String,
		conclusion: String,
		sent_date: String,
		test_ran_by: String,
		test_id: Number,
		files: Array
	});

	var docDignosisSchema = Schema({
		presenting_complain: String,
		history_of_presenting_complain: String,
		past_medical_history: String,
		social_history: String,
		family_history: String,
		drug_history: String,
		summary: String,
		provisional_diagnosis: String,
		general_examination: String,
		systemic_examination: String,
		diagnosis: String,
		laboratory_test_results: [testResultSchema],
		radiology_test_results: [testResultSchema],
		ecg_test_result: [testResultSchema],
		others: [testResultSchema],
		final_diagnosis: String,
		files: Array
	});

	var sessionSchema = Schema({
		date: String,
		session_id: Number,
		patient_id: String,
		prescription_id: Number,
		typeOfSession: String,
		conversations: conversationSchema,
		diagnosis: docDignosisSchema
	});

	var requestSchema = Schema({
		status: String,
		sender_firstname: String,
		sender_lastname: String,
		sender_profile_pic_url: String,
		sender_id: String,
		conclusion: String,
		type_of_test: String,
    center_name: String,
    center_address: String,
    cente_city: String,
    center_country: String,
    test_result: Array,
    files: Array,
    date_sent: String,
    ref_id: Number
	});

//end for session
	var userSchema = Schema({	  
		firstname: String,
		lastname: String,
		user_id: String,
		password: String,
		age: String,
		email: String,
		gender: String,
		address: String,
		state: String,
		city: String,
		title: String,
		marital_status: String,
		medications: [prescriptionSchema],
		date: Date,
		profile_url: String,
		verified: Boolean,
		ewallet:{			
			available_amount: Number,
			transaction:[transactionSchema]
		},
		admin: Boolean,
		type: String,
		profile_pic: {
			fieldname: String,
			originalname: String,
			encoding: String,
			mimetype: String,
			destination: String,
			filename: String,
			path: String,
			size: Number
		},
		files:[fileSchema],
		rating: Number,
		profile_pic_url: String,
		sub_specialty: [subspecialtySchema],
		procedure: [procedureSchema],
		introductory: String,
		awards: [AwardSchema],
		education: [EducationSchema],
		specialty: String,
		work_place: String,
		phone: Number,
		experience: Number,
		country: String,
		doctor_notification:[noteSchema],
		referral: [refSchema],
		patient_notification: [patient_noteSchema],
		office_hour:[periodSchema],
		record_access:[accessSchema],
		accepted_doctors: [doc_briefSchema],
		doctor_patients_list : [patient_briefSchema],
		medical_records: {					
			diagnosis: [diagnosisSchema],		
			prescription: [prescriptionSchema],
			laboratory_test: [patient_TestSchema],
			radiology_test: [patient_TestSchema]
		},
		name: String,
		diagnostic_center_notification:[ref_notificationSchema],
		accepted_patients: [patient_briefSchema],
		appointment:[appointment_schema],
		prescription_tracking: [statusSchema],
		doctor_patient_session: [sessionSchema],
		doctor_prescriptionRequest: [requestSchema],
		emergency_ref_url: String,
		patient_mail: [mailSchema],
		presence: Boolean,
		set_presence:{
			general: Boolean,
			particular: Array // sets the presence of the user and controls who sends messages to the user.
		},
		watch_list: Array		
	},{
		collections: "userinfos"
	})
	

	
	var helpSchema = Schema({
		helpType: String,
		description: String,
		sent_date: String,
		symptoms: Array,
		introductory: String,
		patient_id: String,
		complaint_id: String,
		age: String,
		gender: String,
		preferred_city: String,
		isview: Boolean,
		response: Array,
		files: Array
	},{
		collections: "helpinfos"
	});

	var DocRequestSchema = Schema({

	})

	var pinSchema = Schema({
		voucher: Array,
		voucher_two: Array,
		voucher_three: Array,
		otp: Array
	},{
		collections: "pininfo"
	});

	var inConversationSchema = Schema({
		ongoing_conversation: Array
	},{
		collections:"callinfo"
	});

	var chatSchema = Schema({
		chat_id: String,
		type: String,
		messages: Array,
		date_created: String
	},{
		collections: "chatinfos"
	});

	/*var callRequestSchema = Schema({
		message_id: String,
		type: String,
		request: Array,
		date: String
	},{
		collections: "requestinfos"
	});*/

	//models
	var models = {};
	models.user = mongoose.model('userinfos', userSchema);
	models.files = mongoose.model('fileinfo', fileSchema);
	models.patient = mongoose.model("patientinfo",patient_briefSchema);
	models.services = mongoose.model("centerservices",serviceSchema);
	models.help = mongoose.model("helpinfos",helpSchema);
	models.pins = mongoose.model("pininfo",pinSchema);
	models.communication = mongoose.model("callinfo",inConversationSchema);
	models.chats = mongoose.model("chatinfos",chatSchema);
	//models.requests = mongoose.model("requestinfos",chatSchema);
	/*models.award = mongoose.model('awardinfo', AwardSchema);
	models.education = mongoose.model('educationinfo', EducationSchema);
	models.prescribtion = mongoose.model("prescribtioninfo", prescribtionSchema);
	models.transaction = mongoose.model("transactioninfo",transactionSchema);
	models.procedure = mongoose.model("procedureinfo",procedureSchema);
	models.subSpecialty = mongoose.model("subspecialtyinfo",subspecialtySchema);*/
	return models		
}

module.exports = myModel;














