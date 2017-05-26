const fs = require('fs');

const fileName = 'devices-info.json';

getDevicesAsync = (resultHandler) => {
    fs.exists(fileName, (exists) => {
        if (exists) {
            fs.readFile(fileName, (err, data) => {
                if (err) {
                    resultHandler(null, err);
                } else {
                    resultHandler(JSON.parse(data), null);
                }
            });
        } else {
            resultHandler({
                ios: [],
                android: []
            }, null);
        }
    });
};

saveDevicesAsync = (devices, resultHandler) => {
    fs.writeFile(fileName, JSON.stringify(devices, undefined, 4), resultHandler);
}

checkIfAlreadyAdded = (devicesInfo, deviceId, platform) => {
    var platformDevicesInfo = devicesInfo[platform];
    if (platformDevicesInfo != null) {
        var savedPlatformDevicesInfo = platformDevicesInfo.filter((tempDeviceId) => tempDeviceId === deviceId);
        if (savedPlatformDevicesInfo != null && savedPlatformDevicesInfo.length > 0) {
            return savedPlatformDevicesInfo[0];
        }
        return null;
    }
    return null;
}

var addDevice = (deviceId, platform) => {
    return new Promise((resolve, reject) => {
        if (platform === 'ios' || platform === 'android') {
            if (deviceId != null) {
                getDevicesAsync((devicesInfo, error) => {
                    if (devicesInfo) {
                        if (!checkIfAlreadyAdded(devicesInfo, deviceId, platform)) {
                            var platformDevicesInfo = devicesInfo[platform];
                            platformDevicesInfo.push(deviceId);
                            saveDevicesAsync(devicesInfo, (error) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(true);
                                }
                            });
                        } else {
                            resolve(false);
                        }
                    } else {
                        reject(new Error('Unable to add device id.'));
                    }
                });
            } else {
                reject(new Error('Device id cannot be null.'));
            }
        } else {
            reject(new Error('Platform not configured'));
        }
    });
}

var getPlatformDevices = (platform) => {
    return new Promise((resolve, reject) => {
        if (platform === 'ios' || platform === 'android') {
            getDevicesAsync((devicesInfo, error) => {
                if (devicesInfo) {
                    var platformDevicesInfo = devicesInfo[platform];
                    if (platformDevicesInfo != null && platformDevicesInfo.length > 0) {
                        resolve(platformDevicesInfo);
                    } else {
                        reject(new Error('No device found for this platform.'));
                    }
                } else {
                    reject(error);
                }
            });
        } else {
            reject(new Error('Platform not configured'));
        }
    });
}

module.exports = {
    addDevice,
    getPlatformDevices
}