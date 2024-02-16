import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import https from 'https';
import http from 'http';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import profileRoutes from './profile.js';
import eventRoutes from './events.js';
import groupRoutes from './groups.js';
import chatRoutes from './chats.js';
import reportRoutes from './reports.js';

var app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// This makes it work on AWS
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, '../build')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.use(profileRoutes);
app.use(eventRoutes);
app.use(groupRoutes);
app.use(chatRoutes);
app.use(reportRoutes);

const httpsOptions = {
  key: fs.readFileSync('./security/cert.key'),
  cert: fs.readFileSync('./security/cert.pem')
}

if(false)
{
  const server = https.createServer(httpsOptions, app)
      .listen(5000, () => {
          console.log('server running at ' + 5000)
      });
}
else
{
  const server = http.createServer(app)
      .listen(5000, () => {
          console.log('server running at ' + 5000)
      });
}
