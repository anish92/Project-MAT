var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var nforce = require('nforce');
// var mongodb = require("mongodb");
// var ObjectID = mongodb.ObjectID;

var CONTACTS_COLLECTION = "contacts";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
// var db;
var oauth;

var org = nforce.createConnection({
  clientId: '3MVG9zlTNB8o8BA058qAP4U81Tfo.GxGlQtrcR3YjM7AXgiI27Ygx_o5pDEm2FQm0WlaCznDwmRv1HwVE6nAU',
  clientSecret: '5394957036633005783',
  redirectUri: 'http://localhost:8080/getAccessToken',
  mode: 'single'
});



app.get('/getAccessToken', function(req, res){
  console.log(req.query.code);
  org.authenticate({ code: req.query.code }, function(err, resp){
    console.log(err, resp);
  });
});

var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});



// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/contacts"
 *    GET: finds all contacts
 *    POST: creates a new contact
 */
// var oauth;
app.get("/contacts", function(req, res) {
  org.authenticate({username: 'mahmood@sjsu.edu', password: 'sjsu12345MtBlbLCvJqFKLJ19xLzkqYwb'}, function(err, resp) {
    if (err) {
      console.log('Error: ', + err.message);
      console.log('I failed at authentication');
    } else {
      console.log('Access Token: ' + resp.access_token);
      oauth = resp;
      org.query({query: "select id, last_name__c, first_name__c from employee__c limit 10"}, function(err, resp) {
        if(err) throw err;
        if(resp.records){
          console.log('im in');
          res.send(resp.records);
          console.log(resp.records);
        }
      });  
    }
  });
});

  app.post("/contacts", function(req, res) {
    var newEmployee = req.body;

    if(!(req.body.lastname)) {
      handleError(res, "invalid, must input lastname");
    }

    console.log('Attempting to insert employee');
    var ct = nforce.createSObject('Contact', newEmployee);
    org.insert({ sobject: ct }, function(err, resp) {
      if(err) {
        console.error('--> unable to insert');
        console.error(JSON.stringify(err));
      } else{
        console.log('inserted!');
        res.send(resp);
      }
    });
  });

// /*  "/contacts/:id"
//  *    GET: find contact by id
//  *    PUT: update contact by id
//  *    DELETE: deletes contact by id
//  */

// app.get("/contacts/:id", function(req, res) {
//   db.collection(CONTACTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
//     if (err) {
//       handleError(res, err.message, "Failed to get contact");
//     } else {
//       res.status(200).json(doc);  
//     }
//   });
// });

// app.put("/contacts/:id", function(req, res) {
//   var updateDoc = req.body;
//   delete updateDoc._id;

//   db.collection(CONTACTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
//     if (err) {
//       handleError(res, err.message, "Failed to update contact");
//     } else {
//       res.status(204).end();
//     }
//   });
// });

// app.delete("/contacts/:id", function(req, res) {
//   db.collection(CONTACTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
//     if (err) {
//       handleError(res, err.message, "Failed to delete contact");
//     } else {
//       res.status(204).end();
//     }
//   });
// });
