const Location = require("../models/location");
const climb = require("../models/climb");
const Wall = require("../models/wall");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");


// Display list of all Locations.

exports.location_list = asyncHandler(async (req, res, next) => {
  const allLocations = await Location.find().populate("wall").exec();

  res.render("location_list", {
    title: "Locations",
    location_list: allLocations,
  });
});

// Display detail page for a specific Location.
exports.location_detail = asyncHandler(async (req, res, next) => {
  const location = await Location.findById(req.params.id).populate('wall').exec();

  if (!location) {
    const err = new Error('Location not found');
    err.status = 404;
    return next(err);
  }

  res.render('location_detail', {
    title: 'Location Detail',
    location: location,
  });
});
// Display Location create form on GET.
exports.location_create_get = asyncHandler(async (req, res, next) => {
  const walls = await Wall.find().exec();

  res.render("location_form", {
    title: "Create new Location",
    wall_list: walls,
  });
});


// Handle Location create on POST.
// Handle Location create on POST.
exports.location_create_post = [
  // Validate and sanitize fields.
  body("gym")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Gym Name"),
  body("city")
    .optional({ values: "falsy" }),
  body("wall", "Invalid wall ID")
    .optional({ values: "falsy" }),
	

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Location object with escaped and trimmed data
    const location = new Location({
      gym: req.body.gym,
      city: req.body.city,
      wall: req.body.wall,

    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("location_form", {
        title: "Create Location",
        location,
        errors: errors.array(),
      });
      return;
    }
    // Data from form is valid.

    // Save location.
   const savedLocation = await location.save();
res.redirect(savedLocation.url);
  }),
];


// Display Location delete form on GET.
exports.location_delete_get = asyncHandler(async (req, res, next) => {
  const [location, allclimbsByLocation] = await Promise.all([
    Location.findById(req.params.id).exec(),
    climb.find({ location: req.params.id }, "title summary").exec(),
  ]);

  if (location === null) {
    // No results.
    res.redirect("/catalog/locations");
    return;
  }

  res.render("location_delete", {
    title: "Delete Location",
    location,
    location_climbs: allclimbsByLocation,
  });
});


// Handle Location delete on POST.
exports.location_delete_post = asyncHandler(async (req, res, next) => {
  const [location, allclimbsByLocation] = await Promise.all([
    Location.findById(req.params.id).exec(),
    climb.find({ location: req.params.id }, "title summary").exec(),
  ]);

  if (allclimbsByLocation.length > 0) {
    res.render("location_delete", {
      title: "Delete Location",
      location,
      location_climbs: allclimbsByLocation,
    });
    return;
  }

  
  await Location.findByIdAndDelete(req.params.id);
  res.redirect("/catalog/locations");
});

// Display Location update form on GET.
exports.location_update_get = asyncHandler(async (req, res, next) => {
  const [location, walls] = await Promise.all([
    Location.findById(req.params.id).exec(),
    Wall.find().exec(),
  ]);

  if (location === null) {
    const err = new Error("Location not found");
    err.status = 404;
    return next(err);
  }

  res.render("location_form", {
    title: "Update Location",
    location,
    wall_list: walls,
  });
});

// Handle Location update on POST.
exports.location_update_post = [
  // Validate and sanitize fields.
  body("gym")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Gym name must not be empty"),
  body("city")
    .optional({ checkFalsy: true })
    .trim()
    .escape(),
  body("wall")
    .optional({ checkFalsy: true })
    .trim()
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    // Create a Location object with the updated data and the same id
    const location = new Location({
      gym: req.body.gym,
      city: req.body.city,
      wall: req.body.wall,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values and error messages.
      res.render("location_form", {
        title: "Update Location",
        location,
        errors: errors.array(),
      });
      return;
    } else {
      // Data is valid. Update the record.
      const updatedLocation = await Location.findByIdAndUpdate(req.params.id, location, {});
      // Redirect to the detail page of the updated location.
      res.redirect(updatedLocation.url);
    }
  }),
];
