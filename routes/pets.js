var express = require('express'),
    router = express.Router({ mergeParams: true }),
    request = require("request");

/* GET pets index page. */
router.get('/', function(req, res, next) {
    res.render('./pets/index', { title: 'Pet Adoption' });
});

/* POST pets index page. */
router.post('/', function(req, res, next) {
    var location = req.body.location;
    var key = process.env.PET_FINDER_API_KEY;
    var url = "http://api.petfinder.com/pet.find?key=" + key + "&location=" + location + "&format=json&count=20";

    request(url, function(err, response, body) {
        if (err) {
            res.send(err);
        } else {
            var pets = parsePetsResponse(JSON.parse(body).petfinder);
            res.render('./pets/index', { title: 'Pet Adoption', pets: pets, customStylesheet: "pets.css" });
        }
    });
});

router.get("/:id", function(req, res, next) {
    var key = process.env.PET_FINDER_API_KEY;
    var url = "http://api.petfinder.com/pet.get?key=" + key + "&id=" + req.params.id + "&format=json";

    request(url, function(err, response, body) {
        if (err) {
            res.send(err);
        } else {
            var petfinderObj = JSON.parse(body).petfinder;
            var pet = {
                id: petfinderObj.pet.id.$t,
                animal: petfinderObj.pet.animal.$t,
                name: petfinderObj.pet.name.$t,
                sex: (petfinderObj.pet.sex.$t == "M") ? "Male" : "Female",
                age: petfinderObj.pet.age.$t,
                size: petSize(petfinderObj.pet.size.$t),
                profilePicture: petfinderObj.pet.media.photos.photo.find(isImageSizeX).$t,
                description: petfinderObj.pet.description.$t
            };
            res.render('./pets/show', { title: 'Pet Adoption', pet: pet });
        }
    });
});

function parsePetsResponse(petfinderObj) {
    var petsCount = petfinderObj.lastOffset.$t;
    var pets = [];
    if (petsCount == 1) {
        pets.push({
            id: petfinderObj.pets.pet.id.$t,
            animal: petfinderObj.pets.pet.animal.$t,
            name: petfinderObj.pets.pet.name.$t,
            sex: (petfinderObj.pets.pet.sex.$t == "M") ? "Male" : "Female",
            age: petfinderObj.pets.pet.age.$t,
            size: petSize(petfinderObj.pets.pet.size.$t),
            profilePicture: petfinderObj.pets.pet.media.photos.photo.find(isImageSizeX).$t
        });
    } else {
        petfinderObj.pets.pet.forEach(function(pet) {
            pets.push({
                id: pet.id.$t,
                animal: pet.animal.$t,
                name: pet.name.$t,
                sex: (pet.sex.$t == "M") ? "Male" : "Female",
                age: pet.age.$t,
                size: petSize(pet.size.$t),
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