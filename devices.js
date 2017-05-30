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
                ios: {},
                android: {}
            }, null);
        }
    });
};

saveDevicesAsync = (devices, resultHandler) => {
    fs.writeFile(fileName, JSON.stringify(devices, undefined, 4), resultHandler);
}

checkIfAlreadyAdded = (devicesInfo, jioId, deviceId, platform) => {
    var platformInfo = devicesInfo[platform];
    if (platformInfo != null && Object.keys(platformInfo).length > 0) {
        var savedDeviceId = platformInfo[jioId];
        return ((savedDeviceId != null) && (savedDeviceId === deviceId));
    }
    return null;
}

var addDeviceId = (jioId, deviceId, platform) => {
    return new Promise((resolve, reject) => {
        if (platform === 'ios' || platform === 'android') {
            if (jioId != null && deviceId != null) {
                getDevicesAsync((devicesInfo, error) => {
                    if (devicesInfo) {
                        if (!checkIfAlreadyAdded(devicesInfo, jioId, deviceId, platform)) {
                            var platformInfo = devicesInfo[platform];
                            platformInfo[jioId] = deviceId;
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
                reject(new Error('DeviceId/JioId cannot be null.'));
            }
        } else {
            reject(new Error('Platform not configured'));
        }
    });
}

var getPlatformDeviceIds = (platform) => {
    return new Promise((resolve, reject) => {
        if (platform === 'ios' || platform === 'android') {
            getDevicesAsync((devicesInfo, error) => {
                if (devicesInfo) {
                    var platformInfo = devicesInfo[platform];
                    if (platformInfo != null && Object.keys(platformInfo).length > 0) {
                        resolve(platformInfo);
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

var getPlatformDeviceIdForJioId = (platform, jioId) => {
    return new Promise((resolve, reject) => {
        if (platform === 'ios' || platform === 'android') {
            getDevicesAsync((devicesInfo, error) => {
                if (devicesInfo) {
                    var platformInfo = devicesInfo[platform];
                    if (platformInfo != null && Object.keys(platformInfo).length > 0) {
                        var savedDeviceId = platformInfo[jioId];
                        if (savedDeviceId != null) {
                            resolve(savedDeviceId);
                        } else {
                            reject(new Error('No device found for this jioId.'));
                        }
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
    addDeviceId,
    getPlatformDeviceIdForJioId,
    getPlatformDeviceIds
}