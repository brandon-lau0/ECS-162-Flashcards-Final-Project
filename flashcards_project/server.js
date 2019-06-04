"use strict";

const express = require('express');
const APIrequest = require('request');
const http = require('http');

const passport = require('passport');
const cookieSession = require('cookie-session');
const GoogleStrategy = require('passport-google-oauth20');

const APIkey = "AIzaSyAt9g5D8RZEYrisegFBSwmVazNBn0I3tP0";  // Google Translate API Key
const url = "https://translation.googleapis.com/language/translate/v2?key=" + APIkey

const port = 54610;
const sqlite3 = require("sqlite3").verbose();  // use sqlite
const fs = require("fs"); // file system
const flashcardsDbFileName = "Flashcards.db";

/***************OPEN THE DATABASE *********************/
const flashcardDb = new sqlite3.Database(flashcardsDbFileName, sqlite3.OPEN_READWRITE,
    (err) => {
        if(err) {
            console.log("Could not connect to Flashcards Database, something is wrong!");
        }
        console.log("Successfully connected to the FlashCards database.")
    });

function queryHandler(req, res, next) {
  let url = req.url;
  let qObj = req.query;

  let engl = qObj.english;
  let trans = qObj.chinese; 


  if (qObj.english != undefined) {
      flashcardDb.run(`INSERT INTO Flashcards(user_id,
                                         english_text,
                                         trans_text,
                                         num_show,
                                         num_correct) VALUES(?, ?, ?, 0, 0)`, [req.user.google_id, engl, trans], 

          function(err) {
            if (err) {
              return console.log("something is wrong cannot put the data to Database", err.message);
            }
            // get the last insert id
            console.log(`A row has been inserted ${this.changes}`);
            res.json({});
          });
  } else {
    next();
  }
}

function translateTextHandler(req, res, next) {
  // browser sends request to server in the format: {"english" : "text"}
  let qObj = req.query;

  if (qObj != undefined) {
    let requestObj =
      {
        "source": "en",
        "target": "zh-TW",
        "q": [
          qObj.english
        ]
      };

    function TranslateAPICallback(err, APIResHead, APIResBody) {
      if ((err) || (APIResHead.statusCode != 200)) {
        // API not working
        console.log("API error-- not working");
        console.log(APIResBody);
      } else {
        if (APIResHead.error) {
          // API request worked but not giving data
          console.log("API request worked, but no data returned");
          console.log(APIResHead.error);
        } else {
          console.log("In Chinese: ", 
              APIResBody.data.translations[0].translatedText);
          console.log("\nJSON was:");
          console.log(JSON.stringify(APIResBody, undefined, 2));
          console.log("\n");

          res.json({
            "English" : qObj.english,
            "Chinese" : APIResBody.data.translations[0].translatedText
          });
        }
      }
    }

    APIrequest(
      {
        url: url,
        method: "POST",
        headers: {"content-type": "application/json"},
        json: requestObj
      }, 
      TranslateAPICallback  // translateAPI callback function
    );
  } else {
    next();
  }
}

function usernameHandler(req, res) {

  //console.log("This is Request!!!!: ", req)
  console.log("This is user in the USERNAME HANDLER: ", req.user)
  console.log("This is user.FirstName in the USERNAME HANDLER: ", req.user.firstName)
  console.log("This is user.LastName in the USERNAME HANDLER: ", req.user.lastName)
  let user_name = req.user.firstName + " " + req.user.lastName;

  res.json({username: user_name});
}

function hasCardHandler(req,res) {
  
  let searchCmdStr = `SELECT count(user_id) FROM Flashcards WHERE user_id = ${req.user.google_id}`;
    flashcardDb.get(searchCmdStr, hasCardCallback);

    function hasCardCallback(err, rowData) {
      if (err) {
        console.log("Error occurred in hasCardCallback function. Error is:", err);
      } else {
        console.log("Successfully retrieved retrieved user's flashcards count from database. Received:", rowData);
    
        let hasFlashcards;
        if (rowData['count(user_id)'] > 0){
           hasFlashcards = "true";
        } else {
           hasFlashcards = "false";
        }
        res.json({"hasCard": hasFlashcards});
    }
}
}

/**
 * The db.all() method allows you to execute an SQL query with specified parameters 
 * and call a callback to access the rows in the result set.
 */

function getCardHandler(req,res) {
  let searchCmdStr = `SELECT count(row_id) FROM Flashcards WHERE user_id = ${req.user.google_id}`;
  /**
   * The get() method executes an SQL query and calls the callback function on the first result row. 
   * In case the result set is empty, the row argument is undefined.
   * USE GET WHEN When you know that the result set contains zero or one row
   */
  flashcardDb.get(searchCmdStr, getCardCallback);

  function getCardCallback(err, rowData) {
    if (err) {
      console.log("Error occurred in getCardCallback function. Error is:", err);
    } else {
      console.log("Successfully retrieved retrieved user's flashcards count from database. Received:", rowData);

      
      let array_of_cards = new Array(rowData['count(user_id)']);
      let sql = `SELECT row_id
                  FROM Flashcards
                  WHERE user_id = ${req.user.google_id}`;
      // assign variable to get the length
      let i = 0;
      /**
       * http://www.sqlitetutorial.net/sqlite-nodejs/query/ reference
       * The each() method executes an SQL query with specified parameters 
       * and calls a callback for every row in the result set.
       */
      flashcardDb.each(sql, (err,row) => {
        if (err) {
        console.log("Error occurred in getCardCallback function2. Error is:", err);          
        } 
        // loop through until all row gets called and assign it to array
        array_of_cards[i] = row.row_id;
        // update the i as the function each loop through the row
        i++;
      });
      console.log("this is i value at the moment, ", i);
      let randNum = Math.floor((Math.random() * i));
      let randomCards = array_of_cards[randNum];
      let sql2 = `SELECT *
                  FROM Flashcards
                  WHERE row_id = ?`, [randomCards];
      
      flashcardDb.get(sql2,(err, rowData2) => {
        if (err) {
          console.log("Error occurred in hasCardCallback function. Error is:", err);
        } else {
          console.log("Successfully retrieved retrieved user's flashcards count from database. Received:", rowData2);
         
          // update the numShow in the database 
      let totalShow = rowData2.num_show + 1;
      let sqlUpdate = `UPDATE Flashcards 
                       SET num_show=? `,[totalShow];
      flashcardDb.run(sqlUpdate, (err, updateRow) =>{
        if (err) {
          console.log("Error occurred in hasCardCallback function. Error is:", err);
        } else {
          console.log("The row has been updated! it is now ", updateRow);
        }
       }); // the end of flashCardDb.run
       
     // function call to make sure it update the row
      // put value in from the second cards into the JSON and send it
        let getCard = {
          "unique_identifier":rowData2.row_id,
          "englishText": rowData2.english_text,
          "translatedText": rowData2.trans_text
        }
    res.json({"getCard": getCard});
   }
  }); // the end of flashcardDB.Get
}



function fileNotFound(req, res) {
    let url = req.url;
    res.type('text/plain');
    res.status(404);
    res.send('Cannot find ' + url);
}

// ====================================== LOGIN CODE =========================================

// Google login credentials, used when the user contacts
// Google, to tell them where he is trying to login to, and show
// that this domain is registered for this service. 
// Google will respond with a key we can use to retrieve profile
// information, packed into a redirect response that redirects to
// server162.site:[port]/auth/accepted
const googleLoginData = {
    clientID: '83662678063-d224j3kj4jqqbgafvs2vp673p8b7vte3.apps.googleusercontent.com',
    clientSecret: 'D5M7shd7W53awI1PAyZ_Rm55',
    callbackURL: '/auth/accepted'
};

// Strategy configuration. 
// Tell passport we will be using login with Google, and
// give it our data for registering us with Google.
// The gotProfile callback is for the server's HTTPS request
// to Google for the user's profile information.
// It will get used much later in the pipeline. 
passport.use( new GoogleStrategy(googleLoginData, gotProfile) );


// Put together the server pipeline
const app = express()

// pipeline stage that just echos url, for debugging
app.use('/', printURL);

// Check validity of cookies at the beginning of pipeline
// Will get cookies out of request, decrypt and check if 
// session is still going on. 
app.use(cookieSession({
    maxAge: 6 * 60 * 60 * 1000, // Six hours in milliseconds
    // meaningless random string used by encryption
    keys: ['hanger waldo mercy dance']  
}));

// Initializes request object for further handling by passport
app.use(passport.initialize()); 

// If there is a valid cookie, will call deserializeUser()
app.use(passport.session()); 

// Public static files
app.get('/*',express.static('public'));

// next, handler for url that starts login with Google.
// The app (in public/login.html) redirects to here (not an AJAX request!)
// Kicks off login process by telling Browser to redirect to
// Google. The object { scope: ['profile'] } says to ask Google
// for their user profile information.
app.get('/auth/google',
  passport.authenticate('google',{ scope: ['profile'] }) );
// passport.authenticate sends off the 302 response
// with fancy redirect URL containing request for profile, and
// client ID string to identify this app. 

// Google redirects here after user successfully logs in
// This route has three handler functions, one run after the other. 
app.get('/auth/accepted',
  // for educational purposes
  function (req, res, next) {
      console.log("at auth/accepted");
      next();
  },
  // This will issue Server's own HTTPS request to Google
  // to access the user's profile information with the 
  // temporary key we got in the request. 
  passport.authenticate('google'),
  // then it will run the "gotProfile" callback function,
  // set up the cookie, call serialize, whose "done" 
  // will come back here to send back the response
  // ...with a cookie in it for the Browser! 
  function (req, res) {
      console.log('Logged in and using cookies!');

      let searchCmdStr = `SELECT * from Flashcards WHERE user_id = ${req.user}`;

      flashcardDb.get(searchCmdStr, checkUserFlashcardsCallback);

      function checkUserFlashcardsCallback(err, rowData) {
        if (err) {
          console.log("Error occurred in checkUserFlashcardsCallback function. Error is:", err);
        } else {
          console.log("Successfully found whether or not user has/does not have flashcards in database:", rowData);
          if (rowData) {
            // user has flashcards
            res.redirect('/user/flashcards.html'); // FIXME: Need to redirect to the review cards view
          } else {
            // user does not have flashcards
            res.redirect('/user/flashcards.html');  // FIXME: Need to redirect to the create cards view
          }
        }
      }
  });

app.use(express.static('public'));  // can I find a static file?

// static files in /user are only available after login
app.get('/user/*',
  isAuthenticated, // only pass on to following function if
  // user is logged in 
  // serving files that start with /user from here gets them from ./
  express.static('.') 
       ); 

app.get('/username', usernameHandler);
app.get('/hascards', hasCardHandler);
app.get('/getcards', getCardHandler)
app.get('/translate', translateTextHandler);
app.post('/store', queryHandler);   // if not, is it a valid query?
app.use( fileNotFound );            // otherwise not found

app.listen(port, function (){console.log('Listening... Do something now!');} )

// middleware functions

// print the url of incoming HTTP request
function printURL (req, res, next) {
    console.log(req.url);
    next();
}

// function to check whether user is logged when trying to access
// personal data
function isAuthenticated(req, res, next) {
    if (req.user) {
  console.log("Req.session:",req.session);
  console.log("Req.user:",req.user);
  next();
    } else {
  res.redirect('/login.html');  // send response telling
  // Browser to go to login page
    }
}


// function for end of server pipeline
function fileNotFound(req, res) {
    let url = req.url;
    res.type('text/plain');
    res.status(404);
    res.send('Cannot find '+url);
    }

// Some functions Passport calls, that we can use to specialize.
// This is where we get to write our own code, not just boilerplate. 
// The callback "done" at the end of each one resumes Passport's
// internal process. 

// function called during login, the second time passport.authenticate
// is called (in /auth/accepted/),
// once we actually have the profile data from Google. 
function gotProfile(accessToken, refreshToken, profile, done) {
    console.log("Google profile",profile);
    // here is a good place to check if user is in DB,
    // and to store him in DB if not already there. 
    // Second arg to "done" will be passed into serializeUser,
    // should be key to get user out of database.

    let userID = profile.id;
    let firstName = profile.name.givenName;
    let lastName = profile.name.familyName;

    console.log("GOT THE PROFILE ID:", userID);

    // let searchCmdStr = `SELECT count(google_id) FROM UserInfo WHERE google_id = ${userID}`;
    let searchCmdStr = `SELECT * FROM UserInfo WHERE google_id = ${userID}`;
    flashcardDb.get(searchCmdStr, searchGoogleIDCallback);

    let dbRowID;

    function searchGoogleIDCallback(err, rowData) {
      if (err) {
        console.log("Error occurred in searchGoogleIDCallback function. Error is:", err);
        console.log("rowData is:", rowData);
      } else {
        console.log("Successfully found whether or not user exists in database:", rowData);

        if (rowData) {
          console.log("User already exists");
          dbRowID = userID;
          done(null, dbRowID);
        } else {
          // insert new user into database
          console.log("User does not exist");
          
          flashcardDb.run(`INSERT into UserInfo(google_id, first_name, last_name) VALUES (?, ?, ?)`,[userID, firstName, lastName], 
            function(err) {
              if (err) {
                console.log("Inserting new user into database error", err.message);
              } else {
                console.log("Inserting new user into database successful");
                dbRowID = userID;
                done(null, dbRowID);
              }
            }
          )
        }
      }
    }

    //let dbRowID = 1;  // temporary! Should be the real unique
    // key for db Row for this user in DB table.
    // Note: cannot be zero, has to be something that evaluates to
    // True.  
}

// Part of Server's sesssion set-up.  
// The second operand of "done" becomes the input to deserializeUser
// on every subsequent HTTP request with this session's cookie. 
passport.serializeUser((dbRowID, done) => {
    console.log("SerializeUser. Input is",dbRowID);
    done(null, dbRowID);
});

// Called by passport.session pipeline stage on every HTTP request with
// a current session cookie. 
// Where we should lookup user database info. 
// Whatever we pass in the "done" callback becomes req.user
// and can be used by subsequent middleware.
passport.deserializeUser((dbRowID, done) => {
    console.log("deserializeUser. Input is:", dbRowID);
    // here is a good place to look up user data in database using
    // dbRowID. Put whatever you want into an object. It ends up
    // as the property "user" of the "req" object.

    let searchCmdStr = `SELECT * FROM UserInfo WHERE google_id = ${dbRowID}`;
    flashcardDb.get(searchCmdStr, getUserInfoCallback);

    function getUserInfoCallback(err, rowData) {
      if (err) {
        console.log("Error occurred in getUserInfoCallback function. Error is:", err);
      } else {
        console.log("Successfully retrieved user info from database. Received:", rowData);
        /*
          rowData is an object in the format:
          { google_id: 0000000000000,
            first_name: 'FirstName',
            last_name: 'LastName' 
          }
        */
        console.log("this is rowData.google_id", rowData.google_id);
        console.log("this is rowData.first_name", rowData.first_name);
        console.log("this is rowData.last_name", rowData.last_name);
        console.log("this is rowData", rowData);
        let userData = {
          "google_id": rowData.google_id,
          "firstName": rowData.first_name,
          "lastName": rowData.last_name
        };
        console.log("*****************************************");
        console.log("this is userData ", userData);
        console.log("this is userData.google_id", userData.google_id);
        console.log("this is UserData.firstName", userData.firstName);
        console.log("this is UserData.lastName", userData.lastName);

	      done(null, userData);
      }
    }


    let searchCmdStr1 = `SELECT count(google_id) FROM UserInfo WHERE google_id = ${dbRowID}`;
    flashcardDb.get(searchCmdStr1, getUserInfoCallback2);

    function getUserInfoCallback2(err, rowData1) {
      if (err) {
        console.log("Error occurred in getUserInfoCallback function. Error is:", err);
      } else {
        console.log("Successfully retrieved user info from database FlashCards!!. Received:", rowData1);
        console.log("this is googleId count ", rowData1['count(google_id)']);
        /*
          rowData is an object in the format:
          { google_id: 0000000000000,
            first_name: 'FirstName',
            last_name: 'LastName' 
          }
        */
        // console.log("this is rowData.google_id", rowData.google_id);
        // console.log("this is rowData.first_name", rowData.first_name);
        // console.log("this is rowData.last_name", rowData.last_name);
        // console.log("this is rowData", rowData);
   
       

	      // done(null, userData);
      }
    }

    // let userData = {userData: "data from db row goes here"};
    // done(null, userData);
});











































// function queryHandler(req, res, next) {
//     let url = req.url;
//     let qObj = req.query;
//     let str = qObj.word;
//     console.log("this is qobh", str);
//     let stringRev ="";
//     for(let i= 0; i<str.length; i++){
//         stringRev = str[i]+stringRev;
//     }
  
//     if (qObj.word != undefined) {
//     console.log("hello this is qObj.word" ,req.query.word);
// 	res.json( {"palindrome" :  req.query.word + stringRev } );
//     }
//     else {
// 	next();
//     }
// }

/************************************INSERT VALUES TO DATABASE  ***************************/
// db.run(`INSERT INTO Flashcards(user_id,
//                                english_text,
//                                trans_text,
//                                num_show,
//                                num_correct) VALUES(8, 'testBrandyBuddy', 'testECS162', 99, 10)`, function(err) {
//     if (err) {
//       return console.log(err.message);
//     }
//     // get the last insert id
//     console.log(`A row has been inserted with userID ${this.changes}`);
//   });
/************************************END OF INSERT VALUES *******************************/

/**************************UPDATE THE DATABASE*************************/
// let data = [X, Y];
// X is the value you want to update to the database
// Y is the value you want to remove from the database
// so change from Y to X.

// let sql = `UPDATE Flashcards
//             SET user_id = ?
//             WHERE user_id = ?`;
 
// db.run(sql, data, function(err) {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log(`Row(s) updated: ${this.changes}`);
// });
/************************END OF UPDATE DATABASE ***************************/

/************************* Getting the value from the database ***************/
// let sql = `SELECT user_id id,
//                         english_text eText,
//                         trans_text tText,
//                         num_show nshow,
//                         num_correct ncorrect
//                 FROM Flashcards
//                 WHERE user_id  = ?`;
//         let user_id = 8; // need to ask prof about this since we dont have to have user_id yet
//         // maybe we can chage it into rowid or something 
        
//         // first row only
//         db.get(sql, [user_id], (err, row) => {
//         if (err) {
//             return console.log("Something is wrong cannot put insert data to the Database");
//         }
//         return row
//             ? console.log("this is the result for your queries select: ", row.id, row.eText, row.tText, row.nshow, row.ncorrect)
//             : console.log(`No playlist found with the id ${user_id}`);
        
//         });
