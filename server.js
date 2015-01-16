/*
Following shortucts are adopted

Routing:
    router -> rut
    usrRut /root/usr
    usrIDRut /root/usr/id:
*/

var express  = require( 'express' ),
    cors = require( 'cors' ),
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
app.use( cors );

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

router.use(function( req, res, next ) {
    console.log( req.method, req.url );
    next();
});

/*Router section*/
var userIDRut = router.route('/db/user/:id');
var dataRut = router.route( '/db' );
var userDataRut = router.route('/db/user');

//show the CRUD interface | GET

sql_query.tableName = "User";
findAll.apply(userDataRut,[sql_query]);

sql_query.tableName = "t_user";
findAll.apply(dataRut,[sql_query]);

sql_query.tableName = "User";
findById.apply(userIDRut,[sql_query]);

function findAll(sql_query){
    this.get(function(req, res) {
        req.getConnection(function(err,conn){
            if (err) return next("Cannot Connect");
            var query = conn.query( sql_query.getAll(), function( err, data ) {

            if(err){
                console.log(err);
                return next(sql_query.error.connection + sql_query.print());
            }

            res.render('data', { title:"Ajax communication", data:  JSON.stringify(data) });

            });
        });
    });
}

function findById(sql_query){
    this.get(function(req, res) {
        sql_query.id = req.param('id');
        console.log( sql_query.getById() );
        req.getConnection(function(err,conn){
            if (err) return next("Cannot Connect");
            var query = conn.query( sql_query.getById(), function( err, data ) {

            if(err){
                console.log(err);
                return next(sql_query.error.connection + sql_query.print());
            }

            if ( data.length == 0) {
                data = 'null'; /*'null' string is sent back, when the id deoes not exist*/
            }

            res.render('data', { title:"Ajax communication", data:  JSON.stringify(data) });

            });
        });
    });
}


//post data to DB | POST
userIDRut.post( function(req,res){

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

        var query = conn.query("INSERT INTO t_user set ? ", data, function(err, rows){

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