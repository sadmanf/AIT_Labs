'use strict'

const HOST = '127.0.0.1';
const PORT = 8080;

const App = require('./miniWeb.js').App;
const app = new App();

app.get('/', function(req, res){
	res.setHeader("Content-Type", "text/html");
	res.send(200, '<link rel="stylesheet" type="text/css" href="http://localhost:8080/css/base.css"> <h1>Welcome to my webpage!</h1><img src="http://localhost:8080/image1.jpg"></image>');
});

app.get('/about', function(req, res){
	res.setHeader("Content-Type", "text/html");
	res.send(200, '<link rel="stylesheet" type="text/css" href="http://localhost:8080/css/base.css"> <h1>About</h1> <h2>This website is dedicated to images of Mr.Meeseeks!!</h2><img src="http://localhost:8080/image3.gif"></image>')
});

app.get('/css/base.css', function(req, res){
	res.setHeader("Content-Type", "text/css");
    res.send(200, "img {display: block; margin-left: auto; margin-right: auto;} h1 {color: white; text-align: center; font-size: 75} h2 {color: red; text-align: center} body{background-color: lightblue;}"); 
})

app.get('/image1.jpg', function(req, res){
	res.setHeader("Content-Type", "image/jpg");
	res.sendfile("image1.jpg");

});

app.get('/image2.png', function(req, res){
	res.setHeader("Content-Type", "image/png");
	res.sendfile("image2.png");

});

app.get('/image3.gif', function(req, res){
	res.setHeader("Content-Type", "image/gif");
	res.sendfile("image3.gif");
});

app.get('/home', function(req, res){
	res.redirect(301, '/');
});

app.get('/random',function(req, res){
	const rand = Math.floor(Math.random() * 3) + 1;
	const imageTypes = {1:"jpg", 2:"png", 3:"gif"};
	const img = "image" + rand + "." + imageTypes[rand]; 
	res.setHeader("Content-Type", "text/html");
	res.send(200, '<link rel="stylesheet" type="text/css" href="http://localhost:8080/css/base.css"> <h1>Random Image</h1><img src="http://localhost:8080/'+ img +'"></image>');
});

app.listen(PORT, HOST);