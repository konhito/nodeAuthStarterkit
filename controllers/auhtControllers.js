import { User } from "../models/user.modal.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { mailtrap } from "../mailtrap/mailtrap.config.js";

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

export const signup = async (req, res) => {
  const { email, name, password } = req.body;
  try {
    if (!email || !name || !password) {
      res.status(411).json({
        msg: "Please provide all the details",
      });
    }

    const userAlredyExits = await User.findOne({ email }); // here value will be true and false but if user is presnd in the database or not
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
    // await mailtrap(user.email, verificationToken); // sending mail after sucessfully saved the user

    //jwt

    generateTokenandSetCookies(res, user._id);
    await mailtrap(user.email, verificationToken); // sending mail after sucessfully saved the user

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

export const verifymail = async (req, res) => {
  // - - - - -  -
  const { code } = req.body;
  console.log(code);
  try {
    const user = await User.findOne({
      verificationToken: code,
      // verificationTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(404).json({
        msg: "user not found",
      });
    }
    user.isverifyed = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
    await mailtrap(user.email, code);
    res.status(200).json({
      msg: "sucessfully user verified",
    });
  } catch (error) {
    res.status(400).json({
      msg: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { mail, password } = req.headers;

  const user = await User.findOne({
    email: mail,
  });
  console.log(user);
  if (!user.isverifyed) {
    return res.status(404).json({
      msg: "verify your mail before login",
    });
  }
  if (!user) {
    return res.status(404).json({
      msg: "invalid email",
    });
  }
  const unhassedpass = await bcryptjs.compare(password, user.password);
  console.log(unhassedpass);
  if (!unhassedpass) {
    return res.status(404).json({
      msg: "invalid  password",
    });
  }
  generateTokenandSetCookies(res, user._id);
  user.lastlogin = Date.now();
  await user.save();
  res.status(200).json({
    msg: "logged in successfully",
  });
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    msg: "Succesfully logged out",
  });
};

export const passforgot = async (req, res) => {
  const { mail, username } = req.body;
  const user = await User.findOne({ email: mail });
  if (username == user.name) {
    const { newPass } = req.body; //intresting its not taking from headers??/ why
    const hashedPassword = await bcryptjs.hash(newPass, 10); // 10 i see

    user.password = hashedPassword;
    await user.save();

    res.status(201).json({
      success: true,
      msg: "your password successfully changed",
      user: {
        ...user._doc,
      },
    });
  } else {
    res.status(411).json({
      msg: "user not found",
    });
  }
};

//42:00
