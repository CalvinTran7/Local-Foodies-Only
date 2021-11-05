const Spots = require('../models/spots');
const { cloudinary } = require('../cloudinary');
const { spotSchema } = require('../schemas');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


module.exports.index = async (req, res) => {
    const spots = await Spots.find({});
    res.render('spots/index', { spots });
}


module.exports.renderNewForm = (req, res) => {
    res.render('spots/new');
}


module.exports.createSpot = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.spot.location,
        limit: 1
    }).send()
    const spot = new Spots(req.body.spot);
    spot.geometry = geoData.body.features[0].geometry;
    spot.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    spot.author = req.user._id;
    await spot.save();
    req.flash('success', 'Successfully made a new spot!');
    res.redirect(`/spots/${spot._id}`);
}

module.exports.showSpot = async (req, res) => {
    const spot = await Spots.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!spot) {
        req.flash('error', 'Cannot find that spot!');
        return res.redirect('/spots');
    }
    res.render('spots/show', { spot });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const spot = await Spots.findById(id);
    if (!spot) {
        req.flash('error', 'Cannot find that spot!');
        return res.redirect('/spots');
    }
    res.render('spots/edit', { spot });
}

module.exports.updateSpot = async (req, res) => {
    const { id } = req.params;
    const spot = await Spots.findByIdAndUpdate(id, { ...req.body.spot });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    spot.images.push(...imgs)
    await spot.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await spot.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated a spot!');
    res.redirect(`/spots/${spot._id}`)
}

module.exports.deleteSpot = async (req, res) => {
    const { id } = req.params;
    await Spots.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a spot!');
    res.redirect('/spots');
}