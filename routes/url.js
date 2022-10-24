const express = require("express");
const validUrl = require("valid-url");
const shortId = require("shortid");
const config = require("config");
const Url = require("../models/Url");

const router = express.Router();

// @route   POST /shorten
// @desc    Create short URL
router.post("/shorten", async (req, res) => {
  const { longUrl } = req.body;
  const customUrl=req.body;
  const baseUrl = config.get("baseUrl");

  // check base url
  if (!validUrl.isUri(baseUrl)) {
    return res.status(400).json({ message: "Invalid base url" });
  }

  // create url code

 if(customUrl)
 {
    urlCode=customUrl; 
 }
 else
 {
 urlCode = shortId.generate();
 }



  // check long url
  if (validUrl.isUri(longUrl)) {
    try {
      let url = await Url.findOne({ longUrl });
      if (url) {
        res.status(201).json({ data: url });
      } else {
        const shortUrl = baseUrl + "/" + urlCode;

        url = new Url({
          longUrl,
          shortUrl,
          urlCode,
          date: new Date()
        });

        await url.save();
        res.status(201).json({ data: url });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Some error has occurred" });
    }
  } else {
    res.status(400).json({ message: "Invalid long url" });
  }
});

// @route     GET /:code
// @desc      Redirect to long/original URL
router.get("/:code", async (req, res) => {
  try {
    const url = await Url.findOne({ urlCode: req.params.code });

    if (url) {
      return res.redirect(url.longUrl);
    } else {
      return res.status(404).json({ message: "No url found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Some error has occurred" });
  }
});

module.exports = router;
