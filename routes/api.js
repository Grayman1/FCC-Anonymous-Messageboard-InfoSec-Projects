'use strict';

/*
const Thread = require("../models").Thread;
const Reply = require("../models").Reply;
*/


let mongodb = require('mongodb')
let mongoose = require('mongoose')





module.exports = function (app) {

  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

  let replySchema = new mongoose.Schema({
	text: {type: String, required: true},
	delete_password: {type: String, required: true},
	createdon_ : {type: Date, required: true},
	reported: {type: Boolean, required: true}
})

let threadSchema = new mongoose.Schema({
	text: {type: String, required: true},
	delete_password: {type: String, required: true},
	board: {type: String, required: true},
	createdon_: {type: Date, required: true},
	bumpedon_: {type: Date, required: true},
	reported: {type: Boolean, required: true},
	replies: [replySchema]
})

let Reply = mongoose.model('Reply', replySchema)
let Thread = mongoose.model('Thread', threadSchema)


  app
    .route('/api/threads/:board')
    .post((req, res) => {
      let newThread = new Thread(req.body)
      if(!newThread.board || newThread.board === ''){
      newThread.board = req.params.board
    }
      newThread.createdon_ = new Date().toUTCString()
      newThread.bumpedon_ = new Date().toUTCString()
      newThread.reported = false
      newThread.save((error, savedThread) => {
        if(!error && savedThread){
          return res.redirect('/b/' + savedThread.board + '/' + savedThread.id)
        }
      })
    })
    .get((req, res) => {
      
      Thread.find({board: req.params.board})
        .sort({bumpedon_: 'desc'})
        .limit(10)
        .select('-delete_password')
        .lean()
        .exec((err, arrayOfThreads) => {
          if(!err && arrayOfThreads) {

            arrayOfThreads.forEach((thread) => {

              thread['replycount'] = thread.replies.length

              // *** Sort replies by Date *** 
              thread.replies.sort((thread1, thread2) => {
                return thread2.createdon_ - thread1.createdon_
              })

              // *** Limit Replies To 3  ***
              thread.replies = thread.replies.slice(0,3)

              // *** Remove Delete Pass from Replies  ***
              thread.replies.forEach((reply) => {
                reply.delete_password = undefined
                reply.reported = undefined
              })
            })
            return res.json(arrayOfThreads)
          }
        })

    })


    
  app
    .route('/api/replies/:board')
    .post((req, res) => {
      let newReply = new Reply({
        text: req.body.text,
        delete_password: req.body.delete_password
      })
      newReply.createdon_ = new Date().toUTCString()
      newReply.reported = false

      Thread.findByIdAndUpdate(
        req.body.thread_id,
        {$push: {replies: newReply}, bumpedon_: new Date().toUTCString()}, {new: true},
        (err, updatedThread) => {
          if(!err && updatedThread) {
            res.redirect('/b/' + updatedThread.board + '/' +updatedThread.id + '?new_reply_id=' + newReply.id)
          }
        }
      )
    });

};
