"use strict";

const express = require("express");
const APIrequest = require("request");
const http = require("http");

const passport = require("passport");
const cookieSession = require("cookie-session");
const GoogleStrategy = require("passport-google-oauth20");

const APIkey = "AIzaSyAt9g5D8RZEYrisegFBSwmVazNBn0I3tP0"; // Google Translate API Key
const url =
  "https://translation.googleapis.com/language/translate/v2?key=" + APIkey;

const port = 54610;
const sqlite3 = require("sqlite3").verbose(); // use sqlite
const fs = require("fs"); // file system
const flashcardsDbFileName = "Flashcards.db";

/***************OPEN THE DATABASE *********************/
const flashcardDb = new sqlite3.Database(
  flashcardsDbFileName,
  sqlite3.OPEN_READWRITE,
  err => {
    if (err) {
      console.log(
        "Could not connect to Flashcards Database, something is wrong!"
      );
    }
    console.log("Successfully connected to the FlashCards database.");
  }
);

function queryHandler(req, res, next) {
  let url = req.url;
  let qObj = req.query;

  let engl = qObj.english;
  let trans = qObj.chinese;

  if (qObj.english != undefined) {
    flashcardDb.run(
      `INSERT INTO Flashcards(user_id,
                                         english_text,
                                         trans_text,
                                         num_show,
                                         num_correct) VALUES(?, ?, ?, 0, 0)`,
      [req.user.google_id, engl, trans],

      function(err) {
        if (err) {
          return console.log(
            "something is wrong cannot put the data to Database",
            err.message
          );
        }
        // get the last insert id
        console.log(`A row has been inserted: ${this.changes}`);
        res.json({});
      }
    );
  } else {
    next();
  }
}

function translateTextHandler(req, res, next) {
  // browser sends request to server in the format: {"english" : "text"}
  let qObj = req.query;

  if (qObj != undefined) {
    let requestObj = {
      source: "en",
      target: "zh-TW",
      q: [qObj.english]
    };

    function TranslateAPICallback(err, APIResHead, APIResBody) {
      if (err || APIResHead.statusCode != 200) {
        // API not working
        console.log("API error-- not working");
        console.log(APIResBody);
      } else {
        if (APIResHead.error) {
          // API request worked but not giving data
          console.log("API request worked, but no data returned");
          console.log(APIResHead.error);
        } else {
          console.log(
            "In Chinese: ",
            APIResBody.data.translations[0].translatedText
          );
          console.log("\nJSON was:");
          console.log(JSON.stringify(APIResBody, undefined, 2));
          console.log("\n");

          res.json({
            English: qObj.english,
            Chinese: APIResBody.data.translations[0].translatedText
          });
        }
      }
    }

    APIrequest(
      {
        url: url,
        method: "POST",
        headers: { "content-type": "application/json" },
        json: requestObj
      },
      TranslateAPICallback // translateAPI callback function
    );
  } else {
    next();
  }
}

function usernameHandler(req, res) {
  console.log("This is user in the USERNAME HANDLER: ", req.user);
  console.log(
    "This is user.FirstName in the USERNAME HANDLER: ",
    req.user.firstName
  );
  console.log(
    "This is user.LastName in the USERNAME HANDLER: ",
    req.user.lastName
  );
  let user_name = req.user.firstName + " " + req.user.lastName;

  res.json({ username: user_name });
}

function hasCardHandler(req, res) {
  let searchCmdStr = `SELECT count(user_id) FROM Flashcards WHERE user_id = ${
    req.user.google_id
  }`;
  flashcardDb.get(searchCmdStr, hasCardCallback);

  function hasCardCallback(err, rowData) {
    if (err) {
      console.log("Error occurred in hasCardCallback function. Error is:", err);
    } else {
      console.log(
        "Successfully retrieved retrieved user's flashcards count from database. Received:",
        rowData
      );

      let hasFlashcards;
      if (rowData["count(user_id)"] > 0) {
        hasFlashcards = true;
      } else {
        hasFlashcards = false;
      }
      res.json({ hasCard: hasFlashcards });
    }
  }
}

function putResultHandler(req, res, next) {
  let qObj = req.query;
  /*
    qObj contains:
    {
      unique_identifier: 000,
      result: "true or false depending whether or not user's answer is correct or not"
    }
  */

  if (qObj != undefined) {
    if (qObj.result == "false") {
      console.log(
        "User's answer was incorrect, no need to update num_correct in database"
      );
      res.json({});
    } else {
      console.log(
        "User's answer was correct, updating num_correct in database..."
      );

      let searchCmdStr = `SELECT num_correct FROM Flashcards WHERE row_id = ${Number(
        qObj.unique_identifier
      )}`;
      flashcardDb.get(searchCmdStr, checkResultCallback);

      function checkResultCallback(err, rowData) {
        if (err) {
          console.log(
            "Error occurred in checkResultCallback function. Error is:",
            err
          );
        } else {
          console.log(
            "Successfully found num_correct from database. Received:",
            rowData
          );

          let total_num_correct = rowData.num_correct + 1;

          let updateCmdStr = `UPDATE Flashcards SET num_correct = ${total_num_correct} WHERE row_id = ${Number(
            qObj.unique_identifier
          )}`;

          flashcardDb.run(updateCmdStr, updateCallback);

          function updateCallback(err) {
            if (err) {
              console.log(
                "Error occurred in updating the num_correct for the user in the database. Error is:",
                err
              );
            } else {
              console.log(
                "Successfully updated the num_correct for this user to " +
                  total_num_correct +
                  " in the database"
              );
              res.json({});
            }
          }
        }
      }
    }
  } else {
    next();
  }
}

function getCardHandler(req, res) {
  /**
   * The get() method executes an SQL query and calls the callback function on the first result row.
   * In case the result set is empty, the row argument is undefined.
   * USE GET WHEN When you know that the result set contains zero or one row
   */

  let searchCmdStr = `SELECT count(row_id) FROM Flashcards WHERE user_id = ${req.user.google_id}`;

  flashcardDb.get(searchCmdStr, getCardCallback);

  function getCardCallback(err, rowData) {
    if (err) {
      console.log("Error occurred in getCardCallback function. Error is:", err);
    } else {
      console.log(
        "Successfully retrieved user's flashcards from database. Received:",
        rowData
      );

      console.log(
        "User currently has this many flashcards in database:",
        rowData["count(row_id)"]
      );

      // let array_of_cards = new Array(rowData['count(row_id)']);
      let array_of_cards = [];

      let rowIDCmdStr = `SELECT row_id FROM Flashcards WHERE user_id = ${req.user.google_id}`;

      /**
       * http://www.sqlitetutorial.net/sqlite-nodejs/query/ reference
       */
      flashcardDb.all(rowIDCmdStr, (err, rowData) => {
        if (err) {
          console.log(
            "Error occurred in flashcardDb.each call. Error is:",
            err
          );
        } else {
          console.log("ROW DATA is:", rowData);

          // Loop through all the flashcards and assign the row_id of each flashcard into the array
          for (let i = 0; i < rowData.length; i++) {
            array_of_cards[i] = rowData[i].row_id;
            console.log(
              "Inserted " + rowData[i].row_id + " into the array_of_cards"
            );
            console.log("The array currently contains:", array_of_cards);
          }

          let randNum = Math.floor(Math.random() * array_of_cards.length);
          let aRandomCardRowID = array_of_cards[randNum];
          // get all the cards from one user and put it into array.
          flashcardDb.all(
            `SELECT *
                          FROM Flashcards
                          WHERE user_id = ${req.user.google_id}`, 
            (err, rowData2) => {
              let computedScore;
              if (err) {
                console.log(
                  "Error occurred in getting the Flashcard Table's columns corresponding to aRandomCardRowID. Error is:",
                  err
                );
              } else {
                console.log(
                  "Hell YEAH! we got an array of flashCards. Received:",
                  rowData2
                );
                console.log(
                  "This is the array card length ",
                  array_of_cards.length
                );
                for (let i = 0; i < 1000000000000; i++) {
                  let randomNumberForScore = Math.floor(
                    Math.random() * array_of_cards.length
                  );
                  // console.log("This is random Number ",randomNumberForScore);
                  // console.log("This is test for getting the num_show ", rowData2[randomNumberForScore].english_text);
                  if (rowData2[randomNumberForScore].num_show == 0) {
                    console.log(
                      "First case read ",
                      rowData2[randomNumberForScore].num_show
                    );
                    computedScore =
                      Math.max(
                        1,
                        5 - rowData2[randomNumberForScore].num_correct
                      ) +
                      Math.max(1, 5 - rowData2[randomNumberForScore].num_show) +
                      5;
                  } else {
                    console.log(
                      "Second case read ",
                      rowData2[randomNumberForScore].num_show
                    );
                    computedScore =
                      Math.max(
                        1,
                        5 - rowData2[randomNumberForScore].num_correct
                      ) +
                      Math.max(1, 5 - rowData2[randomNumberForScore].num_show) +
                      5 *
                        ((rowData2[randomNumberForScore].num_show -
                          rowData2[randomNumberForScore].num_correct) /
                          rowData2[randomNumberForScore].num_show);
                  }
                  let randNum2 = Math.floor(Math.random() * 16); // random number [0, 15]

                  if (randNum2 <= computedScore) {
                    // update the numShow in the database
                    let totalShow = rowData2[randomNumberForScore].num_show + 1;
                    console.log("hello???");
                    // function call to make sure it update the row
                    flashcardDb.run(
                      `UPDATE Flashcards SET num_show = ? WHERE row_id = ?`,
                      [totalShow, rowData2[randomNumberForScore].row_id],

                      err => {
                        if (err) {
                          console.log(
                            "Error occurred in updating the num_show for the flashcard. Error is:",
                            err
                          );
                        } else {
                          console.log(
                            "The num_show for the flashcard has been updated!"
                          );
                        }
                      }
                    ); // the end of flashCardDb.run
                    // show the card
                    console.log("we are sending the following to the json:");
                    console.log(rowData2[randomNumberForScore].row_id);
                    console.log(rowData2[randomNumberForScore].english_text);
                    console.log(rowData2[randomNumberForScore].trans_text);
                    res.json({
                      unique_identifier: rowData2[randomNumberForScore].row_id,
                      englishText: rowData2[randomNumberForScore].english_text,
                      translatedText: rowData2[randomNumberForScore].trans_text
                    });
                    break;
                  } else {
                    // don't show the card, need to find a different card
                  }
                }
              }
            }
          ); // the end of flashcardDb.Get
        }
      });
    }
  } // getCardCallback
} // getCardHandler

function fileNotFound(req, res) {
  let url = req.url;
  res.type("text/plain");
  res.status(404);
  res.send("Cannot find " + url);
}

// ====================================== LOGIN CODE =========================================

// Google login credentials, used when the user contacts
// Google, to tell them where he is trying to login to, and show
// that this domain is registered for this service.
// Google will respond with a key we can use to retrieve profile
// information, packed into a redirect response that redirects to
// server162.site:[port]/auth/accepted
const googleLoginData = {
  clientID:
    "83662678063-d224j3kj4jqqbgafvs2vp673p8b7vte3.apps.googleusercontent.com",
  clientSecret: "D5M7shd7W53awI1PAyZ_Rm55",
  callbackURL: "/auth/accepted"
};

// Strategy configuration.
// Tell passport we will be using login with Google, and
// give it our data for registering us with Google.
// The gotProfile callback is for the server's HTTPS request
// to Google for the user's profile information.
// It will get used much later in the pipeline.
passport.use(new GoogleStrategy(googleLoginData, gotProfile));

// Put together the server pipeline
const app = express();

// pipeline stage that just echos url, for debugging
app.use("/", printURL);

// Check validity of cookies at the beginning of pipeline
// Will get cookies out of request, decrypt and check if
// session is still going on.
app.use(
  cookieSession({
    maxAge: 6 * 60 * 60 * 1000, // Six hours in milliseconds
    // meaningless random string used by encryption
    keys: ["hanger waldo mercy dance"]
  })
);

// Initializes request object for further handling by passport
app.use(passport.initialize());

// If there is a valid cookie, will call deserializeUser()
app.use(passport.session());

// Public static files
app.get("/*", express.static("public"));

// next, handler for url that starts login with Google.
// The app (in public/login.html) redirects to here (not an AJAX request!)
// Kicks off login process by telling Browser to redirect to
// Google. The object { scope: ['profile'] } says to ask Google
// for their user profile information.
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);
// passport.authenticate sends off the 302 response
// with fancy redirect URL containing request for profile, and
// client ID string to identify this app.

// Google redirects here after user successfully logs in
// This route has three handler functions, one run after the other.
app.get(
  "/auth/accepted",
  // for educational purposes
  function(req, res, next) {
    console.log("at auth/accepted");
    next();
  },
  // This will issue Server's own HTTPS request to Google
  // to access the user's profile information with the
  // temporary key we got in the request.
  passport.authenticate("google"),
  // then it will run the "gotProfile" callback function,
  // set up the cookie, call serialize, whose "done"
  // will come back here to send back the response
  // ...with a cookie in it for the Browser!
  function(req, res) {
    console.log("Logged in and using cookies!");

    let searchCmdStr = `SELECT * from Flashcards WHERE user_id = ${req.user}`;

    flashcardDb.get(searchCmdStr, checkUserFlashcardsCallback);

    function checkUserFlashcardsCallback(err, rowData) {
      if (err) {
        console.log(
          "Error occurred in checkUserFlashcardsCallback function. Error is:",
          err
        );
      } else {
        console.log(
          "Successfully found whether or not user has/does not have flashcards in database:",
          rowData
        );
        if (rowData) {
          // user has flashcards
          res.redirect("/user/flashcards.html");
        } else {
          // user does not have flashcards
          res.redirect("/user/flashcards.html");
        }
      }
    }
  }
);

app.use(express.static("public")); // can I find a static file?

// static files in /user are only available after login
app.get(
  "/user/*",
  isAuthenticated, // only pass on to following function if
  // user is logged in
  // serving files that start with /user from here gets them from ./
  express.static(".")
);

app.get("/username", usernameHandler);
app.get("/hascard", hasCardHandler);
app.get("/getcard", getCardHandler);
app.post("/putresult", putResultHandler);
app.get("/translate", translateTextHandler);
app.post("/store", queryHandler); // if not, is it a valid query?
app.use(fileNotFound); // otherwise not found

app.listen(port, function() {
  console.log("Listening... Do something now!");
});

// middleware functions

// print the url of incoming HTTP request
function printURL(req, res, next) {
  console.log(req.url);
  next();
}

// function to check whether user is logged when trying to access
// personal data
function isAuthenticated(req, res, next) {
  if (req.user) {
    console.log("Req.session:", req.session);
    console.log("Req.user:", req.user);
    next();
  } else {
    res.redirect("/login.html"); // send response telling
    // Browser to go to login page
  }
}

// function for end of server pipeline
function fileNotFound(req, res) {
  let url = req.url;
  res.type("text/plain");
  res.status(404);
  res.send("Cannot find " + url);
}

// Some functions Passport calls, that we can use to specialize.
// This is where we get to write our own code, not just boilerplate.
// The callback "done" at the end of each one resumes Passport's
// internal process.

// function called during login, the second time passport.authenticate
// is called (in /auth/accepted/),
// once we actually have the profile data from Google.
function gotProfile(accessToken, refreshToken, profile, done) {
  console.log("Google profile", profile);
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
      console.log(
        "Error occurred in searchGoogleIDCallback function. Error is:",
        err
      );
      console.log("rowData is:", rowData);
    } else {
      console.log(
        "Successfully found whether or not user exists in database:",
        rowData
      );

      if (rowData) {
        console.log("User already exists");
        dbRowID = userID;
        done(null, dbRowID);
      } else {
        // insert new user into database
        console.log("User does not exist");

        flashcardDb.run(
          `INSERT into UserInfo(google_id, first_name, last_name) VALUES (?, ?, ?)`,
          [userID, firstName, lastName],
          function(err) {
            if (err) {
              console.log(
                "Inserting new user into database error",
                err.message
              );
            } else {
              console.log("Inserting new user into database successful");
              dbRowID = userID;
              done(null, dbRowID);
            }
          }
        );
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
  console.log("SerializeUser. Input is", dbRowID);
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
      console.log(
        "Error occurred in getUserInfoCallback function. Error is:",
        err
      );
    } else {
      console.log(
        "Successfully retrieved user info from database. Received:",
        rowData
      );
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
        google_id: rowData.google_id,
        firstName: rowData.first_name,
        lastName: rowData.last_name
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
      console.log(
        "Error occurred in getUserInfoCallback function. Error is:",
        err
      );
    } else {
      console.log(
        "Successfully retrieved user info from database FlashCards!!. Received:",
        rowData1
      );
      console.log("this is googleId count ", rowData1["count(google_id)"]);
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
