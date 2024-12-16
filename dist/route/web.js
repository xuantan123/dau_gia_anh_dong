"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _signupuserController = require("../controllers/signupuserController.js");
var _signinuserController = require("../controllers/signinuserController.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var router = _express["default"].Router();
var initWebRoutes = function initWebRoutes(app) {
  router.post('/api/signup', _signupuserController.handleSignUp);
  router.post('/api/login', _signinuserController.handleLogin);
  app.use("/", router);
};
var _default = exports["default"] = initWebRoutes;