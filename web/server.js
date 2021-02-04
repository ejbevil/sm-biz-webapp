let express = require('express');
let mysql = require('./dbcon.js');
let bodyParser = require('body-parser');

let app = express();
let handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', 21783);                                 


// ROUTES TO DISPLAY PAGES

app.get('/', function (req, res) {
    res.render('home');    
});

app.get('/customers', function (req, res, next) {
    let context = {};
    mysql.pool.query(
        "SELECT id, CONCAT(last_name, ', ', first_name) AS name, " +
            "CONCAT(street, ' ', city, ', ', state, ' ', zip) AS address, " +
        "DATE_FORMAT(birthdate,'%m/%d/%Y') AS birthdate " +
        "FROM customer " +
        "ORDER BY name;",
        function (err, rows, fields) {
        if (err) {
            next(err);
            return;
        }
        // correct formatting for null values
        for (let cust of rows) {
            if (cust.birthdate === '00/00/0000') {
                cust.birthdate = '';
            }
            if (cust.address === ' ,  ') {
                cust.address = '';
            }
        }
        context.customers = rows;
        res.render('customers', context);
    });
});

app.get('/products', function (req, res, next) {
    let context = {};
    // get data for table
    mysql.pool.query(
        "SELECT id, CONCAT(name, ' (', model, ')') AS modeldesc, price " +
        "FROM product;",
        function (err, rows, fields) {
        if (err) {
            next(err);
            return;
        }
        context.products = rows;
        res.render('products', context);
    });
});

app.get('/stores', function (req, res, next) {
    let context = {};
    mysql.pool.query(
        "SELECT id, CONCAT(city,', ', state) AS location, " +
            "CONCAT(street, ' ', city, ', ', state, ' ', zip, '  ', country) AS address, " +
            "sqft " +
        "FROM store " +
        "ORDER BY city;",
        function (err, rows, fields) {
        if (err) {
            next(err);
            return;
        }
        context.stores = rows;
        res.render('stores', context);
    });
});

app.get('/inventory', function (req, res, next) {
    let context = {};
    // get data for table
    mysql.pool.query(
        "SELECT pid, model, sid, CONCAT(city, ', ', state) AS location, qty " +
        "FROM inventory " +
        "INNER JOIN product ON inventory.pid = product.id " +
        "INNER JOIN store ON inventory.sid = store.id;",
        function (err, rows, fields) {
        if (err) {
            next(err);
            return;
        }
        context.inventories = rows;

        // get data for stores dropdown
        mysql.pool.query(
            "SELECT id, CONCAT(city,', ', state) AS location " +
            "FROM store;",
            function (err, rows, fields) {
            if (err) {
                next(err);
                return;
            }
            context.sids = rows;

            // get data for products dropdown
            mysql.pool.query(
                "SELECT id, CONCAT(name, ' (', model, ')') AS modeldesc, price " +
                "FROM product;",
                function (err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                context.pids = rows;

                res.render('inventory', context);
            });
        });
    });
});

app.get('/purchases', function (req, res, next) {
    let context = {};

    // get data for table
    mysql.pool.query(
        "SELECT purchase.id, DATE_FORMAT(date,'%m/%d/%Y') AS date, transaction, store.city, model, name, qty, " +
            "CONCAT(last_name, ', ', first_name) AS customer " +
        "FROM purchase " +
        "LEFT JOIN customer ON purchase.cid = customer.id " +
        "INNER JOIN product ON purchase.pid = product.id " +
        "INNER JOIN store on purchase.sid = store.id " +
        "ORDER BY date DESC;",
        function (err, rows, fields) {
            if (err) {
                next(err);
                return;
            }
            context.purchases = rows;

            // get data for products dropdown
            mysql.pool.query(
                "SELECT id, CONCAT(name, ' (', model, ')') AS modeldesc, price " +
                "FROM product;",
                function (err, rows, fields) {
                    if (err) {
                        next(err);
                        return;
                    }
                    context.pids = rows;

                    // get data for customers dropdown
                    mysql.pool.query(
                        "SELECT id, CONCAT(last_name, ', ', first_name) AS name " +
                        "FROM customer " +
                        "ORDER BY name;",
                        function (err, rows, fields) {
                            if (err) {
                                next(err);
                                return;
                            }
                            context.cids = rows;

                            // get data for 2x stores dropdowns
                            mysql.pool.query(
                                "SELECT id, CONCAT(city,', ', state) AS location " +
                                "FROM store;",
                                function (err, rows, fields) {
                                    if (err) {
                                        next(err);
                                        return;
                                    }
                                    context.sids = rows;

                                    res.render('purchases', context);
                            });
                    });
            });
    });

});


// ROUTES TO INSERT NEW DATA

app.post('/entercustomer', function (req, res, next) {
    mysql.pool.query(
        "INSERT INTO customer (first_name, last_name, birthdate, street, " +
            "city, state, country, zip) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
        [req.body.first_name, req.body.last_name, req.body.birthdate, req.body.street,
         req.body.city, req.body.state, req.body.country, req.body.zip],
        function(err, result) {
            if(err){
                next(err);
                return;
            }
            res.redirect('/customers');
    });
});

app.post('/enterproduct', function (req, res, next) {
    mysql.pool.query(
        "INSERT INTO product (model, name, price) " +
        "VALUES (?, ?, ?);",
        [req.body.model, req.body.name, req.body.price],
        function(err, result) {
            if(err){
                next(err);
                return;
            }
            res.redirect('/products');
    });
});

app.post('/enterstore', function (req, res) {
    mysql.pool.query(
        "INSERT INTO store (street, city, state, country, zip, sqft) " +
        "VALUES (?, ?, ?, ?, ?, ?);",
        [req.body.street, req.body.city, req.body.state, req.body.country,
         req.body.zip, req.body.sqft],
        function(err, result) {
            if(err){
                next(err);
                return;
            }
            res.redirect('/stores');
    });
});

app.post('/enterinventory', function (req, res, next) {
    // check if store-product combo already exists
    mysql.pool.query(
        "SELECT * " +
        "FROM inventory " +
        "WHERE pid=? AND sid=?",
        [req.body.pid, req.body.sid],
        function (err, rows, fields) {
            if (err) {
                next(err);
                return;
            }
            // if already exists, ignore entry & rerender page
            if (rows.length) {
                res.redirect('/inventory');
            }
            // otherwise, allow insert
            else {
                mysql.pool.query(
                    "INSERT INTO inventory (pid, sid, qty)  " +
                    "VALUES (?, ?, ?)",
                    [req.body.pid, req.body.sid, req.body.qty],
                    function (err, result) {
                        if (err) {
                            next(err);
                            return;
                        }
                        res.redirect('/inventory');
                });
            }
    });
});


app.post('/enterpurchase', function (req, res, next) {

    // check qty of product available at store
    let purchQty = req.body.qty;
    mysql.pool.query(
        "SELECT qty " +
        "FROM inventory " +
        "WHERE pid=? AND sid=?;",
        [req.body.pid, req.body.sid],
        function (err, rows, fields) {
            if (err) {
                next(err);
                return;
            }

            // if store does not stock item or qty is 0, ignore purchase
            if (!rows.length || rows[0].qty === 0) {
                res.redirect('/purchases');
            }

            // otherwise proceed with purchase
            else {
                let invQty = rows[0].qty;
                // if larger qty requested than available, change purchase qty to
                // match available amount
                if (invQty < purchQty) {
                    purchQty = invQty;
                }
                // enter purchase
                mysql.pool.query(
                    "INSERT INTO purchase (date, transaction, pid, qty, cid, sid)  " +
                    "VALUES (?, ?, ?, ?, ?, ?);",
                    [req.body.date, req.body.transaction, req.body.pid, purchQty,
                     req.body.cid, req.body.sid],
                    function (err, result) {
                        if (err) {
                            next(err);
                            return;
                        }
                        // calculate & update inventory qty
                        mysql.pool.query(
                            "UPDATE inventory SET qty=? WHERE pid=? AND sid=?;",
                            [invQty - purchQty, req.body.pid, req.body.sid],
                            function (err, result) {
                                if (err) {
                                    next(err);
                                    return;
                                }
                                res.redirect('/purchases');
                        });
                });
            }
    });
});


// ROUTES TO UPDATE DATA

app.get('/editcustomer/:id', function (req, res, next) {
    var context = {};
    // get customer data to prepopulate input fields
    mysql.pool.query(
        "SELECT id, first_name, last_name, birthdate, street, city, state, country, zip " +
        "FROM customer " +
        "WHERE id=?;",
        [req.params.id], function (err, rows, fields) {
            if (err) {
                next(err);
                return;
            }
            if (rows.length) {
                context.id = rows[0].id;
                context.first_name = rows[0].first_name;
                context.last_name = rows[0].last_name;
                // correct empty birthdates that have defaulted to null
                if (rows[0].birthdate === '0000-00-00') {
                    context.birthdate = '';
                }
                else {
                    context.birthdate = rows[0].birthdate.toISOString().substring(0, 10);
                }
                context.street = rows[0].street;
                context.city = rows[0].city;
                context.state = rows[0].state;
                context.country = rows[0].country;
                context.zip = rows[0].zip;
            }
            res.render('editcustomer', context);
    });
});

app.post('/updatecustomer', function (req, res, next) {
    // process customer update
    mysql.pool.query(
        "UPDATE customer " +
        "SET first_name=?, last_name=?, birthdate=?, street=?, city=?, " +
            "state=?, country=?, zip=?" +
        "WHERE id=?; ",
        [req.body.first_name, req.body.last_name, req.body.birthdate, req.body.street,
         req.body.city, req.body.state, req.body.country, req.body.zip, req.body.id],
        function(err, result) {
            if (err) {
                next(err);
                return;
            }
            res.redirect('/customers');
    });
});


// ROUTES TO DELETE DATA

app.post('/deletecustomer/:id', function(req, res, next) {
    // delete specified customer
    mysql.pool.query(
        "DELETE FROM customer " +
        "WHERE id=?;",
        [req.params.id],
        function(err, result){
            if(err){
                next(err);
                return;
            }
            res.redirect('/customers');
    });
});

app.post('/deleteinventory/:sid/:pid', function(req, res, next) {
    // delete specified inventory line
    mysql.pool.query(
        "DELETE FROM inventory " +
        "WHERE sid=? AND pid=?;",
        [req.params.sid, req.params.pid],
        function(err, result){
            if(err){
                next(err);
                return;
            }
            res.redirect('/inventory');
    });
});


// ROUTES TO FILTER DATA

app.post('/purchasesbystore', function(req, res, next) {

    // reset page to display all stores
    if (req.body.sid === '') {
        res.redirect('/purchases');
    }
    // otherwise display data for selected store
    else {
        let context = {};

        // get data for table -- selected store only
        mysql.pool.query(
            "SELECT purchase.id, DATE_FORMAT(date,'%m/%d/%Y') AS date, transaction, " +
                "store.city, model, name, qty, " +
            "CONCAT(last_name, ', ', first_name) AS customer " +
            "FROM purchase " +
            "LEFT JOIN customer ON purchase.cid = customer.id " +
            "INNER JOIN product ON purchase.pid = product.id " +
            "INNER JOIN store on purchase.sid = store.id " +
            "WHERE sid=?" +
            "ORDER BY date DESC;",
            [req.body.sid],
            function (err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                context.purchases = rows;

                // get data for products dropdown
                mysql.pool.query(
                    "SELECT id, CONCAT(name, ' (', model, ')') AS modeldesc, price " +
                    "FROM product;",
                    function (err, rows, fields) {
                        if (err) {
                            next(err);
                            return;
                        }
                        context.pids = rows;

                        // get data for customers dropdown
                        mysql.pool.query(
                            "SELECT id, CONCAT(last_name, ', ', first_name) AS name " +
                            "FROM customer " +
                            "ORDER BY name;",
                            function (err, rows, fields) {
                                if (err) {
                                    next(err);
                                    return;
                                }
                                context.cids = rows;

                                // get data for 2x stores dropdowns
                                mysql.pool.query(
                                    "SELECT id, CONCAT(city,', ', state) AS location " +
                                    "FROM store;",
                                    function (err, rows, fields) {
                                        if (err) {
                                            next(err);
                                            return;
                                        }
                                        context.sids = rows;

                                        res.render('purchases', context);
                                });
                        });
                });
        });
    }
});


//  ERROR HANDLERS

app.use(function(req,res){
    res.status(404);
    res.render('404');
});

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});


app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
