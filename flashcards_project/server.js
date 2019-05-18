const express = require('express')
const port = 3000
const sqlite3 = require("sqlite3").verbose();  // use sqlite
const fs = require("fs"); // file system
const dbFileName = "Flashcards.db";

/***************OPEN THE DATABASE *********************/
const db = new sqlite3.Database(dbFileName, sqlite3.OPEN_READWRITE,
    (err) => {
        if(err) {
            console.log("you do not connected to the database something is wrong!");
        }
        console.log("you successfully connected to the FlashCards database.")
    });

function queryHandler(req,res,next) {
    let url = req.url;
    let qObj = req.query;
    let engl = qObj.english; // need to change this still gotta see the json file
    let trans = qObj.trans; // same here

    if (qObj.english != undefined) {
        db.run(`INSERT INTO Flashcards(user_id,
                                           english_text,
                                           trans_text,
                                           num_show,
                                           num_correct) VALUES(1, engl, trans, 0, 0)`, 
            function(err) {
                if (err) {
                  return console.log("something is wrong cannot put the data to Database", err.message);
                }
                // get the last insert id
                console.log(`A row has been inserted ${this.changes}`);
              });
    } else {
        next();
    }
}

function fileNotFound(req, res) {
    let url = req.url;
    res.type('text/plain');
    res.status(404);
    // res.send('Cannot find '+url);
    res.send('Hello there!! '+url);

    }

// put together the server pipeline
const app = express()
app.use(express.static('public'));  // can I find a static file? 
app.get('/query', queryHandler );   // if not, is it a valid query?
app.use( fileNotFound );            // otherwise not found

// app.listen(port, function (){console.log('Listening... Do something now!');} )
app.listen(port, function (){console.log('Listening... Do something now!');} )





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
