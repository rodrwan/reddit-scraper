'use strict';

var Yakuza;

Yakuza = require('yakuza');

require('./login/login.task');
require('./get-posts/get-posts.task');

Yakuza.agent('Forums', 'Reddit')
  .plan([
    'Login',
    'GetPosts'
  ])
  .routine('GetData', [
    // 'Login',
    'GetPosts'
  ]);
