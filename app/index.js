const express = require('express');
const mustacheExpress = require('mustache-express');
const app = express();

let udata;

const MongoClient = require('mongodb').MongoClient;

// Connect to the db and set udata to array
MongoClient.connect("mongodb://localhost:27017/robotsDb", function (err, db) {
    if (!err) {
        console.log("We are connected to robotsDb");
        let collection = db.collection('robots');

        collection.find().toArray(function (err, items) {
            if (!err) {
                console.log(`Got ${items.length} results from collection 'robots'`);
                udata = items;
            } else {
                console.log("Error reading robots from collection 'robots'");
            }  
        })
    }

});

app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');
app.use(express.static('public'));

app.get('/', function(req, res) {
    res.redirect(303, '/employed');
})

app.get('/employed', function (req, res) {
    let users = [];

    for (var i = 0; i < udata.length; i++) {
        let user = udata[i];
        let job_desc;
        if (user["job"] != null) {
            job_desc = user["job"] + ", " + user["company"];
            users.push({
                "id": user["id"],
                "avatar": user["avatar"],
                "name": user["name"],
                "job": job_desc,
            });
        } else {
            job_desc = `<span class="available">Available for hire</span>`;
        }
    }

    console.log("Built users json:");
    console.dir(users);

    res.render('index', {
        users: users
    });
})

app.get('/available', function(req, res) {
    let users = [];
    for (var i = 0; i < udata.length; i++) {
        let user = udata[i];
        let job_desc;
        if (user["job"] != null) {
            job_desc = user["job"] + ", " + user["company"];
        } else {
            job_desc = `<span class="available">Available for hire</span>`;
            users.push({
                "id": user["id"],
                "avatar": user["avatar"],
                "name": user["name"],
                "job": job_desc,
            });
        }
    }
    
    console.log("Built users json:");
    console.dir(users);

    res.render('index', {
        users: users
    });
})

app.get('/users/:uid', function (req, res) {
    let uid = req.params.uid;
    let user = udata[uid - 1];

    let user_json = {
        "avatar": user["avatar"],
        "name": user["name"],
        "location": `${user["address"]["city"]}, ${user["address"]["country"]}`,
        "email": user["email"],
        "phone": user["phone"],
        "education": (user["university"] != null) ? user["university"] : "No college education",
        "skills": user["skills"].join("<br>"),
    }

    if (user["job"] == null) {
        user_json["work_status"] = `<span class="available">Available for hire</span>`;
    } else {
        user_json["work_status"] = `${user["job"]}, ${user["company"]}`;
    }

    res.render('user', user_json);

})

app.listen(3000, function () {
    console.log("Express app successfully started");
})
