var express = require('express'),
    router = express.Router(),
    request = require("request");

/* GET pets index page. */
router.get('/', function(req, res, next) {
    res.render('./pets/index', { title: 'Pet Adoption' });
});

/* POST pets index page. */
router.post('/', function(req, res, next) {
    var location = req.body.location;
    var key = process.env.PET_FINDER_API_KEY;
    var url = "http://api.petfinder.com/pet.find?key=" + key + "&location=" + location + "&format=json&count=2";

    request(url, function(err, response, body) {
        if (err) {
            res.send(err);
        } else {
            var pets = JSON.parse(body).petfinder.pets.pet;
            res.render('./pets/index', { title: 'Pet Adoption', pets: pets });
        }
    });
});


module.exports = router;