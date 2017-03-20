'use strict'

const fs = require('fs')
const net = require('net');

class Request{

	constructor(s){
		let lines = s.split('\r\n');
		// console.log(lines);
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
		if (filename.indexOf(".jp") > -1 || filename.indexOf(".gif") > -1 || filename.indexOf("png") > -1){
			fs.readFile(__dirname + "/../public/img/" + filename, (err, data) =>{
				if (err){
					this.send(500, "File not found");
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
					this.send(500, "File not found");
				}else{
					const regExp = /\.[a-z]+/
					const matched = filename.match(regExp);
					// console.log(matched[0].substring(1));
					if (matched[0] === '.txt'){
						this.setHeader("Content-Type", "text/plain");
					}else{
						this.setHeader("Content-Type", "text/" + matched[0].substring(1));
					}
					this.writeHead(200);
					this.write(data);
					this.end();
				}
			});
		}else{
			this.send(500, "Extension not recognized");
		}

	}

	toString(){
		let str = 'HTTP/1.1 ' + this.statusCode + ' ' + this.codes[this.statusCode] + '\r\n';
		for (const key in this.headers){
			str += key + ': ' + this.headers[key] + '\r\n';
		}
		str += '\r\n';
		if (this.body !== undefined && this.body.length > 0){
			str += this.body;
		}
		return str;
	}

}


class App{

	constructor(){
		this.server = net.createServer(this.handleConnection.bind(this));
		this.routes = {};
	}

	get(path, callback){
		if (path.length > 1 && path[path.length-1] === '/'){
			path = path.substring(0, path.length-1);
		}
		this.routes[path] = callback;
	}


	handleRequestData(sock, binaryData){
		binaryData += '';
		const req = new Request(binaryData);
    	const res = new Response(sock);
		sock.on('close', this.logResponse.bind(this, req, res));
    	let path = req.path;
    	if (path.length > 1 && path[path.length-1] === '/'){
			path = path.substring(0, path.length-1);
		}
    	if(path in this.routes){
	    	this.routes[path](req, res);
    	}else{
		    res.setHeader("Content-Type", "text/plain");
		    res.send(404, "Uh oh... 404 page not found!");
    	}
	}

	handleConnection(sock){
		sock.on('data', this.handleRequestData.bind(this, sock));
	}

	logResponse(req, res){
		console.log(req.method, req.path, "-", res.statusCode, res.codes[res.statusCode]);
	}

	listen(port, host){
		this.server.listen(port, host);
	}
	
}


module.exports = {
	Request: Request,
	Response: Response,
	App: App,
}