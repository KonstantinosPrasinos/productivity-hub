const http = require('http');

const server = http.createServer((req, res) => {
    console.log(req.method, req.url);

    res.setHeader('Content-Type', 'text/plain', 'test')
});

server.listen(3000, 'localhost', () => {
    console.log('listening for requests on port 3000');
})