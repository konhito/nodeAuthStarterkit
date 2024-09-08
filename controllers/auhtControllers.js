import { User } from "../models/user.modal.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { email, name, password } = req.body;
  try {
    if (!email || !name || !password) {
      res.status(411).json({
        msg: "Please provide all the details",
      });
    }

    const userAlredyExits = await User.findOne({ email });
    console.log(userAlredyExits);
    if (userAlredyExits) {
      res.status(400).json({
        msg: "User alredy existed",
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10); // 10 i see

    function generateVerificationCode() {
      return Math.floor(100000 + Math.random() * 9000000).toString();
    }

    const verificationToken = generateVerificationCode();

    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 1000, //expires in 24 hr
    });
    await user.save();

    //jwt
    function generateTokenandSetCookies(res, userId) {
      const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      res.cookie("jwt", token, {
        httpOnly: true, //This prvents xss attack it cannot be used by js.
        secure: (process.env.Node_ENV = "production"),
        sameSite: "strict", //csrf
        maxAge: 7 * 24 * 60 * 60 * 10000, //7 days
      });
      return token;
    }

    generateTokenandSetCookies(res, user._id);

    res.status(201).json({
      success: true,
      message: "user successfully created",
      user: {
        ...user._doc,
        password: null,
      },
    });
  } catch (error) {
    res.status(400).json({
      msg: error.message,
    });
  }
};

export const login = async (req, res) => {
  res.send("login route ");
};

export const logout = async (req, res) => {
  res.send("logout route ");
};

//42:00
