const express = require('express');
const body_parser = require('body-parser');
const fs = require('fs');
const fcm = require('fcm-push');

const devices = require('./devices');

const port = process.env.PORT || 8080;
const logFile = 'server.log';
const year = new Date().getFullYear();
const GCM_KEY = 'AIzaSyDcXYUfHMmOYF1I8XEtE2su8kEteV5nXt4';
const FCM_KEY = 'AAAAgZr5So0:APA91bEG7Xz1mI2Lt9_lVaZU8TqIPQ7gbzF1TF9FYCyBOEB0dh7KllVSClU2qGp48JdAOZiX8hJWfkZl0VEo-spqhzcCs9S1J-N8ZPAlDY5D2znNosDT95lrNxWAAUiW_J-sU7OhhgEe';

var fcmSender = new fcm(FCM_KEY);

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

app.post('/register', (request, response) => {
    devices.addDevice(request.body.deviceId, request.body.platform.toLowerCase())
        .then((result) => {
            var message = result ? 'Device registered successfully.' : 'Device already registered.';
            response.status(200).send({
                message
            });
        }, (errorObj) => {
            response.status(400).send({
                message: 'Device registeration failed',
                error: errorObj.message
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

    var toStr = (request.body.deviceId != null)? request.body.deviceId:'/topics/fcmdemo';

    var message = {
        to: toStr, // required fill with device token or topics
        collapse_key: 'JioMedia',
        timeToLive: 28 * 86400,
        data: {
            title: request.body.title,
            message: request.body.message
        },
        notification: {
            priority: 'high',
            sound: 'ping.aiff',
            title: request.body.title,
            body: request.body.message
        }
    };

    fcmSender.send(message, function (err, messageId) {
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

    /*devices.getPlatformDevices(request.body.platform.toLowerCase())
        .then((platformDevices) => {
            

        }, (errorObj) => {
            response.status(400)
                .send({
                    message: 'Notification push failed',
                    error: errorObj.message
                });
        })
        .catch((errorObj) => {
            response.status(400)
                .send({
                    message: 'Notification push failed',
                    error: errorObj.message
                });
        });*/
});