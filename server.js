require('dotenv').config({ silent: true });

const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const http = require('http');
const moment = require('moment-timezone');
moment.tz.setDefault('UTC');
const serialize = require('serialize-javascript');
const mongodb = require('mongodb');
const objectId = require('mongodb').ObjectId;
const _ = require('lodash');

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(require('body-parser').json())

let renderer

if (process.env.NODE_ENV === 'production') {
  let bundle = fs.readFileSync('./dist/node.bundle.js', 'utf8');
  renderer = require('vue-server-renderer').createBundleRenderer(bundle)
  app.use('/dist', express.static(path.join(__dirname, 'dist')));
}

const server = http.createServer(app);

if (process.env.NODE_ENV === 'development') {
  const reload = require('reload');
  const reloadServer = reload(server, app);
  require('./webpack-dev-middleware').init(app);
  require('./webpack-server-compiler').init(function(bundle) {
    const needsReload = (renderer === undefined)
    renderer = require('vue-server-renderer').createBundleRenderer(bundle)
    if (needsReload) {
      reloadServer.reload()
    }
  });
}

server.listen(process.env.PORT, function () {
  console.log(`Example app listening on port ${process.env.PORT}!`);
  if (process.env.NODE_ENV === 'development') {
    require("open")(`http://localhost:${process.env.PORT}`);
  }
});

mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {

  const _events = db.collection('events');
  let events = []

  // Server render - Boot server fetching events from DB
  _events.find().sort({_id: -1}).toArray(function(err, results){

    if(err){
      console.log(err)
      return;
    }

    //Apply moment() to the dates
    events = results.map(event => {
      return {
        id: event._id,
        description: event.description,
        date: moment(event.date)
      };
    })

    app.get('/', (req, res) => {
      let template = fs.readFileSync(path.resolve('./index.html'), 'utf-8');
      const contentMarker = '<!--APP-->'

      if(renderer) {
        renderer.renderToString({ events }, (err, html) => {
          if (err) {
            console.log(err)
          } else {
            res.send(template.replace(contentMarker, `<script>var __INITIAL_STATE__ = ${serialize(events)}</script>\n${html}`))
          }
        })
      } else {
        res.send('<p>Awaiting compilation...</p><script src="/reload/reload.js"></script>')
      }
    });

  });

  app.post('/events', (req, res) => {
    _events.insert(req.body, function(err, results){

      if(err){
        res.status(500).json(err);
        return;
      }

      const event = {
        id: results.ops[0]._id,
        description: req.body.description,
        date: moment(req.body.date)
      }

      events.push(event)
      res.send(event)
    });
  })

  app.patch('/events/:id', (req, res) => {

    _events.update(
      { _id : objectId(req.params.id) },
      {
        $set: {description: req.body.description}
      },
      {},
      function(err, results){
        if(err){
          res.status(500).json(err);
          return
        }

        const index = _.findIndex(events, function(o) { return o.id == req.body.id; });
        let newEvents = [...events]
        newEvents[index] = req.body
        newEvents[index].date = moment(newEvents[index].date)
        events = newEvents

        res.status(200).json(results);
      });
  })

  app.delete('/events/:id', (req, res) => {
    _events.remove(
      { _id : objectId(req.params.id) },
      function(err, results){
        if(err){
          res.status(500).json(err);
          return
        }

        const index = _.findIndex(events, function(o) { return o.id == req.params.id; });
        let newEvents = [...events]
        newEvents.splice(index, 1);
        events = newEvents

        res.status(200).json(results);
      });
  })

});
