/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const mongodb = require('mongodb');
const mongoose = require('mongoose');
let ObjectId = require('mongodb').ObjectID;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useFindAndModify: false });


module.exports = function (app) {
  
  const Schema = new mongoose.Schema({
    board: String,
    text: String,
    delete_password: String,
    created_on: Date,
    bumped_on: Date,
    reported: Boolean,
    replies: Array
  })
  
  const Boards = mongoose.model('Boards', Schema);
  
  app.route('/api/threads/:board')
  
    .get((req, res) => {
    let board = req.params.board;
    
    async function findThread() {
      try {
        const thread = await Boards.find(
          {
            board: `${board}`
          },
          {
            reported: 0,
            delete_password: 0,
            'replies.reported': 0,
            'replies.delete_password': 0
          })
        .sort({bumped_on: -1})
        .limit(10)
        .slice('replies', -3)
        return res.json(thread)
        
        } catch (err) {
        res.send(err);
      }
    }
    
    findThread();
    
  })
  
    .post((req, res) => {
    const input = req.body;
    
    async function createBoard() {
      try{
         const message = await Boards.create({
      board: `${input.board}`,
      text: `${input.text}`,
      delete_password: `${input.delete_password}`,
      created_on: new Date(),
      bumped_on: new Date(),
      reported: false,
      replies: []
    })
    res.redirect(`/b/${input.board}/`)
      } catch (err) {
        res.send(err)
      }
    }
    
    createBoard();
  })
  
  .put((req, res) => {
    const board = req.body.board;
    const thread_id = req.body.thread_id;
    
    async function report() {
      try {
        await Boards.findOneAndUpdate({
          board: `${board}`,
          _id: `${thread_id}`
        },
        {
          $set: {reported: true}
        })
        return res.send(`success`)
      } catch (err) {
        res.send(`unable to report`)
      }
    }
    
    report();
    
  })
  
  .delete((req, res) => {
    const board = req.body.board;
    const thread_id = req.body.thread_id;
    const delete_password = req.body.delete_password;
    
    async function deleteThread() {
        try {
          await Boards.findOneAndDelete({board: `${board}`, _id: `${thread_id}`, delete_password: `${delete_password}`});
          return res.send(`success`);
        } catch (err) {
          res.send(`incorrect password`);
        }
      }
      
      deleteThread();
    
  })
  
    
  app.route('/api/replies/:board')
  
  .get((req, res) => {
    let board = req.params.board;
    let thread_id = req.query.thread_id
    
    async function getThread() {
      try {
        const reply = await Boards.find(
        {
          _id: `${thread_id}`
        },
        {
          reported: 0,
          delete_password: 0,
          'replies.reported': 0,
          'replies.delete_password': 0
        })
        return res.json(reply[0])
      } catch (err) {
        res.send(err)
      }
    }
    
    getThread();
  })
  
  .post((req, res) => {
    const board = req.body.board;
    const thread_id = req.body.thread_id;
    const text = req.body.text;
    const delete_password = req.body.delete_password;
    
    async function addReply() {
      try {
        const reply = await Boards.findOneAndUpdate({
          board: `${board}`,
          _id: `${thread_id}`
        }, {
          $push: {replies: {
          _id: new ObjectId(),
          text: `${text}`,
          created_on: new Date(),
          reported: false,
          delete_password: `${delete_password}`
          }},
           $set: {bumped_on: new Date()}
          })
        res.redirect(`/b/${board}/${thread_id}`)
      } catch (err) {
        res.send(err);
      }
    }
    
    addReply()
  })
  
  .put((req, res) => {
    const thread_id = req.body.thread_id;
    const reply_id = req.body.reply_id;
    
    async function reportReply() {
        try {
          let report = await Boards.findOneAndUpdate({
            _id: new ObjectId(req.body.thread_id),
            replies: {$elemMatch: {_id: new ObjectId(reply_id)}}
          },
          {
            $set: {"replies.$.reported": true}
          })
          return res.send(`success`);
        } catch (err) {
          res.send(`incorrect password`);
        }
      }
      
      reportReply();
  })

  .delete((req, res) => {
    const thread_id = req.body.thread_id;
    const reply_id = req.body.reply_id;
    
    async function deleteReply() {
        try {
          let removeReply = await Boards.findOneAndUpdate({
            _id: new ObjectId(req.body.thread_id),
            replies: {$elemMatch: {_id: new ObjectId(reply_id)}}
          },
          {
            $set: {"replies.$.text": "[deleted]"}
          })
          return res.send(`success`);
        } catch (err) {
          res.send(`incorrect password`);
        }
      }
      
      deleteReply();
    
  })
  
};
