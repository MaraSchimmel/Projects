const express = require('express');
const app = express();
const port = 8080;
var path = require('path');
app.use(express.static('public'));

// Body parser provides support for reading JSON bodies of POST requests
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Return root page
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/index.html')));

// Receive a request from the server
app.get('/submit', function(req, res) {

    var name = req.query.name;
    name = name.toLowerCase();
    console.log("Name: " + name);

    var data = {message: index[name]};

    res.setHeader('Content-Type', 'application/json');
    //res.json(data);
    res.json(data);
});

/**
 * Search engine starter code
 */


// Load required packages
const fs = require('fs');

function punct(str) {
  return str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
}
/**
 * Process the complete text of one file
 */
let numLines = 0;
function readText(err, fullText) {

    // If there was an error, give up
    if (err) {
        console.log(err);
        return;
    }

    // Split the complete text, which is one huge string,
    // into separate lines using a regular expression
    let lines = fullText.split(/\r?\n/)

    numLines = 0;
    let playName = "";
    let actNum = "";
    let sceneNum = "";
    let char = "";
    let word = "";
    let isStage = false;
    let changeStage = false;
    // Loop through each line
    // Process each line
    for (let line of lines) {
        if (numLines == 0) {
          playName = line;
        }//playline

        let ele = line.split("\t");
        let ele1 = ele[0].split("  ");
        
        if (ele1[0].includes("AND") && ele1.length > 1) {
          //console.log(line);
          char = ele1[0];
          let words = ele1[1].split(" ");
          for (let wordSel of words) {
            if (wordSel != '') {
              word = wordSel;
              //console.log(word);
              if (word.includes("[") || word.includes("]")) {
                isStage = true;
                if (word.charAt(0) == "[") {
                  word = word.substring(1, word.length);
                }
                else {
                  word = word.substring(0, word.length - 1);
                  changeStage = true;
                }
              }//If its a stage direction, mark it a stage direction

              word = punct(word);
              word = word.toLowerCase();

              if (index[word] == undefined) {
                index[word] = [];
                //console.log('word not found: ' + word);
              }//if

              let strBuild = '{"playName":"' + playName + '", "actNum":"' + actNum + '", "sceneNum":"' + sceneNum + '", "char":"' + char + '", "line":"' + ele1[0] + "&nbsp;&nbsp;&nbsp;&nbsp;" + ele1[1] + '","isStage":' + isStage + '}';
              //console.log(typeof(strBuild));
              var data = JSON.parse(strBuild);
              if (changeStage) {
                isStage = false;
                changeStage = false;
              }
              index[word].push(data);
              //console.log(Object.keys(index).length);
            }
          }
        }

        
        if (ele[0].includes("ACT")) {
          let words = ele[0].split(" ");
          actNum = words[1];
        }
      
        let words;
        if (ele.length == 2) {
          let ele0 = ele[0].split(" ");
          if (ele0[0] == "SCENE") {
            //console.log(ele[0]);
            sceneNum = ele0[1];
          }
          else {
            char = ele[0];
            words = ele[1].split(" ");
            for (let wordSel of words) {
              if (wordSel != '') {
                word = wordSel;
                //console.log(word);
                if (word.includes("[") || word.includes("]")) {
                  isStage = true;
                  if (word.charAt(0) == "[") {
                    word = word.substring(1, word.length);
                  }
                  else {
                    word = word.substring(0, word.length - 1);
                    changeStage = true;
                  }
                }//If its a stage direction, mark it a stage direction
                
                word = punct(word);
                word = word.toLowerCase();
                
                if (index[word] == undefined) {
                  index[word] = [];
                  //console.log('word not found: ' + word);
                }//if
                
                let strBuild = '{"playName":"' + playName + '", "actNum":"' + actNum + '", "sceneNum":"' + sceneNum + '", "char":"' + char + '", "line":"' + ele[0] + "&nbsp;&nbsp;&nbsp;&nbsp;" + ele[1] + '","isStage":' + isStage + '}';
                //console.log(typeof(strBuild));
                var data = JSON.parse(strBuild);
                if (changeStage) {
                  isStage = false;
                  changeStage = false;
                }
                index[word].push(data);
              }
            }
          }//else

        }//main if
        
        if (line.charAt(0) == " ") {
          words = line.split(" ");
          //console.log(words);
          //console.log(line);
          for (let wordSel of words) {
            if (wordSel != '') {
              word = wordSel;
              //console.log(word);
              if (word.includes("[") || word.includes("]")) {
                isStage = true;
                //console.log(word);
                if (word.charAt(0) == "[") {
                  word = word.substring(1, word.length);
                }
                if (word.charAt(word.length - 1) == "]") {
                  word = word.substring(0, word.length - 1);
                  changeStage = true;
                }
                //console.log(word);
              }//If its a stage direction, mark it a stage direction

              word = punct(word);
              word = word.toLowerCase();
              
              if (index[word] == undefined) {
                index[word] = [];
                //console.log('word not found: ' + word);
              }
              let strBuild = '{"playName":"' + playName + '", "actNum":"' + actNum + '", "sceneNum":"' + sceneNum + '", "char":"' + char + '", "line":"' + "&nbsp;&nbsp;&nbsp;&nbsp;"+ line + '","isStage":' + isStage + '}';
              var data = JSON.parse(strBuild);
              if (changeStage) {
                isStage = false;
                changeStage = false;
              }
              index[word].push(data);
            }
          }
        }
        numLines += 1;
    }
}


/**
 * Main -- setup the index
 */ 

// Index object
let index = {}

// List of the plays
let texts = ['macbeth.txt', 'romeo_and_juliet.txt', 'a_midsummer_nights_dream.txt']

// Read the contents of each text, then call the readText function
//
// Note: readText runs asynchronously, so you can't guarantee that the 
// callbacks execute in any particular order
//
// Also note: this version reads the entire text of the file into one
// string, which may not always be what you want. There are other options
// to read files line by line, but you have to use a PER-LINE callback.

//fs.readFile('./texts/sample.txt', 'utf8', readText);
for (let text of texts) {
   fs.readFile('./texts/' + text, 'utf8' , readText);
}//*/


// Run server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
