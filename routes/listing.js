const express=require("express");
const router=express.Router();
const Listing=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner,validateListing}=require("../middleware.js")
const multer  = require('multer')
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage });
const listingController=require("../controllers/listings.js");

router.route("/")
.get(wrapAsync(listingController.index)) //index
.post(isLoggedIn, upload.single('listing[image]'), validateListing ,wrapAsync(listingController.createListing))  // post for new


//new
router.get("/new",isLoggedIn,listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner, upload.single('listing[image]') ,validateListing,wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));

//edit
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.rendereditform));

//search
router.post("/search",upload.none(),wrapAsync(listingController.showSearchResult));

module.exports=router;