const express = require('express');
const body_parser = require('body-parser');
const fs = require('fs');
const fcm = require('fcm-push');

const devices = require('./devices');

const port = process.env.PORT || 8080;
const logFile = 'server.log';
const year = new Date().getFullYear();
//const FCM_KEY = 'AAAAgZr5So0:APA91bEG7Xz1mI2Lt9_lVaZU8TqIPQ7gbzF1TF9FYCyBOEB0dh7KllVSClU2qGp48JdAOZiX8hJWfkZl0VEo-spqhzcCs9S1J-N8ZPAlDY5D2znNosDT95lrNxWAAUiW_J-sU7OhhgEe';
const FCM_KEY = 'AAAA7KpxExM:APA91bH3DC8Um5-TY0FfXcm4krOYdaJTGLm5vhARjFKnVPSqlISPyNMwHrP-eIf-oK57LbBqw3UN17qkiteLS7jXbPvAgimXWTarxo606V0y-e7c8YfPg-yLOBqaG0kHugv3J4u3jF8C';

var fcmSender = new fcm(FCM_KEY);
var sendNotification = (message, resultHandler) => {
    fcmSender.send(message, resultHandler);
};

var app = express();
app.listen(port, () => {
    console.log(`Server is up on port ${port}!`);
});
app.use(body_parser.json()); // for parsing application/json
app.use((request, response, next) => {
    var now = new Date().toString();
    var logText = `${now}:- ${request.method}-----${request.url}\n${JSON.stringify(request.body)}`
    fs.appendFile(logFile, logText + '\n', (err) => {
        if (err) {
            console.log('Unable to append to server.log file.');
        }
    });
    console.log(logText);
    next();
});

app.get('/', (request, response) => {
    response.sendFile(__dirname + '/home.html');
});

app.post('/register', (request, response) => {
    devices.addDeviceId(request.body.jioId, request.body.deviceId, request.body.platform.toLowerCase())
        .then((result) => {
            var message = result ? 'Device registered successfully.' : 'Device already registered.';
            response.status(200).send({
                message
            });
        })
        .catch((errorObj) => {
            response.status(400).send({
                message: 'Device registeration failed',
                error: errorObj.message
            });
        });
});

app.post('/push', (request, response) => {
    
    var message = {
        to: '/topics/fcmdemo', // required fill with device token or topics
        collapse_key: 'JioMedia',
        timeToLive: 28 * 86400,
        data: request.body.data,
        notification: request.body.notification
    };

    if (request.body.jioId != null) {
        devices.getPlatformDeviceIdForJioId(request.body.platform.toLowerCase(), request.body.jioId)
            .then((deviceId) => {
                message.to = deviceId;
                sendNotification(message, function (err, messageId) {
                    if (err) {
                        response.status(400).send({
                            message: 'Notification push failed',
                            error: err
                        })
                    } else {
                        response.status(200).send({
                            message: 'Notification push success',
                            result: messageId
                        })
                    }
                });
            })
            .catch((errorObj) => {
                response.status(400).send({
                    message: 'Notification push failed',
                    error: errorObj.message
                });
            });
    } else {
        sendNotification(message, function (err, messageId) {
            if (err) {
                response.status(400).send({
                    message: 'Notification push failed',
                    error: err
                })
            } else {
                response.status(200).send({
                    message: 'Notification push success',
                    result: messageId
                })
            }
        });
    }
});