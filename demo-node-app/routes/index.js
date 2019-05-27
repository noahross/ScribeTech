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

    var filePath = path.join(__dirname, '..', 'dictionaries', 'English (USA).txt');
    var wordList = fs.readFileSync(filePath, 'utf8').split(',');
    console.log(wordList.length);

    var textFilePath = path.join(__dirname, '..', 'The Book of Six.txt');
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
    res.send(htmlBody);
});

module.exports = router;