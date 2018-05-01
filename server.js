var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var nforce = require('nforce');
const { ExpressOIDC } = require('@okta/oidc-middleware');
const session = require('express-session');
// var mongodb = require("mongodb");
// var ObjectID = mongodb.ObjectID;
var app = express();
// session support is required to use ExpressOIDC
app.use(session({
  secret: 'this should be secure',
  resave: true,
  saveUninitialized: false
}));

const oidc = new ExpressOIDC({
  issuer: 'https://sjsucmpe172s18.okta.com',
  client_id: '0oa12y3jyxaO7qkYS2p7',
  client_secret: 'qb55Acop2aLaQVuPQVgNx--I5-KCQGZ0yVH1Jb3A',
  redirect_uri: 'http://localhost:3000/success',
  scope: 'openid profile'
});

// ExpressOIDC will attach handlers for the /login and /authorization-code/callback routes
app.use(oidc.router);


oidc.on('ready', () => {
  app.listen(3000, () => console.log(`Started!`));
});

oidc.on('error', err => {
  console.log('Unable to configure ExpressOIDC', err);
});


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

app.get('/success', function (req, res) {
  res.redirect('/#/home');
})

app.get('/getAccessToken', function(req, res){
  console.log(req.query.code);
  org.authenticate({ code: req.query.code }, function(err, resp){
    console.log(err, resp);
  });
});

// var server = app.listen(process.env.PORT || 8080, function() {
//   var port = server.address().port;
//   console.log("App now running on port", port);
// });



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
      org.query({query: "select id, last_name__c, first_name__c, hire_date__c, gender__c from employee__c limit 10"}, function(err, resp) {
        if(err) throw err;
        if(resp.records){
          
          res.send(resp.records);
          
        }
      });  
    }
  });
});

  app.post("/contacts", function(req, res) {
    var newEmployee = req.body;

    if(!(req.body.last_name__c)) {
      handleError(res, "invalid, must input lastname");
    }

    console.log('Attempting to insert employee');
    var ct = nforce.createSObject('employee__c', newEmployee);
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

  app.get("/contacts/:id", function(req, res) {
    console.log('attepting to get the contact');
    org.getRecord({ type: 'employee__c', id: req.params.id}, function(err, ct){
    if(err){
      console.log(JSON.stringify(err));
    } else{
      res.status(201).send(ct);
    }
  });
  });


 app.put("/contacts/:id", function(req, res) {
  var cotact = req.body;

  if(!(req.body.last_name__c)){
    handleError(res, "must provide last name");
  }

  var ct = nforce.createSObject('employee__c', {
    id: req.parms.id,
    first_name__c: req.parms.first_name__c,
    last_name__c: req.parms.last_name__c,
    gender__c: req.parms.gender__c,
    hire_date__c: req.parms.hire_date__c
  });

  org.update({ sobject : ct });  
 });


app.delete("/contacts/:id", function(req, res) {
  var contactId = req.params.id;
  console.log('this is' + req.params.id);
  var ct = nforce.createSObject('employee__c', {
    id : contactId
  });
  org.delete({sobject : ct}, function(err, ct) {
    if(err) {
      console.error('--> unable to retrieve lead');
      console.error('--> ' + JSON.stringify(err));
    } else {
      console.log('--> contact deleted');
      res.status(204).end();
    }
  });
});
