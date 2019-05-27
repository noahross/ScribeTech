const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Registration = mongoose.model('Registration');
const path = require('path');
const auth = require('http-auth');
const basic = auth.basic({
    file: path.join(__dirname, '../users.htpasswd'),
});

const {body, validationResult} = require('express-validator/check');

router.get('/', (req, res) => {
    res.render('form', {title: 'Registration Form'});
});

router.post('/',
    [
        body('name')
            .isLength({min: 1})
            .withMessage('Please enter a name'),
        body('email')
            .isLength({min: 1})
            .withMessage('Please enter an email'),
    ],
    (req, res) => {
        const errors = validationResult(req);

        if(errors.isEmpty()) {
            const registration = new Registration(req.body);
            registration.save()
                .then(() => {res.send('Thank you for your registrations!'); })
                .catch(() => { res.send('Sorry! Something went wrong.'); });
        } else {
            res.render('form', {
                title: 'Registration Form',
                errors: errors.array(),
                data: req.body,
            });
        }
    }
);

router.get('/registrations', auth.connect(basic), (req, res) => {
    Registration.find()
        .then((registrations) => {
            res.render('index', {title: 'Listing Registrations', registrations});
        })
        .catch(() => {res.send('Sorry! Something went wrong.'); });
});

router.get('/parse', (req, res) => {
    var fs = require('fs');
    var path = require('path');

    //res.send('Working on it.');
    var filePath = path.join(__dirname, '..', 'dictionaries', 'English (USA).txt');
    var wordList = fs.readFileSync(filePath, 'utf8').split(',');
    console.log(wordList.length);

    var textFilePath = path.join(__dirname, '..', 'The Book of Six.txt');
    var bodyText = fs.readFileSync(textFilePath, 'utf8');
    var words = bodyText.trim().replace(/[\u2018\u2019]/g, '\'').replace(/(?=[\W_])(?:[^\w']+_*|_+)+/g, " ").toLowerCase().split(" ").sort();
    var wordCount = 0;
    var wordMap = {};

    words.forEach(function(word){
        word = processWord(word);
        if(word.length > 1 && !wordList.includes(word)) {
            if(wordMap[word] === null || wordMap[word] === undefined) {
                wordMap[word] = 1;
                wordCount++;
            } else {
                wordMap[word] = wordMap[word] + 1;
            }
        }
    });

    var htmlBody = wordList.length.toString() + ' - ' + words.length.toString() + ' - ' + wordCount + '</p>';
    htmlBody += '<table><tr><th>Word</th><th>Instances</th></tr>';
    for(var key in wordMap) {
        htmlBody += '<tr><td>' + key + '</td><td>' + wordMap[key].toString() + '</td></tr>';
    }
    res.send(htmlBody);
});

router.get('/extractContractions', (req, res) => {
    var fs = require('fs');
    var path = require('path');

    //res.send('Working on it.');
    var filePath = path.join(__dirname, '..', 'dictionaries', 'English (USA).txt');
    var wordList = fs.readFileSync(filePath, 'utf8').split(',');
    console.log(wordList.length);

    var textFilePath = path.join(__dirname, '..', 'The Book of Six.txt');
    var bodyText = fs.readFileSync(textFilePath, 'utf8');
    var words = bodyText.trim().replace(/[\u2018\u2019]/g, '\'').replace(/(?=[\W_])(?:[^\w']+_*|_+)+/g, " ").toLowerCase().split(" ").sort();
    var wordCount = 0;
    var wordMap = {};
    var htmlBody = '';

    words.forEach(function(word){
        if(word.includes('\'')) {
            var ind = word.indexOf('\'');
            if(ind === 0 || ind === word.length-1 || (ind === word.length-2 && word[word.length-1] === 's')) {
                word = word.substring(0,word.length-2);
            } else if(ind >= word.length-3){
                wordMap[word] = 1;
            }
        }
    });

    var htmlBody = '';
    for(var key in wordMap) {
        if(htmlBody.length != 0) {
            htmlBody += ',';
        }
        htmlBody += key;
    }
    res.send(htmlBody);
});

var processWord = function(word) {
    if(word.includes('\'')) {
        var ind = word.indexOf('\'');
        if(ind === word.length-1 || (ind === word.length-2 && word[word.length-1] === 's')) {
            word = word.substring(0,word.length-2);
        } else if(ind === 0){
            word = replaceAll(word, '\'', '');
        } else {
            console.log(word);
        }
    }

    return word;
};

var replaceAll = function(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
};

var escapeRegExp = function(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
};

module.exports = router;