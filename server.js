

var express=require('express'),
    app=express(),
    path=require('path'),
    http=require('http'),
    server=http.createServer(app);



//app.use(express.static(__dirname+'/build'))
app.use(express.static(__dirname+'/src'))
app.get('/',function(req,res){
  res.sendFile('pandian.html',{ root:__dirname })
})

app.get('/murugan',function(req,res){
  res.sendFile('murugan.html',{ root: __dirname })
})


server.listen(8080);
