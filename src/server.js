const express = require('express');
const Server = require('http').Server;
const compression = require('compression');
const fs = require('fs');

const app = express();
// Enable gzip compression for all requests
app.use(compression());

// Mount the /public dir as the root directory of the web server
app.use(express.static(`${__dirname}/../public`));

for (let route of ['/summary', '/add-vacation']) {
	// Point all other requests to /index.html (for Angular's HTML5 mode)
	app.get(route, (req, res, next) => {
		res.set('content-type', 'text/html');
		res.send(fs.readFileSync(`${__dirname}/../public/index.html`, 'utf8'));
	});
}
	
// Create the http server
const http_server = new Server(app);

// Read the port from the enviornment variable PORT or use port 3000
let port = Number(process.env.PORT) || 3000;

// Listen on the declared port
http_server.listen(port, (error) => {
	// If there was an error listening on the declard port print the error and exit
	if (error) {
		console.error(`Error listening on port ${port}: ${error.stack}`);
		process.exit(1);
	} else {
		console.log(`Listening on ${port}`);
	}
});