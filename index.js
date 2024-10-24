const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const fs = require('fs');

const apiStartTime = new Date().toISOString();
const netCoreVersion = "5.0.0";
const apiCreationDate = "2024-05-29";

// Array to store registered endpoints
let endpoints = [];

// Function to register endpoints with description
const registerEndpoint = (method, route, description) => {
  app[method.toLowerCase()](route, (req, res, next) => {
    console.log(`Handling ${method} request for ${route}`);
    if (description) {
      endpoints.push({ method, route, description });
    }
    next();
  });
};



// Get API start time
registerEndpoint('GET', '/api/status/v2', 'Get the API start time');
app.get('/api/status/v2', (req, res) => {
  res.json({ startTime: apiStartTime });
});

// Get .NET Core version, API creation date, and overall health
registerEndpoint('GET', '/api/lightswitch/v2', 'Get .NET Core version, API creation date, and overall health');
app.get('/api/lightswitch/v2', (req, res) => {
  res.json({
    netCoreVersion: netCoreVersion,
    apiCreationDate: apiCreationDate,
    health: "Healthy"
  });
});

// List all files in the "Files" directory
registerEndpoint('GET', '/api/files/v2', 'List all files in the "Files" directory');
app.get('/api/files/v2', (req, res, next) => {
  const filesDirectory = path.join(__dirname, 'Files');
  fs.readdir(filesDirectory, (err, files) => {
    if (err) {
      console.error('Failed to read directory:', err);
      return res.status(500).json({ error: 'Unable to read files directory', message: err.message });
    }

    const fileList = files.map(file => ({
      name: file,
      downloadUrl: `/api/download/v2?name=${file}`
    }));

    res.json(fileList);
  });
});

// Launch the API
registerEndpoint('GET', '/api/launch/v2', 'Launch the API');
app.get('/api/launch/v2', (req, res) => {
  res.json({ launch: true });
});

// Download a file from the "Files" directory
registerEndpoint('GET', '/api/download/v2', 'Download a file from the "Files" directory');
app.get('/api/download/v2', (req, res) => {
  const fileName = req.query.name;
  if (!fileName) {
    return res.status(400).json({ error: 'Bad Request', message: 'File name is required' });
  }
  const filePath = path.join(__dirname, 'Files', fileName);
  res.download(filePath, (err) => {
    if (err) {
      console.error('File failed to download:', err);
      return res.status(404).json({ error: 'Not Found', message: 'File not found' });
    }
  });
});

// Get the list of all available API endpoints
registerEndpoint('GET', '/api/endpoints', 'Get the list of all available API endpoints');
app.get('/api/endpoints', (req, res) => {
  res.json(endpoints);
});

// Force restart the server
registerEndpoint('POST', '/api/restart', 'Force restart the server');
app.post('/api/restart', (req, res) => {
  res.json({ message: 'Server is restarting...' });
  console.log('Server is restarting...');
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

app.listen(port, () => {
  console.log(`API started on port ${port}`);
});
