/**
 * Created by ecyarar on 24.03.2017.
 */
var request = require('request');
var config = require('./config.json');
var winston = require('winston');
var slackAPI = require('slackbotapi');
var slackweatherbot = require('slackweatherbot');
weatherBot = new slackweatherbot();
// Starting
var slack = new slackAPI({
    'token': config.slack_token,
    'logging': true,
    'autoReconnect': true
});

// Slack on EVENT message, send data.

slack.on('message', function (data) {
    // If no text, return.
    if (typeof data.text === 'undefined') return;
    winston.debug(data); //*-----*
    // If someone says `cake!!` respond to their message with 'user OOH, CAKE!! :cake:'
    if (data.text == 'selam!') slack.sendMsg(data.channel, '@' + slack.getUser(data.user).name + ' Ooh, Selam!! :robot_face:');
    // If the first character starts with %, you can change this to your own prefix of course.
    if (data.text.charAt(0) === '-') {
        // Split the command and it's arguments into an array
        var command = data.text.substring(1).split(' ');

        // If command[2] is not undefined, use command[1] to have all arguments in command[1]
        if (typeof command[3] !== 'undefined') {
            for (var i = 2; i < command.length; i++) {
                command[1] = command[1] + ' ' + command[i];
            }
        }


        // Switch to check which command has been requested.
        switch (command[0].toLowerCase()) {
            case 'hello':
            case 'selam':
                // Send message
                slack.sendMsg(data.channel, 'Aydes Test Sistemine hoşgeldin @' + slack.getUser(data.user).name + ' !');
                break;
            case 'hava':
                var location = command[1];
                weatherBot.getWeather(location, function (err, message) {
                    if (message) slack.sendMsg(data.channel, message);
                });
                break;
            case 'help':
                slack.sendMsg(data.channel, 'Jenkins Komut Listesi!\n\n * :computer: "-jenkins build" e deploy etmek istediğiniz job adını ekleyiniz.' +
                     '\n * :sunny: "-hava" komutu ile istediğiniz şehrin günlük hava durumunu öğrenebilirsin. \n * :robot_face: Benimle konuşmak için "-selam" demen yeterli!');
                break;
            case 'jenkins':
                 if (command[1].toLowerCase() == 'build') {
                    winston.info('command:' + command[2]);
                    config.jenkins_method == 'GET';
                    var options = {
                        method: 'GET',
                        uri: config.jenkins_url + 'job/' + command[2] + '/build?token=' + config.jenkins_token,
                    }}
                 else if (command[1].toLowerCase() !== 'build') {
                     options={}
                 }
               // console.log(JSON.stringify(options));
                winston.info('options:' + JSON.stringify(options));
                request(options, function (err, res, body) {
                    winston.info('res:' + JSON.stringify(res));
                    winston.info('body:' + body);
                    if (!err && (res.statusCode == 200 || res.statusCode == 201 )) {
                        slack.sendMsg(data.channel, 'Deployment başladı, sıkıntı yok!');
                    } else {
                        winston.info('res:' + JSON.stringify(res) + '\nbody:' + body);
                        slack.sendMsg(data.channel, 'Ops! Bir yerde yanlışlık oldu, tekrar kontrol eder misin? Yardım için -help kullanabilirsin :relieved:');
                    }
                });

                break;
            default:
                slack.sendMsg(data.channel, 'Bak bilmediğim yerden sordun bu sefer :smile: ');
                break;
        }
    }
});

slack.on('team_join', function (data) {
    // Greet a new member that joins
    slack.sendPM(data.channel, 'Selam, takıma hoşgeldin! :simple_smile: :beers:');
});