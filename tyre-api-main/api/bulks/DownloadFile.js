// const fs = require('fs');
// const http = require('http');
import fs from 'fs';
import https from 'https';

export const download = (url, dest, cb) => {
  const file = fs.createWriteStream(dest);

  const request = https.get(url, (response) => {
    // check if response is success
    if (response.statusCode !== 200) {
      return cb('Response status was ' + response.statusCode);
    }
    // console.log('File', file.path);
    // cb(null, file.path);
    response.pipe(file);
  });

  // close() is async, call cb after close completes
  file.on('finish', () => file.close(cb));

  // check for request error too
  request.on('error', (err) => {
    fs.unlink(dest, () => cb(err.message)); // delete the (partial) file and then return the error
  });

  file.on('error', (err) => {
    // Handle errors
    fs.unlink(dest, () => cb(err.message)); // delete the (partial) file and then return the error
  });
};
