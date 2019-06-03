// Globals
const sqlite3 = require("sqlite3").verbose();  // use sqlite
const fs = require("fs"); // file system

const flashcardsDbFileName = "Flashcards.db";

// makes the object that represents the database in our code
const flashcardDb = new sqlite3.Database(flashcardsDbFileName,
    (err) => {
        if(err) {
            console.log("Error occurred when creating the Flashcards Database object.", err);
        }
        console.log("You successfully created the FlashCards database object.");
    });  // object, not database.

// Initialize table.
// If the table already exists, causes an error.
// Fix the error by removing or renaming Flashcards.db

/**************************************CREATING TABLE *******************************/
const flashcardsCmdStr = 'CREATE TABLE Flashcards (user_id INT, english_text VARCHAR(500), trans_text VARCHAR(500), num_show INT, num_correct INT)';
flashcardDb.run(flashcardsCmdStr, flashcardsTableCreationCallback);

function flashcardsTableCreationCallback(err) {
  if (err) {
   console.log("Flashcards Database Table creation error, you already created a table.", err);
  } else {
    console.log("Flashcards Database Table successfully created.");
  }
}

const userInfoCmdStr = 'CREATE TABLE UserInfo (google_id INT PRIMARY KEY, first_name TEXT, last_name TEXT)';
flashcardDb.run(userInfoCmdStr, userInfoTableCreationCallback);

function userInfoTableCreationCallback(err) {
  if (err) {
    console.log("UserInfo Database Table creation error, you already created a table.", err)
  } else {
    console.log("UserInfo Database Table successfully created.");
  }
}

flashcardDb.close();
/***********************************END OF CREATING TABLE ***************************/

// Always use the callback for database operations and print out any
// error messages you get.
// This database stuff is hard to debug, give yourself a fighting chance.


