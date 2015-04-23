'use strict';

var Yakuza, login;

Yakuza = require('yakuza');

login = Yakuza.task('Forums', 'Reddit', 'Login');

// return username and password.
login.builder(function (job) {
  return job.params;
});

login.main(function (task, http, params) {
  var requestOpts, requestUrl, template, formData;

  requestUrl = 'http://www.reddit.com/';

  template = http.optionsTemplate();
  requestOpts = template.build({
    'url': requestUrl
  });

  http.get(requestOpts).then(function (result) {
    // https://www.reddit.com/api/login/<username>
    requestUrl = 'https://www.reddit.com/api/login/' + params.username;
    formData = {
      'op': 'login-main',
      'user': params.username,
      'passwd': params.password,
      'api_type': 'json'
    };

    requestOpts = template.build({
      'url': requestUrl,
      'data': formData,
      'headers': {
        ':host': 'www.reddit.com',
        ':method': 'POST',
        ':path': '/api/login/' + params.username,
        ':scheme': 'https',
        ':version': 'HTTP/1.1',
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'origin': 'http://www.reddit.com'
      },
      'content_type': 'application/x-www-form-urlencoded; charset=UTF-8'
    });

    return http.post(requestOpts);
  })
  .then(function (result) {
    task.saveCookies();
    console.log(result.body);
    console.log(result.res.headers);
    task.success('Fucking login...\n');
  })
  .fail(function (err) {
    task.fail(err);
  }).done();
});
