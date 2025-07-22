const Climb = require("../models/climb");
const Location = require("../models/location");
const Wall = require("../models/wall");
const { body, validationResult } = require("express-validator");


const asyncHandler = require("express-async-handler");

// Display the home page with climb, location, and wall counts
exports.index = asyncHandler(async (req, res, next) => {
  const [
    numClimbs,
    numLocations,
    numWalls,
  ] = await Promise.all([
    Climb.countDocuments({}).exec(),
    Location.countDocuments({}).exec(),
    Wall.countDocuments({}).exec(),
]);


  res.render("index", {
    title: "Track Your Climbs",
    climb_count: numClimbs,
    location_count: numLocations,
    wall_count: numWalls,
  });
});
// Display list of all Climbs.
exports.climb_list = asyncHandler(async (req, res, next) => {
  const allClimbs = await Climb.find()
    .populate('location') // make sure to populate if you want to access location.name
    .exec();

  res.render('climb_list', { title: 'Climb List', level_list: allClimbs });
});

// Display detail page for a specific Climb.
exports.climb_detail = asyncHandler(async (req, res, next) => {
  const climb = await Climb.findById(req.params.id)
    .populate('location')
    .exec();

  if (!climb) {
    const err = new Error("Climb not found");
    err.status = 404;
    return next(err);
  }

  res.render("climb_detail", {
    title: "Climb Detail",
    climb,
  });
});

// Display Climb create form on GET.

exports.climb_create_get = asyncHandler(async (req, res, next) => {
  // Get all locations and walls, which we can use for adding to our climb.
  const [allLocations, allWalls] = await Promise.all([
    Location.find().sort({ gym: 1 }).exec(),
    Wall.find().sort({ name: 1 }).exec(),
  ]);

  res.render("climb_form", {
    title: "Create Climb",
    locations: allLocations,
    walls: allWalls,
  });
});


// Handle climb create on POST.
exports.climb_create_post = [
  // Convert the Wall to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.Wall)) {
      req.body.Wall =
        typeof req.body.Wall === "undefined" ? [] : [req.body.Wall];
    }
    next();
  },



  // Process request 
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Climb object with escaped and trimmed data.
    const climb = new Climb({
      gradeclimb: req.body.gradeclimb,
      location: req.body.location,
      climbDate: req.body.climbDate,
     
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all location and walls for form.
      const [allLocation, allWalls] = await Promise.all([
        Location.find().sort({ gym: 1 }).exec(),
        Wall.find().sort({ name: 1 }).exec(),
      ]);

      // Mark our selected walls as checked.
   for (const wall of allWalls) {
  if (climb.wall && wall._id.equals(climb.wall)) {
    wall.checked = "true";
  }
}
      res.render("climb_form", {
        title: "Create Climb",
        locations: allLocation,
        walls: allWalls,
        climb,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save climb.
      await climb.save();
      res.redirect(climb.url);
    }
  }),
];

// Display Climb delete form on GET.
exports.climb_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of climb and all their walls (in parallel)
  const [climb, allWallsByClimb] = await Promise.all([
    Climb.findById(req.params.id).exec(),
    Wall.find({ climb: req.params.id }, "title summary").exec(),
  ]);

  if (climb === null) {
    // No results.
    res.redirect("/catalog/climbs");
  }

  res.render("climb_delete", {
    title: "Delete Climb",
    climb,
    climb_walls: allWallsByClimb,
  });
});

// Handle Climb delete on POST.
exports.climb_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of climb and all their walls (in parallel)
  const [climb, allWallsByClimb] = await Promise.all([
    Climb.findById(req.params.id).exec(),
    Wall.find({ climb: req.params.id }, "title summary").exec(),
  ]);

  if (allWallsByClimb.length > 0) {
    // Climb has walls. Render in same way as for GET route.
    res.render("climb_delete", {
      title: "Delete Climb",
      climb,
      climb_walls: allWallsByClimb,
    });
    return;
  }
  // Climb has no walls. Delete object and redirect to the list of climbs.
  await Climb.findByIdAndDelete(req.body.climbid);
  res.redirect("/catalog/climbs");
});


// Display climb update form on GET.
exports.climb_update_get = asyncHandler(async (req, res, next) => {
  // Get climb, locations and walls for form.
  const [climb, allLocations, allWalls] = await Promise.all([
    Climb.findById(req.params.id).populate("location").exec(),
    Location.find().sort({ gym: 1 }).exec(),
    Wall.find().sort({ name: 1 }).exec(),
]);

  if (climb === null) {
    // No results.
    const err = new Error("Climb not found");
    err.status = 404;
    return next(err);
  }

  // Mark our selected walls as checked.
  allWalls.forEach((wall) => {
    if (climb.wall.includes(wall._id)) wall.checked = "true";
  });

  res.render("climb_form", {
    title: "Update Climb",
    locations: allLocations,
    walls: allWalls,
    climb,
  });
});


// Handle climb update on POST.
exports.climb_update_post = [
  // Convert the wall to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.wall)) {
      req.body.wall =
        typeof req.body.wall === "undefined" ? [] : [req.body.wall];
    }
    next();
  },

  // Validate and sanitize fields.
  body("gradeclimb", "Climb must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("location")
    .optional({ values: "falsy" }),
  body("climbDate")
    .optional({ values: "falsy" }),
  // Process request after validation and sanitization.

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Climb object with escaped and trimmed data.
    const climb = new Climb({
      gradeclimb: req.body.gradeclimb,
      location: req.body.location,
      climbDate: req.body.climbDate,
     
  });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all locations and walls for form
      const [allLocations, allWalls] = await Promise.all([
        Location.find().sort({ family_name: 1 }).exec(),
        Wall.find().sort({ name: 1 }).exec(),
      ]);

      // Mark our selected walls as checked.
      for (const wall of allWalls) {
        if (climb.wall.indexOf(wall._id) > -1) {
          wall.checked = "true";
        }
      }
      res.render("climb_form", {
        title: "Update Climb",
        locations: allLocations,
        walls: allWalls,
        climb,
        errors: errors.array(),
      });
      return;
    }
    // Data from form is valid. Update the record.
    const updatedClimb = await Climb.findByIdAndUpdate(req.params.id, climb, {});
    // Redirect to climb detail page.
    res.redirect(updatedClimb.url);
  }),
];
