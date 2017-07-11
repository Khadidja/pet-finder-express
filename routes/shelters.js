var express = require('express'),
    router = express.Router({ mergeParams: true }),
    request = require("request");

/* GET shelter search form */
router.get("/", function(req, res, next) {
    res.render('./shelters/index', { title: 'Pet Shelters' });
});

/* POST shelters index page. */
router.post('/', function(req, res, next) {
    var location = req.body.location;
    var key = process.env.PET_FINDER_API_KEY;
    var url = "http://api.petfinder.com/shelter.find?key=" + key + "&location=" + location + "&format=json&count=10";

    request(url, function(err, response, body) {
        if (err) {
            res.send(err);
        } else {
            var sheltersObj = JSON.parse(body).petfinder.shelters.shelter;
            var shelters = [];
            sheltersObj.forEach(function(shelter) {
                shelters.push({
                    id: shelter.id.$t,
                    name: shelter.name.$t,
                    city: shelter.city.$t,
                    state: shelter.state.$t,
                    zip: shelter.zip.$t,
                    country: shelter.country.$t,
                    phone: shelter.phone.$t,
                    email: shelter.email.$t
                });
            });
            res.render('./shelters/index', { title: 'Pet Adoption', shelters: shelters });
        }
    });
});

/* GET shelter details */
router.get("/:shelterId", function(req, res, next) {
    res.send("Viewing details on shelter " + req.params.shelterId);
});

module.exports = router;