import { successResponse } from "../util.js";
import { db } from "../database.js";
import jwt from "jsonwebtoken";
import ApiError from "../error/apiError.js";
import { getUser } from "./master_controllers/userMasterController.js";
import { currentTimeStamp, getSingleEntry } from "../helpers/helpers.js";

const login = async (req, res, next) => {
  const { USER_EMAIL, PASSWORD } = req.body;

  if (!USER_EMAIL || !PASSWORD) {
    return next(ApiError.badRequest("Email and password are required"));
  }

  var user = await getSingleEntry("USER_MASTER", "USER_EMAIL", USER_EMAIL);
  //
  if (!user) {
    return next(ApiError.badRequest("Invalid Email or Password"));
  }

  if (PASSWORD != user.PASSWORD) {
    return next(ApiError.badRequest("Please check your password"));
  }

  console.log("asa");
  console.log({ USER_CODE: user.USER_CODE });
  const token = jwt.sign(
    { USER_CODE: user.USER_CODE },
    process.env.ACCESS_TOKEN_SECRET
  );
  delete user.PASSWORD;

  var [company] = await db.query(
    "SELECT COMP_CODE, COMP_NAME FROM COMPANY_MASTER WHERE COMP_CODE = ?",
    [user.COMP_CODE]
  );
  var [branch] = await db.query(
    "SELECT BU_CODE, BU_NAME FROM BU_MASTER WHERE BU_CODE = ?",
    [user.BU_CODE]
  );

  console.log("company[0]");
  console.log(company[0]);
  user.COMP_CODE = company[0].COMP_CODE;
  user.COMP_NAME = company[0].COMP_NAME;
  user.BU_CODE = branch[0].BU_CODE;
  user.BU_NAME = branch[0].BU_NAME;

  user.CREATE_RIGHTS = user.CREATE_RIGHTS == 1;
  user.DISPLAY_RIGHTS = user.DISPLAY_RIGHTS == 1;
  user.EDIT_RIGHTS = user.EDIT_RIGHTS == 1;
  user.DELETE_RIGHTS = user.DELETE_RIGHTS == 1;

  return res
    .status(200)
    .json(
      successResponse("Login successful", { accessToken: token, user: user })
    );
};

const verifyUser = async (req, res, next) => {
  let i = 10;
  try {
    if (
      req.originalUrl.startsWith("/auth") ||
      req.originalUrl.startsWith("/hospital_erp")
    ) {
      return next();
    }

    console.log(`wew ${req.headers.authorization}`);
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return next(ApiError.unauthorized("Please login"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    let user = await getUser(decoded.USER_CODE);

    if (user == undefined) {
      return next(ApiError.unauthorized("Please login"));
    }

    var [company] = await db.query(
      "SELECT COMP_CODE, COMP_NAME FROM COMPANY_MASTER WHERE COMP_CODE = ?",
      [user.COMP_CODE]
    );
    var [branch] = await db.query(
      "SELECT BU_CODE, BU_NAME FROM BU_MASTER WHERE BU_CODE = ?",
      [user.BU_CODE]
    );
    console.log("company[0]");
    console.log(company[0]);
    user.COMP_CODE = company[0].COMP_CODE;
    user.COMP_NAME = company[0].COMP_NAME;
    user.BU_CODE = branch[0].BU_CODE;
    user.BU_NAME = branch[0].BU_NAME;

    user.CREATE_RIGHTS = user.CREATE_RIGHTS == 1;
    user.DISPLAY_RIGHTS = user.DISPLAY_RIGHTS == 1;
    user.EDIT_RIGHTS = user.EDIT_RIGHTS == 1;
    user.DELETE_RIGHTS = user.DELETE_RIGHTS == 1;

    if (
      !user.CREATE_RIGHTS &&
      !user.DISPLAY_RIGHTS &&
      !user.EDIT_RIGHTS &&
      !user.DELETE_RIGHTS
    ) {
      return next(
        ApiError.unauthorized(
          "Insufficient privileges. Please contact the administrator for assistance."
        )
      );
    }

    req.user = user;

    if (req.user == undefined) {
      return next(ApiError.unauthorized("Please login"));
    }
    console.log("req.user");
    console.log(req.user);
    next();
  } catch (e) {
    return next(e);
  }
};

const dump = async (req, res, next) => {
  // try {
  //   await db.query("BEGIN");
  //   const duplicateCities = {};
  //   var actualCities = [];
  //   for (const [state, cities] of Object.entries(jsonData)) {
  //     for (const city of cities) {
  //       actualCities.push({
  //         state: state,
  //         city: city,
  //       });
  //     }
  //   }
  //   for (const data of actualCities) {
  //     const cityState = `${data.city} - ${data.state}`;
  //     if (duplicateCities[data.city]) {
  //       duplicateCities[data.city].push(cityState);
  //     } else {
  //       duplicateCities[data.city] = [cityState];
  //     }
  //   }
  //   const resultArray = [];
  //   for (const city in duplicateCities) {
  //     if (duplicateCities[city].length > 1) {
  //       resultArray.push(...duplicateCities[city]);
  //     }
  //   }
  //   await db.query("COMMIT");
  //   res.send(resultArray);
  // } catch (e) {
  //   await db.query("ROLLBACK");
  //   return next(e);
  // }
};

export { login, verifyUser, dump };
