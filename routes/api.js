'use strict';

const Thread = require("../models/models").Thread;
const Reply = require("../models/models").Reply;

const expect = require('chai').expect;
let mongodb = require('mongodb')
let mongoose = require('mongoose')

module.exports = function (app) {

  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
 

  app
    .route('/api/threads/:board')
    .post((req, res) => {
      let newThread = new Thread(req.body)
      if(!newThread.board || newThread.board === ''){
      newThread.board = req.params.board
    }
      newThread.created_on = new Date().toUTCString()
      newThread.bumped_on = new Date().toUTCString()
      newThread.reported = false
      newThread.save((error, savedThread) => {
        if(!error && savedThread){
          return res.redirect('/b/' + savedThread.board + '/' + savedThread.id)
        }
      })
    })
    
    .get((req, res) => {
      
      Thread.find({board: req.params.board})
        .sort({bumped_on: 'desc'})
        .limit(10)
        .select('-delete_password -reported')
        .lean()
        .exec((err, threadArray) => {
          if(!err && threadArray) {

            threadArray.forEach((thread) => {

              thread['replycount'] = thread.replies.length

              // *** Sort replies by Date *** 
              thread.replies.sort((threadA, threadB) => {
                return threadB.created_on - threadA.created_on
              })

              // *** Limit Replies To 3  ***
              thread.replies = thread.replies.slice(0,3)

              // *** Remove Delete Pass from Replies  ***
              thread.replies.forEach((reply) => {
                reply.delete_password = undefined
                reply.reported = undefined
              })
            })
            return res.json(threadArray)
          }
        })

    })
    .put((req, res) => {
      Thread.findByIdAndUpdate(
        req.body.thread_id,
        {reported: true},
        {new: true},
        (err, updatedThread) => {
          if(!err && updatedThread) {
            return res.json('success');
          }
        }
      )    
    })

    .delete((req, res) => {

      Thread.findById(
        req.body.thread_id,
        (err, selectThread) => {
          if(!err && selectThread) {
            if(selectThread.delete_password === req.body.delete_password) {

              Thread.findByIdAndRemove(
                req.body.thread_id,
                (err, deletedThread) => {
                  if(!err && deletedThread) {
                    return res.json('success')
                  }
                }              
              )
            }
            else {
              return res.json('incorrect password')
            }
          }
        }
      )
    })

    
  app
    .route('/api/replies/:board')
    .post((req, res) => {
//      let newReply = new Reply(req.body)
      let newReply = new Reply({
        text: req.body.text,
        delete_password: req.body.delete_password
      })

      newReply.created_on = new Date().toUTCString()
      newReply.reported = false

      Thread.findByIdAndUpdate(
        req.body.thread_id,
        {$push: {replies: newReply}, bumped_on: new Date().toUTCString()}, {new: true},
        (err, updatedThread) => {
          if(!err && updatedThread) {
            res.redirect('/b/' + updatedThread.board + '/' +updatedThread.id + '?new_reply_id=' + newReply.id)
          }
        }
      )
    })

    .get((req, res) => {

      Thread.findById(
        req.query.thread_id,
        (err, thread) => {
          if(!err && thread) {
            thread.delete_password = undefined
            thread.reported = undefined

            thread['replycount'] = thread.replies.length

            // *** Sort Replies By Date  ***
            thread.replies.sort((thread1, thread2) => {
              return thread2.connect - thread1.created_on
            })

            // *** Remove Delete Pass from Replies   ***
            thread.replies.forEach((reply) => {
              reply.delete_password = undefined
            })

            return res.json(thread)
          }
        }
      )
    })

    .put((req, res) => {

      Thread.findById(
        req.body.thread_id,
        (err, threadToUpdate) => {
          if(!err && threadToUpdate) {

            for(let i = 0; i < threadToUpdate.replies.length; i++) {
              if(threadToUpdate.replies[i].id === req.body.reply_id) {
                threadToUpdate.replies[i].reported = true;
              }
            }

            threadToUpdate.save((err, updatedThread) => {
              if(!err && updatedThread) {
                return res.json('success')
              }
            });
          }
          else {
            return res.json('Thread not found');
          }
        } 
      );
    })

    .delete((req, res) => {

      Thread.findById(
        req.body.thread_id,
        (err, threadToUpdate) => {
          if(!err && threadToUpdate) {

            for(let i = 0; i < threadToUpdate.replies.length; i++) {
              if(threadToUpdate.replies[i].id === req.body.reply_id) {
                if(threadToUpdate.replies[i].delete_password === req.body.delete_password) {
                  threadToUpdate.replies[i].text = '[deleted]';
                  
                } else {
                  return res.json('incorrect password');
                }
              }
            }

            threadToUpdate.save((err, updatedThread) => {
              if(!err && updatedThread) {
                return res.json('success');
              }
            });

          } else {
            return res.json('Thread not found');
          }
        }
      );
    })  


};
