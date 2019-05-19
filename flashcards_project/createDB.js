// Globals
const sqlite3 = require("sqlite3").verbose();  // use sqlite
const fs = require("fs"); // file system

const dbFileName = "Flashcards.db";
// makes the object that represents the database in our code
const db = new sqlite3.Database(dbFileName,
    (err) => {
        if(err) {
            console.log("You did not create the database something is wrong", err);
        }
        console.log("you successfully create the FlashCards database.");
    });  // object, not database.

// Initialize table.
// If the table already exists, causes an error.
// Fix the error by removing or renaming Flashcards.db
/**************************************CREATING TABLE *******************************/
const cmdStr = 'CREATE TABLE Flashcards (user_id INT,english_text VARCHAR(500),trans_text VARCHAR(500), num_show INT, num_correct INT)';
db.run(cmdStr,tableCreationCallback);

function tableCreationCallback(err) {
    if (err) {
	console.log("Table creation error you already create a table",err);
    } else {
	console.log("Database created");
	db.close();
    }
}
/***********************************END OF CREATING TABLE ***************************/

// Always use the callback for database operations and print out any
// error messages you get.
// This database stuff is hard to debug, give yourself a fighting chance.


