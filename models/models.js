

let mongoose = require("mongoose");
//let mongodb = require("mongodb");
const { Schema } = mongoose;

const date = new Date();
/*
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
*/
let replySchema = new mongoose.Schema({
	text: {type: String, required: true},
	delete_password: {type: String, required: true},
	created_on : {type: Date, required: true},
	reported: {type: Boolean, required: true}
})

let threadSchema = new mongoose.Schema({
	text: {type: String, required: true},
	delete_password: {type: String, required: true},
	board: {type: String, required: true},
	created_on: {type: Date, required: true},
	bumped_on: {type: Date, required: true},
	reported: {type: Boolean, required: true},
	replies: [replySchema]
})

let Reply = mongoose.model('Reply', replySchema)
let Thread = mongoose.model('Thread', threadSchema)

exports.Thread = Thread;
exports.Reply = Reply;