const Wall = require("../models/wall");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Location = require("../models/location");



// Display list of all Wall.

exports.wall_list = asyncHandler(async (req, res, next) => {
  const allWalls = await Wall.find().sort({ type : 1 })

  .exec();
  res.render("wall_list", {
    title: "Wall List",
    wall_list: allWalls,
  });
});
// Display detail page for a specific Wall.
exports.wall_detail = asyncHandler(async (req, res, next) => {
  const wall = await Wall.findById(req.params.id).exec();

  if (wall === null) {
    const err = new Error("Wall not found");
    err.status = 404;
    return next(err);
  }

  res.render("wall_detail", {
    title: "Wall Detail",
    wall,
  });
});

// Display Wall create form on GET.
exports.wall_create_get = (req, res, next) => {
  res.render("wall_form", { title: "Add your Wall" });
};


// Handle wall create on POST.
exports.wall_create_post = [
  // Validate and sanitize the name field.
  body("name", "Wall name must contain at least 2 characters")
    .trim()
    .isLength({ min: 2 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a wall object with escaped and trimmed data.
  const wall = new Wall({ 
  name: req.body.name,
  type: req.body.type,
  description: req.body.description  // carry over descriptoin
});
    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("wall_form", {
        title: "add your wall",
        wall,
        errors: errors.array(),
      });
      return;
    }
    // Data from form is valid.
    // Check if Wall with same name already exists.
    const wallExists = await Wall.findOne({ name: req.body.name })
      .collation({ locale: "en", strength: 2 })
      .exec();
    if (wallExists) {
      // Wall exists, redirect to its detail page.
      res.redirect(wallExists.url);
    } else {
      await wall.save();
      // New wall saved. Redirect to wall detail page.
      res.redirect(wall.url);
    }
  }),
];


// Display Wall delete form on GET.
exports.wall_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of wall and all their locations (in parallel)
  const [wall, allLocationsByWall] = await Promise.all([
    Wall.findById(req.params.id).exec(),
    Location.find({ wall: req.params.id }, "title summary").exec(),
  ]);

  if (wall === null) {
    // No results.
    res.redirect("/catalog/walls");
  }

  res.render("wall_delete", {
    title: "Delete Wall",
    wall,
    wall_locations: allLocationsByWall,
  });
});


// Handle Wall delete on POST.
exports.wall_delete_post = asyncHandler(async (req, res, next) => {
  const wallId = req.params.id;  // get wall ID from URL param

  console.log("=== wall_delete_post called ===");
  console.log("Wall ID from params:", wallId);
  console.log("Request body:", req.body);

  // Confirm wallId exists
  if (!wallId) {
    const err = new Error("Wall ID not provided.");
    err.status = 400;
    return next(err);
  }

  const [wall, allLocationsByWall] = await Promise.all([
    Wall.findById(wallId).exec(),
    Location.find({ wall: wallId }, "title summary").exec(),
  ]);

  if (!wall) {
    const err = new Error("Wall not found");
    err.status = 404;
    return next(err);
  }

  if (allLocationsByWall.length > 0) {
    res.render("wall_delete", {
      title: "Delete Wall",
      wall,
      wall_locations: allLocationsByWall,
    });
    return;
  }

  await Wall.findByIdAndDelete(wallId);
  res.redirect("/catalog/walls");
});


// Display Wall update form on GET.
exports.wall_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Wall update GET");
});

// Handle Wall update on POST.
exports.wall_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Wall update POST");
});
