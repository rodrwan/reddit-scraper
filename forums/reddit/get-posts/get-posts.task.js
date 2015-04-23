'use strict';

var SCHEMAS, nextAndPrev, Yakuza, Gurkha, _, getPosts;

Yakuza = require('yakuza');
Gurkha = require('gurkha');
_ = require('lodash');

nextAndPrev = false;
getPosts = Yakuza.task('Forums', 'Reddit', 'GetPosts');

/**
 * This function create a request object to call others pages until next is null.
 * This function execute a recursive promise.
 * @param  {Object} http      Object to create http request
 * @param  {String} body      String with html response
 * @param  {Array} posts      Array to stack extracted data.
 * @return {Array/Promise}    Array with links.
 */
function getAndCreateRequest (http, body, posts) {
  var bodyParser, postList, template, requestOpts, requestUrl;

  bodyParser = new Gurkha(SCHEMAS.posts, SCHEMAS.options);
  postList = bodyParser.parse(body);

  if (posts.length === 0) {
    console.log('Extracting post from: ' + postList[0].section);
  }

  _.each(postList[0].posts, function (post) {
    posts.push({
      'href': post.href,
      'title': post.title
    });
  });
  // console.log('Post extracted: ' + posts.length);
  requestUrl = postList[0].next;
  if (typeof requestUrl !== 'string') {
    requestUrl = postList[0].next[1];
    nextAndPrev = true;
  }

  if (nextAndPrev && typeof postList[0].next === 'string') {
    return posts;
  }

  template = http.optionsTemplate();
  requestOpts = template.build({
    'url': requestUrl
  });

  return http.get(requestOpts).then(function (result) {
    return getAndCreateRequest(http, result.body, posts);
  });
}

SCHEMAS = {};

SCHEMAS.posts = {
  'section': {
    '$rule': '.pagename'
  },
  'next': {
    '$rule': 'span.nextprev > a',
    '$sanitizer': function ($elem) {
      return $elem.attr('href');
    }
  },
  'posts': {
    '$rule': '#siteTable > div.link',
    'title': 'p.title',
    'href': {
      '$rule': 'a.title',
      '$sanitizer': function ($elem) {
        return $elem.attr('href');
      }
    },
    'thumbnail': {
      '$rule': '.thumbnail > img',
      '$sanitizer': function ($elem) {
        return $elem.attr('src');
      }
    }
  }
};

SCHEMAS.options = {
  'normalizeWhitespace': true
};

getPosts.builder(function (job) {
  return job.params;
});

// If something fails, retry 3 time
getPosts.hooks({
  'onFail': function (task) {
    console.log('Fail => ' + task.runs);
    if (task.runs === 3) {
      return;
    }
    task.rerun();
  }
});

getPosts.main(function (task, http, params) {
  var requestOpts, requestUrl, template;

  // random section has a hidden redirection, follow_max 1 do this redirect.
  requestUrl = 'http://www.reddit.com/r/' + params.section;
  template = http.optionsTemplate();
  requestOpts = template.build({
    'url': requestUrl,
    'follow_max': 1
  });

  http.get(requestOpts).then(function (result) {
    var postsPocket;

    postsPocket = [];
    // this function should return a promise
    return getAndCreateRequest(http, result.body, postsPocket);
  })
  .then(function (result) {
    console.log('Extraction done !');
    console.log('Total post extrated: ' + result.length);
    // this data is shared between task.
    task.share('commonData', result);
    task.success('Data successfully extracted !');
  })
  .fail(function (err) {
    task.fail(err);
  })
  .done();
});
