/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let thread_id;
  let thread_id2;
  let board;

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('create new thread', function(done) {
        chai.request(server)
        .post('/api/threads/one')
        .send({text: 'text', delete_password: 'password'})
        .end((err, res) => {
          assert.equal(res.status, 200)
        })
        chai.request(server)
        .post('/api/threads/one')
        .send({text: 'text', delete_password: 'password'})
        .end((err, res) => {
          assert.equal(res.status, 200)
        })
        done()
      })
    });
    
    suite('GET', function() {
      test('get 10 most recent threads and 3 replies', function(done) {
        chai.request(server)
          .get('/api/threads/one')
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.isArray(res.body)
            assert.isBelow(res.body.length, 11)
            assert.isArray(res.body[0].replies)
            assert.isBelow(res.body[0].replies.length, 4)
            assert.property(res.body[0], '_id')
            assert.property(res.body[0], 'replies')
            assert.property(res.body[0], 'board')
            assert.property(res.body[0], 'text')
            assert.notProperty(res.body[0], 'delete_password')
            assert.property(res.body[0], 'created_on')
            assert.property(res.body[0], 'bumped_on')
            assert.notProperty(res.body[0], 'reported')
            board = res.body[0].board;
            thread_id = res.body[0]._id;
            thread_id2 = res.body[1]._id;
            done()
        })
       
      })
    });
    
    suite('PUT', function() {
      test('report thread', function(done) {
        chai.request(server)
          .put('/api/threads/one')
          .send({board: board, thread_id: thread_id})
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'success')
            
        })
        done()
      })
    });
    
    suite('DELETE', function() {
      test('delete thread', function(done) {
        chai.request(server)
          .delete('/api/threads/one')
          .send({board: board, thread_id: thread_id, delete_password: 'password'})
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'success')
        })
        done()
      })
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('reply to thread', function(done) {
        chai.request(server)
          .post('/api/replies/one')
          .send({board: board, text: 'reply', delete_password: 'password', thread_id: thread_id2})
          .end((err, res) => {
            assert.equal(res.status, 200)
        })
        done()
      })
    });
    
    suite('GET', function() {
      test('get thread with all replies', function(done) {
        chai.request(server)
          .get('/api/replies/one')
          .query({thread_id: thread_id2})
          .end((err, res) => {
          console.log(res.body.replies)
            assert.equal(res.status, 200)
            assert.property(res.body, 'replies')
            assert.property(res.body, '_id')
            assert.property(res.body, 'text')
            assert.property(res.body, 'created_on')
            assert.notProperty(res.body, 'deleted_password')
            assert.notProperty(res.body, 'reported')
            assert.isArray(res.body.replies);
            assert.notProperty(res.body.replies[0], 'delete_password');
            assert.notProperty(res.body.replies[0], 'reported');
        })
        done()
      })
    });
    
    suite('PUT', function() {
      test('report reply', function(done) {
        chai.request(server)
          .put('/api/replies/one')
          .send({thread_id: thread_id2, reply_id: thread_id2})
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'success')
        })
        done()
      })
    });
    
    suite('DELETE', function() {
      test('delete reply', function(done) {
        chai.request(server)
          .delete('/api/replies/one')
          .send({thread_id: thread_id2, reply_id: thread_id2})
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'success')
        })
          done()
      })
    });
    
  });

});
