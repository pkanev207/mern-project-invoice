import asyncHandler from "express-async-handler";
import User from "../../models/userModel.js";
import VerificationToken from "../../models/verifyResetTokenModel.js";
import sendEmail from "../../utils/sendEmail.js";

const domainUrl = process.env.DOMAIN;
const { randomBytes } = await import("crypto");

// $-title   Resend Email Verification Tokens
// $-path    POST /api/v1/auth/resend_email_token
// $-auth    Public

// It's inevitable  that some users will not verify their accounts in time
// so create mechanism to get another email verification token
const resendEmailVerificationToken = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("An email must be provided");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error("We were unable to find a user with that email address");
  }

  if (user.isEmailVerified) {
    res.status(400);
    throw new Error("This account has already been verified. Please login");
  }

  // check if the user has verification token that has not expired
  let verificationToken = await VerificationToken.findOne({
    _userId: user._id,
  });

  if (verificationToken) {
    await VerificationToken.deleteOne();
  }

  const resentToken = randomBytes(32).toString("hex");

  let emailToken = await new VerificationToken({
    _userId: user._id,
    token: resentToken,
  }).save();

  const emailLink = `${domainUrl}/api/v1/auth/verify/${emailToken.token}/${user._id}`;
  console.log(emailLink);
  
  // a context for handlebars
  const payload = {
    name: user.firstName,
    link: emailLink,
  };

  await sendEmail(
    user.email,
    "Account Verification",
    payload,
    "./emails/template/accountVerification.handlebars"
  );

  res.json({
    success: true,
    message: `${user.firstName}, an email has been sent to your account, please verify within 15 minutes`,
  });
});

export default resendEmailVerificationToken;

// The await import() imports an EC Module statically (instead of import() imports dynamically), it's very similar to the CommonJS module require() syntax, this is the only purpose of the top level await keyword
// Supported by: (node.js 14.8.0) (chrome 89) (Firefox 89) at the time of writing this

// So why using it if we already have all those beautiful static import syntaxes? (like: import * as imp from './someModule.mjs)
// Well it's more straightforward to write and easier to remember (ex: await import('./someModule.mjs') statically requires the 'someModule' and returns its exported data as {default:'someDefVal'[, ...]} object

// // static import -----------------------------------// blocks this module untill './module1.mjs' is fully loaded
//   // traditional static import in EC modules
//     import * as imp from './module1.mjs';
//     console.log( imp );                             // -> {default:'data from module-1'}

//   // static import with await import() (does the same as above but is prettier)
//     console.log( await import('./module1.mjs') );   // -> {default:'data from module-1'}

//     function importFn1(){                           // the await import() is a satic import so cannot be used in a function body
//         // await import('./module1.mjs');           // this would throw a SyntaxError: Unexpected reserved word
//     }

// // dynamic import ----------------------------------// does not block this module, the './module2.mjs' loads once this module is fully loaded (not asynchronous)
//     import('./module2.mjs')
//         .then((res)=>{ console.log(res) })          // -> {default:'data from module-2'}
//         .catch((err)=>{ console.log(err) });

//     (function ImportFn2(){
//         import('./module2.mjs')                     // dynamic import inside a function body
//             .then((res)=>{ console.log(res) })      // -> {default:'data from module-2'}
//             .catch((err)=>{ console.log(err) });
//     })();

//     console.log( '----- MAIN MODULE END -----' );
