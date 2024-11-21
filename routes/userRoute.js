import express from "express";
import { login } from "../controllers/authController.js";
import { apiRequestHandler } from "../error/errorHandler.js";
import { searchCompanyByName } from "../controllers/master_controllers/companyMasterController.js";
import {
  createUser,
  getCurrentUser,
} from "../controllers/master_controllers/userMasterController.js";

const router = express.Router();

router.get("/getCurrentUser", apiRequestHandler(getCurrentUser));
router.post("/createUser", apiRequestHandler(createUser));

export default router;
