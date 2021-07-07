const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let testThreadId
let testReplyId
let testPass = 'testpass'

suite('Functional Tests', function() {

  test('F/T #1 -Create a New Thread', (done) => {
		chai.request(server)
		.post('/api/threads/test')
		.send({
			board: 'test',
			text: 'Functional Test Thread',
			delete_password: testPass
		})
		.end((err, res) => {
			assert.equal(res.status, 200)
			let createdThreadId = res.redirects[0].split('/')[res.redirects[0].split('/').length - 1]
			testThreadId = createdThreadId
			done()
		})
  })


  // TEST 6 - Creating a new reply: POST request to /api/replies/{board}
  test('F/T #6 - Creating a new reply: POST request to /api/replies/{board}', (done) => {
    chai
      .request(server)
      .post('/api/replies/test')
		  .send({
			  thread_id: testThreadId,
			  text: 'Test Reply from Functional Test',
			  delete_password: testPass
      })
      .end((err, res) => {
        assert.equal(res.status, 200)
        let createdReplyId =  res.redirects[0].split('=')[res.redirects[0].split('=').length - 1]
        testReplyId = createdReplyId
        done()
      })
  })



  // TEST 2 - Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}
  test('F/T #2 -Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', (done) => {
    chai
      .request(server)
      .get('/api/threads/test')
      .send()
      .end((err, res) => {      
        assert.equal(res.status, 200)
        assert.isArray(res.body)
        let firstThread = res.body[0]
        assert.isAtMost(firstThread.replies.length, 3)
        assert.isUndefined(firstThread.delete_password)
        done()
      })
  })


  // TEST 7 - Viewing a single thread with all replies: GET request to /api/replies/{board}
  test('F/T #7 - Viewing a single thread with all replies: GET request to /api/replies/{board}', (done) => {
    chai
      .request(server)
      .get('/api/replies/test')
      .query({thread_id: testThreadId})
      .send()
      .end((err, res) => {
        let thread = res.body
        assert.equal(res.status, 200)
        assert.equal(thread._id, testThreadId)
        assert.isUndefined(thread.delete_password)
        assert.isArray(thread.replies)
        done()
      })
  })



  // TEST 3 - Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password
  test('F/T #3 - Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', (done) => {
    chai
      .request(server)
      .delete('/api/threads/test')
      .send({
        thread_id: testThreadId,
        delete_password: 'invalid password'
      })
      .end((err, res)=> {
        assert.equal(res.status, 200);
        assert.equal(res.body, 'incorrect password');
        done();
      })

  })

/*
  // TEST 4 - Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password
  test('F/T #4 - Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', (done) => {
    chai
      .request(server)
      .delete('/api/threads/test')
      .send({
        thread_id: testThreadId,
        delete_password: testPass
      })
      .end((err, res)=> {
        assert.equal(res.status, 200);
        assert.equal(res.body, success);
        done();
      })
  })
*/

 
  // TEST 5 - Reporting a thread: PUT request to /api/threads/{board}
  test('F/T #5 - Reporting a thread: PUT request to /api/threads/{board}', (done) => {
    chai
      .request(server)
      .put('/api/threads/test')
      .send({ thread_id: testThreadId })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body, "success")
        done();
      })
  })


  // TEST 10 - Reporting a reply: PUT request to /api/replies/{board}
  test('F/T #10 - Reporting a reply: PUT request to /api/replies/{board}', (done) => {
    chai
      .request(server)
      .put('/api/replies/test')
      .send({ 
        thread_id: testThreadId,
        reply_id: testReplyId
       })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body, 'success');
        done();
      })
  })

/*
  // TEST 4 - Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password
  test('F/T #4 - Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', (done) => {
    chai
      .request(server)
      .delete('/api/threads/test')
      .send({
        thread_id: testThreadId,
        delete_password: testPass
      })
      .end((err, res)=> {
        assert.equal(res.status, 200);
        assert.equal(res.body, 'success');
        done();
      })
  })
*/

/*
  // TEST 6 - Creating a new reply: POST request to /api/replies/{board}
  test('F/T #6 - Creating a new reply: POST request to /api/replies/{board}', (done) => {
    chai
      .request(server)
      .post('/api/replies/test')
		  .send({
			  thread_id: testThreadId,
			  text: 'Test Reply from Functional Test',
			  delete_password: testPass
      })
      .end((err, res) => {
        assert.equal(res.status, 200)
        let createdReplyId =  res.redirects[0].split('=')[res.redirects[0].split('=').length - 1]
        testReplyId = createdReplyId
        done()
      })
  })
*/

/*
  // TEST 7 - Viewing a single thread with all replies: GET request to /api/replies/{board}
  test('F/T #7 - Viewing a single thread with all replies: GET request to /api/replies/{board}', (done) => {
    chai
      .request(server)
      .get('/api/replies/test')
      .query({thread_id: testThreadId})
      .send()
      .end((err, res) => {
        let thread = res.body
        assert.equal(res.status, 200)
        assert.equal(thread._id, testThreadId)
        assert.isUndefined(thread.delete_password)
        assert.isArray(thread.replies)
        done()
      })
  })
*/



  // TEST 8 - Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password
  test('F/T #8 - Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', (done) => {
    console.log("delete reply invalid ids: thread_id: " + testThreadId + " reply_id: " + testReplyId);
    chai
      .request(server)
      .delete('/api/replies/test')
      .send({
        thread_id: testThreadId,
        reply_id: testReplyId,
        delete_password: 'invalid password'
      })
      .end((err, res)=> {
        assert.equal(res.status, 200);
        assert.equal(res.body, 'incorrect password');
        done();
      })
  })



  // TEST 9 - Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password
  test('F/T #9 - Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password', (done) => {
    console.log("delete reply valid ids: thread_id: " + testThreadId + " reply_id: " + testReplyId + "valid delete_password", testPass);
    chai
      .request(server)
      .delete('/api/replies/test')
      .send({
        thread_id: testThreadId,
        reply_id: testReplyId,
        delete_password: testPass
      })
      .end((err, res)=> {
        assert.equal(res.status, 200);
        assert.equal(res.body, 'success');
        done();
      })
  })


  // TEST 4 - Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password
  test('F/T #4 - Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', (done) => {
    chai
      .request(server)
      .delete('/api/threads/test')
      .send({
        thread_id: testThreadId,
        delete_password: testPass
      })
      .end((err, res)=> {
        assert.equal(res.status, 200);
        assert.equal(res.body, 'success');
        done();
      })
  })


/*
  // TEST 10 - Reporting a reply: PUT request to /api/replies/{board}
  test('F/T #10 - Reporting a reply: PUT request to /api/replies/{board}', (done) => {
    chai
      .request(server)
      .put('/api/replies/test')
      .send({ 
        thread_id: testThreadId,
        reply_id: testReplyId
       })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body, 'success');
        done();
      })

  })
*/
/*

2. Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}

3. Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password

4. Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password

5. Reporting a thread: PUT request to /api/threads/{board}

6. Creating a new reply: POST request to /api/replies/{board}

7. Viewing a single thread with all replies: GET request to /api/replies/{board}

8. Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password

9. Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password

10. Reporting a reply: PUT request to /api/replies/{board}
*/



});
