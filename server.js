/*
Following shortucts are adopted

Routing:
    router -> rut
    usrRut /root/usr
    usrIDRut /root/usr/id:
*/

var express  = require( 'express' ),
    path = require( 'path' ),
    bodyParser = require( 'body-parser' ),
    app = express(),
    expressValidator = require( 'express-validator' );


/*Set EJS template Engine*/
app.set( 'views','./views' );
app.set( 'view engine','ejs' );

app.use( express.static( path.join(__dirname, 'public')) );
app.use( bodyParser.urlencoded({ extended: true }) ); //support x-www-form-urlencoded
app.use( bodyParser.json() );
app.use( expressValidator() );

/*MySql connection*/
var connection  = require( 'express-myconnection' ),
    mysql = require( 'mysql' );

/*lest use define a model, Model or Database begins with upper case letter*/
var Model = {} 


app.use(
    connection( mysql,{
        host     : 'www.db4free.net',
        user     : 'fooddbtest',
        password : 'fooddbtest',
        database : 'fooddbtest',
        debug    : false //set true if you wanna see debug logger
    },'request' )
);
/* Use in-house prepated query lib*/
var sql_query = require( './mysql_query.js' )

app.get( '/',function( req,res ){
    res.send( 'Welcome' );
});

//RESTful route
var router = express.Router();

/*process.env.PORT is added for Heroku deployment*/
var port = process.env.PORT || 3000

/*------------------------------------------------------
*  This is router middleware,invoked everytime
*  we hit url /api and anything after /api
*  like /api/user , /api/user/7
*  we can use this for doing validation,authetication
*  for every route started with /api
--------------------------------------------------------*/
router.use(function( req, res, next ) {
    console.log( req.method, req.url );
    next();
});

/*Router section*/

var uerIDRut = router.route( '/user' );
var dataRut = router.route( '/data' );

//show the CRUD interface | GET
uerIDRut.get(function(req, res) {
    req.getConnection(function(err,conn){

        if (err) return next("Cannot Connect");

        sql_query.tableName = 't_user';

            var query = conn.query( sql_query.getAll(), function( err, t_user ) {

            if(err){
                console.log(err);
                return next("Mysql error, check your query");
            }

            console.log ( rows );

            res.render('user', { title:"RESTful Crud Example", data: t_user });
         });
    });
});


dataRut.get( function(req,res ){

    req.getConnection(function(err,conn){

        if (err) return next("Cannot Connect");

        var query = conn.query('SELECT * FROM t_user',function(err,rows) {

            if(err){
                console.log(err);
                return next("Mysql error, check your query");
            }

            res.render( 'data', {title:"RESTful Crud Example", data: JSON.stringify(rows)});

         });
    });
});


//post data to DB | POST
uerIDRut.post( function(req,res){

    //validation
    req.assert('name','Name is required').notEmpty();
    req.assert('email','A valid email is required').isEmail();
    req.assert('password','Enter a password 6 - 20').len(6,20);

    var errors = req.validationErrors();
    if(errors){
        res.status(422).json(errors);
        return;
    }

    //get data
    var data = {
        name:req.body.name,
        email:req.body.email,
        password:req.body.password
     };

    //inserting into mysql
    req.getConnection(function (err, conn){

        if (err) return next("Cannot Connect");

        var query = conn.query("INSERT INTO t_user set ? ",data, function(err, rows){

           if(err){
                console.log(err);
                return next("Mysql error, check your query");
           }

          res.sendStatus(200);

        });

     });

});


//now for Single route (GET,DELETE,PUT)
var userIdRut = router.route('/user/:user_id');

userIdRut.all(function(req,res,next){
    console.log("You need to smth about userIdRut Route ? Do it here");
    console.log(req.params);
    next();
});

//get data to update
userIdRut.get(function(req,res,next){

    var user_id = req.params.user_id;

    req.getConnection(function(err,conn){

        if (err) return next("Cannot Connect");

        var query = conn.query("SELECT * FROM t_user WHERE user_id = ? ",[user_id],function(err,rows){

            if(err){
                console.log(err);
                return next("Mysql error, check your query");
            }

            //if user not found
            if(rows.length < 1)
                return res.send("User Not found");

            res.render('edit',{title:"Edit user",data:rows});
        });

    });

});

//update data
userIdRut.put(function(req,res){
    var user_id = req.params.user_id;

    //validation
    req.assert('name','Name is required').notEmpty();
    req.assert('email','A valid email is required').isEmail();
    req.assert('password','Enter a password 6 - 20').len(6,20);

    var errors = req.validationErrors();
    if(errors){
        res.status(422).json(errors);
        return;
    }

    //get data
    var data = {
        name:req.body.name,
        email:req.body.email,
        password:req.body.password
     };

    //inserting into mysql
    req.getConnection(function (err, conn){

        if (err) return next("Cannot Connect");

        var query = conn.query("UPDATE t_user set ? WHERE user_id = ? ",[data,user_id], function(err, rows){

           if(err){
                console.log(err);
                return next("Mysql error, check your query");
           }

          res.sendStatus(200);

        });

     });

});

//delete data
userIdRut.delete(function(req,res){
    var user_id = req.params.user_id;
    req.getConnection(function (err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query("DELETE FROM t_user  WHERE user_id = ? ",[user_id], function(err, rows){

             if(err){
                console.log(err);
                return next("Mysql error, check your query");
             }

             res.sendStatus(200);
        });
        //console.log(query.sql);
     });
});

app.use('/GT', router);

//start Server
var server = app.listen(port,function(){

   console.log("Listening to port %s",server.address().port);

});