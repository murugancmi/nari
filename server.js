

var express=require('express'),
    app=express(),
    path=require('path'),
    http=require('http'),
    server=http.createServer(app);



app.use(express.static(__dirname+'/public'))

app.get('/',function(req,res){
  res.sendFile('pandian.html',{ root: path.join(__dirname, './views') })
})

app.get('/murugan',function(req,res){
  res.sendFile('murugan.html',{ root: path.join(__dirname, './views') })
})


server.listen(8080);
