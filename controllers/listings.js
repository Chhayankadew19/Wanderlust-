const Listing=require("../models/listing");
const ExpressError = require("../utils/ExpressError");

module.exports.index=async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("./listings/index.ejs",{allListings});  
};

module.exports.renderNewForm=(req,res)=>{  
    res.render("listings/new.ejs");
};

module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{
            path:"author",
        },
    })
    .populate("owner");
    if(!listing){
    req.flash("error","The Lisiting you are trying to reach does not exits!");
    res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing=async(req,res,next)=>{
    let url=req.file.path;
    let filename=req.file.filename;
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
};

module.exports.rendereditform=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","The Lisiting you are trying to reach does not exits!");
        res.redirect("/listings");
        }
    let originalImageUrl=listing.image.url;  
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing=async (req,res)=>{

   let { id }=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});

   if(typeof req.file!=="undefined"){ 
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
    }
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async (req,res)=>{
    let {id}=req.params;
    let deleted=await Listing.findByIdAndDelete(id);
    console.log(deleted);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};

module.exports.showSearchResult=async(req,res,next)=>{
    let {searchedDestination}=req.body;
    let foundListings=await Listing.find({
        $or:[
            {
                title:{$regex:searchedDestination,$options:'i'}
            },
            {
                location:{$regex:searchedDestination,$options:'i'}
            },
            {
                country:{$regex:searchedDestination,$options:'i'}
            }
        ]
    });

    if(foundListings.length){
        res.render("listings/searchResult.ejs",{foundListings,searchedDestination});
    }else{
        throw new ExpressError(404,"Not Found");
    }
}