const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const errorHandlerScript = `
    <script>
      window.onerror = function(message, source, lineno, colno, error) {
        document.body.innerHTML = '<div style="color:red; background:white; padding:20px; font-family:sans-serif; z-index:999999; position:absolute; top:0; left:0; width:100%; height:100%;">' +
          '<h1>JavaScript Error</h1>' +
          '<p><b>Message:</b> ' + message + '</p>' +
          '<p><b>Source:</b> ' + source + ' : ' + lineno + ':' + colno + '</p>' +
          '<pre>' + (error && error.stack ? error.stack : '') + '</pre>' +
        '</div>';
      };
      window.addEventListener('unhandledrejection', function(event) {
        document.body.innerHTML = '<div style="color:red; background:white; padding:20px; font-family:sans-serif; z-index:999999; position:absolute; top:0; left:0; width:100%; height:100%;">' +
          '<h1>Unhandled Promise Rejection</h1>' +
          '<p><b>Reason:</b> ' + (event.reason && event.reason.message ? event.reason.message : event.reason) + '</p>' +
          '<pre>' + (event.reason && event.reason.stack ? event.reason.stack : '') + '</pre>' +
        '</div>';
      });
    </script>
`;

if (!html.includes('window.onerror')) {
  html = html.replace('</head>', errorHandlerScript + '</head>');
  fs.writeFileSync('index.html', html);
}
