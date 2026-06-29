function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.includes(".")) {
    return request;
  }

  var routes = [
    ["/learn/", "/learn/_/index.html"],
    ["/invite/", "/invite/_/index.html"],
    ["/admin/courses/", "/admin/courses/_/index.html"],
    ["/admin/quizzes/", "/admin/quizzes/_/index.html"],
  ];

  for (var i = 0; i < routes.length; i++) {
    var prefix = routes[i][0];
    var target = routes[i][1];
    if (uri.indexOf(prefix) === 0 && uri !== prefix.slice(0, -1) + "_/") {
      request.uri = target;
      return request;
    }
  }

  if (uri.endsWith("/")) {
    request.uri = uri + "index.html";
  } else {
    request.uri = uri + "/index.html";
  }

  return request;
}
