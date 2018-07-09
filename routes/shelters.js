var express = require('express'),
    router = express.Router({ mergeParams: true }),
    request = require("request");
require('dotenv').config();

/* GET shelter search form */
router.get("/", function (req, res, next) {
    res.render('./shelters/index', { title: 'Pet Shelters', error: req.flash('error') });
});

/* POST shelters index page. */
router.post('/', function (req, res, next) {
    var location = req.body.location;
    var key = process.env.PET_FINDER_API_KEY;
    var url = "http://api.petfinder.com/shelter.find?key=" + key + "&location=" + location + "&format=json";

    request(url, function (err, response, body) {
        if (err) {
            res.send(err);
        } else {
            var petfinderObj = JSON.parse(body).petfinder;
            if (!petfinderObj.hasOwnProperty('shelters')) {
                req.flash('error',
                    'Invalid location input. Please enter a zip code or the city and state e.g. Austin, Texas');
                res.redirect('/shelters');
            } else {

                var sheltersObj = petfinderObj.shelters.shelter;
                var shelters = [];
                sheltersObj.forEach(function (shelter) {
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
        }
    });
});

/* GET shelter details */
router.get("/:shelterId", function (req, res, next) {
    var key = process.env.PET_FINDER_API_KEY;
    var url = "http://api.petfinder.com/shelter.get?key=" + key + "&id=" + req.params.shelterId + "&format=json";
    request(url, function (err, response, body) {
        if (err) {
            res.send(err);
        } else {
            var shelterObj = JSON.parse(body).petfinder.shelter;
            var mapKey = process.env.GOOGLE_EMBED_MAPS_API_KEY;
            var lon = shelterObj.longitude.$t;
            var lat = shelterObj.latitude.$t;
            var mapUrl = "https://www.google.com/maps/embed/v1/place?key=" + mapKey + "&q=" + lat + "," + lon;
            var shelter = {
                id: shelterObj.id.$t,
                name: shelterObj.name.$t,
                city: shelterObj.city.$t,
                state: shelterObj.state.$t,
                zip: shelterObj.zip.$t,
                country: shelterObj.country.$t,
                phone: shelterObj.phone.$t,
                email: shelterObj.email.$t,
                mapUrl: mapUrl
            };
            res.render('./shelters/show', { title: 'Shelter', shelter: shelter });
        }
    });
});

router.get("/:shelterId/pets", function (req, res, next) {
    var key = process.env.PET_FINDER_API_KEY;
    var url = "http://api.petfinder.com/shelter.get?key=" + key + "&id=" + req.params.shelterId + "&format=json";
    request(url, function (err, response, body) {
        if (err) {
            res.send(err);
        } else {
            res.locals.shelterName = JSON.parse(body).petfinder.shelter.name.$t;
        }
    });
    next();
},
    function (req, res, next) {
        var key = process.env.PET_FINDER_API_KEY;
        var url = "http://api.petfinder.com/shelter.getPets?key=" + key + "&id=" + req.params.shelterId + "&format=json";
        request(url, function (err, response, body) {
            if (err) {
                res.send(err);
            } else {
                var pets = [];
                JSON.parse(body).petfinder.pets.pet.forEach(function (pet) {
                    if (typeof pet.media.photos === 'undefined') {
                        profilePicture = '/images/placeholder.jpg'
                    } else {
                        profilePicture = pet.media.photos.photo.find(isImageSizePnt).$t
                    }
                    pets.push({
                        id: pet.id.$t,
                        animal: pet.animal.$t,
                        name: pet.name.$t,
                        sex: (pet.sex.$t == "M") ? "Male" : "Female",
                        age: pet.age.$t,
                        size: petSize(pet.size.$t),
                        profilePicture: profilePicture
                    });
                });
                res.render("./shelters/pets", { title: "Shelter Pets", shelter: res.locals.shelterName, pets: pets });
            }
        });
    });

function isImageSizePnt(element) {
    return element["@size"] == "pnt";
}

function petSize(size) {
    if (size == "L")
        return "Large";
    else if (size == "M")
        return "Medium";
    else if (size == "S")
        return "Small";
    else
        return size;
}


module.exports = router;