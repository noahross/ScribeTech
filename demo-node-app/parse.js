var fs = require('fs');
var path = require('path');

//res.send('Working on it.');
var filePath = path.join(__dirname, 'dictionaries', 'English (USA).txt');
var wordList = fs.readFileSync(filePath, 'utf8').split(',');
console.log(wordList.length);

var textFilePath = path.join(__dirname, 'The Book of Six.txt');
var bodyText = fs.readFileSync(textFilePath, 'utf8');
var words = bodyText.trim().replace(/(?=[\W_])(?:[^\w]+_*|_+)+/g, " ").split(" ").sort();
var wordCount = 0;
var wordMap = {};

words.forEach(function(word){
    word = word.toLowerCase();
    if(word.length > 1 && !wordList.includes(word)) {
        if(wordMap[word] === null || wordMap[word] === undefined) {
            wordMap[word] = 1;
            wordCount++;
        } else {
            wordMap[word] = wordMap[word] + 1;
        }
    }
});

var htmlBody = wordList.length.toString() + ' - ' + words.length.toString() + ' - ' + wordCount;
for(var key in wordMap) {
    htmlBody += '<br />' + key + ' - ' + wordMap[key].toString() + ' instances'; 
}
return htmlBody;