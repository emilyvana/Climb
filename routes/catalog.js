const express = require("express");

// Require controller modules.
const climb_controller = require("../controllers/climbcontroller");
const location_controller = require("../controllers/locationcontroller");
const wall_controller = require("../controllers/wallcontroller");

const router = express.Router();

/// BOOK ROUTES ///

// GET catalog home page.
router.get("/", climb_controller.index);

// GET request for creating a Climb. NOTE This must come before routes that display Climb (uses id).
router.get("/climb/create", climb_controller.climb_create_get);

// POST request for creating Climb.
router.post("/climb/create", climb_controller.climb_create_post);

// GET request to delete Climb.
router.get("/climb/:id/delete", climb_controller.climb_delete_get);

// POST request to delete Climb.
router.post("/climb/:id/delete", climb_controller.climb_delete_post);

// GET request to update Climb.
router.get("/climb/:id/update", climb_controller.climb_update_get);

// POST request to update Climb.
router.post("/climb/:id/update", climb_controller.climb_update_post);

// GET request for one Climb.
router.get("/climb/:id", climb_controller.climb_detail);

// GET request for list of all Climb items.
router.get("/climbs", climb_controller.climb_list);

/// location ROUTES ///

// GET request for creating Location. NOTE This must come before route for id (i.e. display location).
router.get("/location/create", location_controller.location_create_get);

// POST request for creating Location.
router.post("/location/create", location_controller.location_create_post);

// GET request to delete Location.
router.get("/location/:id/delete", location_controller.location_delete_get);

// POST request to delete Location.
router.post("/location/:id/delete", location_controller.location_delete_post);

// GET request to update Location.
router.get("/location/:id/update", location_controller.location_update_get);

// POST request to update Location.
router.post("/location/:id/update", location_controller.location_update_post);

// GET request for one Location.
router.get("/location/:id", location_controller.location_detail);

// GET request for list of all Locations.
router.get("/locations", location_controller.location_list);

/// wall ROUTES ///

// GET request for creating a Wall. NOTE This must come before route that displays Wall (uses id).
router.get("/wall/create", wall_controller.wall_create_get);

// POST request for creating Wall.
router.post("/wall/create", wall_controller.wall_create_post);

// GET request to delete Wall.
router.get("/wall/:id/delete", wall_controller.wall_delete_get);

// POST request to delete Wall.
router.post("/wall/:id/delete", wall_controller.wall_delete_post);

// GET request to update Wall.
router.get("/wall/:id/update", wall_controller.wall_update_get);

// POST request to update Wall.
router.post("/wall/:id/update", wall_controller.wall_update_post);

// GET request for one Wall.
router.get("/wall/:id", wall_controller.wall_detail);

// GET request for list of all Wall.
router.get("/walls", wall_controller.wall_list);



module.exports = router;
