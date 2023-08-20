const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const verify = require("../verifyToken");

//create user
router.post("/", verify, async (req, res) => {
  if (req.user.isAdmin) {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY
      ).toString(),
      status: req.body.status,
      isAdmin: req.body.isAdmin,
    });
    try {
      const user = await newUser.save();
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You are not allowed!");
  }
});

//In summary, req.user.id is often used to represent the ID of an authenticated user stored in the JWT payload, while req.params.id is used to access dynamic route parameters extracted from the URL path.

//UPDATE user only for authenticated user
router.put("/:id", verify, async (req, res) => {
  //req.user represents the user data that has been decoded from the JWT.
  if (!req.user || !req.user.id || !req.params.id) {
    return res.status(401).json("Authentication required.");
  }

  //req.params.id would refer to the value of the id parameter extracted from the route path.
  if (req.user.id === req.params.id || req.user.isAdmin) {
    if (req.body.password) {
      req.body.password = CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY
      ).toString();
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});

//DELETE delete user
//DELETE
router.delete("/:id", verify, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("User has been deleted...");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can delete only your account!");
  }
});

//Get single user
router.get("/find/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    //we dont want to see the password
    const { password, ...info } = user._doc;
    res.status(200).json(info);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get all user
router.get("/", verify, async (req, res) => {
  //req.query.new: This accesses the value of the new query parameter from the req.query objec
  const query = req.query.new;
  if (req.user?.isAdmin) {
    try {
      //if it is new user then it will show 10 user otherwise all users
      const users = query ? await User.find({}).limit(10) : await User.find({});

      // sort({ _id: -1 }); it will give latest data
      //we dont want to see the password

      res.status(200).json(users);
    } catch (err) {
      res.status(500).json("You are not allowed to see all users!");
    }
  }
});

//get user stats
//total user per months with id
router.get("/stats", async (req, res) => {
  const today = new Date();
  const lastYear = today.setFullYear(today.setFullYear() - 1);

  try {
    const data = await User.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
