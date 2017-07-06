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
    var url = "http://api.petfinder.com/pet.find?key=" + key + "&location=" + location + "&format=json&count=5";

    request(url, function(err, response, body) {
        if (err) {
            res.send(err);
        } else {
            var pets = parsePetsResponse(JSON.parse(body).petfinder);
            res.render('./pets/index', { title: 'Pet Adoption', pets: pets });
        }
    });
});

function parsePetsResponse(petfinderObj) {
    var petsCount = petfinderObj.lastOffset.$t;
    var pets = [];
    if (petsCount == 1) {
        pets.push({
            animal: petfinderObj.pets.pet.animal.$t,
            name: petfinderObj.pets.pet.name.$t,
            sex: petfinderObj.pets.pet.sex.$t,
            profilePicture: petfinderObj.pets.pet.media.photos.photo.find(isImageSizeX).$t
        });
    } else {
        petfinderObj.pets.pet.forEach(function(pet) {
            pets.push({
                animal: pet.animal.$t,
                name: pet.name.$t,
                sex: pet.sex.$t,
                profilePicture: pet.media.photos.photo.find(isImageSizePn).$t
            });
        }, this);
    }
    return pets;
}

function isImageSizeX(element) {
    return element["@size"] == "x";
}

function isImageSizePn(element) {
    return element["@size"] == "pn";
}

module.exports = router;