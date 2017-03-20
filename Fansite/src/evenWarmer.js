'use strict'

const fs = require('fs')

class Request{

	constructor(s){
		let lines = s.split('\r\n');
		const requestLines = lines[0].split(' ');
		const headerLines = lines[1].split(': ');
		
		this.method = requestLines[0];
		this.path = requestLines[1];
		this.version = requestLines[2];
		if (lines[2] !== ''){
			const requestLines = lines[2].split(': ');
			this.headers = {Host: headerLines[1], Referer: requestLines[1]};
		}else{
			this.headers = {Host: headerLines[1]};
		}
		this.body = lines[lines.length-1];
		console.log(this.method, this.path, this.version, this.headers, this.body);
	}

	toString(){
		var _this = this;
		let str = '';
		str += this.method + ' ' + this.path + ' ' + this.version + '\r\n';
		for (const key in this.headers){
			str += key + ': ' + this.headers[key] + '\r\n';
		}str += '\r\n' + this.body;

		return str;
	}

};

class Response{

	constructor(s){
		this.sock = s;
		this.statusCode = 0;
		this.headers = {};
		this.body = '';
		this.codes = {200: "OK", 404: "Not Found", 500:"Internal Server Error", 400:"Bad Request", 301:"Moved Permanently", 302:"Found", 303:"See Other"};
	}

	setHeader(name, value){
		this.headers[name] = value;
	}

	write(data){
		this.sock.write(data);
	}

	writeHead(statusCode){
		this.statusCode = statusCode;
		
		let str = 'HTTP/1.1 ' + this.statusCode + ' ' + this.codes[this.statusCode] + '\r\n';
		for (const key in this.headers){
			str += key + ': ' + this.headers[key] + '\r\n';
		}
		str += '\r\n';

		this.write(str);
	}

	end(s){
		this.sock.end(s);
	}

	send(statusCode, body){
		this.statusCode = statusCode;
		this.body = body;
		this.end(this.toString());
	}

	redirect(statusCode, url){
		if (arguments.length > 1){
			this.statusCode = statusCode;
			this.setHeader("Location",  url);
		}else if (arguments.length === 1){
			this.statusCode = 301;
			this.setHeader("Location",  arguments[0]);
		}
		this.writeHead(this.statusCode);
		this.end();
	}

	sendfile(filename){
			// console.log(filename);
		if (filename.indexOf(".jp") > -1 || filename.indexOf(".gif") > -1 || filename.indexOf("png") > -1){
			fs.readFile(__dirname + "/../public/img/" + filename, (err, data) =>{
				if (err){
					console.log(err, "500 error");
				}else{
					const regExp = /\.[a-z]+/
					const matched = filename.match(regExp);
					this.setHeader("Content-Type", "image/" + matched[0].substring(1));
					this.writeHead(200);
					this.write(data);
					this.end();
				}
			});
		}else if (filename.indexOf(".html") > -1 || filename.indexOf(".css") > -1 || filename.indexOf("txt") > -1){
			fs.readFile(__dirname + "/../public/html/" + filename, (err, data) =>{
				if (err){
					console.log(err, "500 error");
				}else{
					const regExp = /\.[a-z]+/
					const matched = filename.match(regExp);
					if (matched[0] === '.txt'){
						this.setHeader("Content-Type", "text/plain");
					}else{
						this.setHeader("Content-Type", "text/" + matched[0].substring(1));
					}
					this.writeHead(200);
					// this.toString();
					this.write(data);
					this.end();
				}
			});
		}

	}

	toString(){
		let str = 'HTTP/1.1 ' + this.statusCode + ' ' + this.codes[this.statusCode] + '\r\n';
		for (const key in this.headers){
			str += key + ': ' + this.headers[key] + '\r\n';
		}
		str += '\r\n';
		if (this.body.length > 0){
			str += this.body;
		}
		return str;
	}

}

const net = require('net');
const HOST = '127.0.0.1';
const PORT = 8080;


const server = net.createServer((sock) => {
    sock.on('data', function(binaryData) {
    	binaryData += '';
    	const req = new Request(binaryData);
    	const res = new Response(sock);

    	if (req.path === '/'){
		    // sock.write('HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n<link rel="stylesheet" type="text/css" href="foo.css"> <h2>This is a red header!</h2> <em>Hello</em> <strong>World</strong>');
    		res.setHeader("Content-Type", "text/html");
    		res.send(200, '<link rel="stylesheet" type="text/css" href="foo.css"> <h2>This is a red header!</h2> <em>Hello</em> <strong>World</strong>')
    	}else if (req.path === '/foo.css'){
		    // sock.write('HTTP/1.1 200 OK\r\nContent-Type: text/css\r\n\r\nh2 {color: red;}');
		    res.setHeader("Content-Type", "text/css");
		    res.send(200, "h2 {color: red;}"); 
    	}else if (req.path === '/bmo.gif'){
    		console.log(res.sendfile("bmo1.gif"));
    	}else if (req.path === '/test.html'){
    		console.log(res.sendfile('test.html'))
    	}else{
		    // sock.write('HTTP/1.1 404 OK\r\nContent-Type: text/plain\r\n\r\nUh oh... 404 page not found!');
		    res.setHeader("Content-Type", "text/plain");
		    res.send(404, "Uh oh... 404 page not found!");
		    // console.log(res.toString());  		

    	}
	    // sock.end();
	});

});

server.listen(PORT, HOST);




module.exports = {
	Request: Request,
	Response: Response,
}