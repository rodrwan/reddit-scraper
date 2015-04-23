'use strict';

var Yakuza;

Yakuza = require('yakuza');

require('./reddit/reddit.agent');

Yakuza.scraper('Forums').routine('GetData', [
  'Login',
  'GetPosts'
]);
