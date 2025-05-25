
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const bcrypt = require("bcryptjs");
const auth = require("../auth");

// Register user
module.exports.registerUser = async (req, res) => {
    if (!req.body.email.includes("@")) {
        return res.status(400).send({ error: "Email invalid" });
    } else if (req.body.mobileNo.length !== 11) {
        return res.status(400).send({ error: "Mobile number invalid" });
    } else if (req.body.password.length < 8) {
        return res.status(400).send({ error: "Password must be at least 8 characters" });
    }
    try {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
            return res.status(400).send({ error: "Email already exists" });
        }
        const mobileExists = await User.findOne({ mobileNo: req.body.mobileNo });
        if (mobileExists) {
            return res.status(400).send({ error: "Mobile number already exists" });
        }
        let newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            mobileNo: req.body.mobileNo,
            password: bcrypt.hashSync(req.body.password, 10),
            profilePicture: req.body.profilePicture || 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png'
        });
        await newUser.save();
        res.status(201).send({ message: "Registered Successfully" });
    } catch (err) {
        res.status(500).send({ error: "Error in saving" });
    }
};

// Login user
module.exports.loginUser = (req, res) => {
    if (!req.body.email.includes("@")) {
        return res.status(400).send({ error: "Invalid Email" });
    }
    User.findOne({ email: req.body.email })
    .then(result => {
        if (!result) {
            return res.status(404).send({ error: "Email not found" });
        }
        const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
        if (!isPasswordCorrect) {
            return res.status(401).send({ error: "Incorrect password" });
        }
        return res.status(200).send({ 
            access: auth.createAccessToken(result),
            userId: result._id,
            isAdmin: result.isAdmin
        });
    })
    .catch(err => {
        res.status(500).send({ error: "Server error during login" });
    });
};

// Get user profile
module.exports.getProfile = (req, res) => {
    const userId = req.user.id;
    return User.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).send({ error: 'User not found' });
            }
            user.password = undefined;
            return res.status(200).send(user);
        })
        .catch(err => res.status(500).send({ error: 'Failed to fetch user profile', details: err }));
};

// Update user profile
module.exports.updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { firstName, lastName, email, mobileNo, profilePicture } = req.body;
    if (!firstName || !lastName || !email || !mobileNo) {
        return res.status(400).send({ error: 'All fields are required' });
    }
    if (!email.includes("@")) {
        return res.status(400).send({ error: "Invalid email format" });
    }
    if (mobileNo.length !== 11) {
        return res.status(400).send({ error: "Mobile number must be 11 digits" });
    }
    try {
        const existingUserWithEmail = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUserWithEmail) {
            return res.status(400).send({ error: 'Email already in use' });
        }
        const existingUserWithMobile = await User.findOne({ mobileNo, _id: { $ne: userId } });
        if (existingUserWithMobile) {
            return res.status(400).send({ error: 'Mobile number already in use' });
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                firstName,
                lastName,
                email,
                mobileNo,
                profilePicture: profilePicture || 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png'
            },
            { new: true, runValidators: true }
        );
        if (!updatedUser) {
            return res.status(404).send({ error: 'User not found' });
        }
        updatedUser.password = undefined;
        res.status(200).send(updatedUser);
    } catch (err) {
        res.status(500).send({ error: 'Failed to update profile', details: err.message });
    }
};

// Reset user password
module.exports.resetPassword = async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        const isPasswordCorrect = bcrypt.compareSync(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).send({ error: 'Current password is incorrect' });
        }
        if (newPassword.length < 8) {
            return res.status(400).send({ error: 'Password must be at least 8 characters' });
        }
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        await User.findByIdAndUpdate(userId, { password: hashedPassword });
        res.status(200).send({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).send({ error: 'Failed to reset password', details: err.message });
    }
};

// Set user as admin
module.exports.setAsAdmin = (req, res) => {
    return User.findById(req.params.id)
    .then(result => {
        if (result === null) {
            return res.status(404).send({ error: "User not Found" });
        } else {
            result.isAdmin = true;
            return result.save()
            .then((updatedUser) => res.status(200).send({ updatedUser }))
            .catch(err => res.status(500).send({ error: 'Failed in Saving', details: err }));
        }
    })
    .catch(err => res.status(500).send({ error: 'Failed in Find', details: err }));
};

// Check if email exists
module.exports.checkEmailExists = (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).send({ error: "Email is required" });
    }
    User.findOne({ email: email })
    .then(user => {
        res.status(200).send({ exists: !!user });
    })
    .catch(err => {
        res.status(500).send({ error: "Error checking email" });
    });
};

// Check if mobile number exists
module.exports.checkMobileExists = (req, res) => {
    const { mobileNo } = req.body;
    if (!mobileNo) {
        return res.status(400).send({ error: "Mobile number is required" });
    }
    User.findOne({ mobileNo: mobileNo })
    .then(user => {
        res.status(200).send({ exists: !!user });
    })
    .catch(err => {
        res.status(500).send({ error: "Error checking mobile number" });
    });
};
