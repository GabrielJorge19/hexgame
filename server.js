var express = require('express');
var app = express();

app.get('/', (req, res)=>{res.sendFile('index.html', { root: __dirname });});
app.get('/script.js', (req, res)=>{res.sendFile('script.js', { root: __dirname });});
app.get('/player.js', (req, res)=>{res.sendFile('player.js', { root: __dirname });});
app.listen(8080, function()
{
	console.log("When Server Starts, Log This");
});