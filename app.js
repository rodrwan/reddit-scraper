'use strict';

var Yakuza, colors, params, job;

Yakuza = require('yakuza');
colors = require('colors');

colors.setTheme({
  'silly': 'rainbow',
  'input': 'grey',
  'verbose': 'cyan',
  'prompt': 'grey',
  'info': 'green',
  'data': 'grey',
  'help': 'cyan',
  'warn': 'yellow',
  'debug': 'blue',
  'error': 'red'
});

require('./forums/forums.scraper');
// get username and password from enviroment variable.
params = {
  'username': 'username', // process.env.REDDITUSER,
  'password': 'password', // process.env.REDDITPASS
  'section': 'random'
};

job = Yakuza.job('Forums', 'Reddit', params);

job.routine('GetData');

job.on('job:fail', function (res) {
  console.log('Something failed'.error);
  console.log('Error: '.error);
  console.log(res);
});

job.on('task:*:success', function (task) {
  console.log(task.data.info);
});
// run run !!!
job.run();
