const express = require('express');

const router = express.Router();
//

router.get("/",function(req,res){
    res.send("users Router is working fine");
});

module.exports = router;    