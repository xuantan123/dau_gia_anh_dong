"use strict";

var _express = _interopRequireDefault(require("express"));
var _bodyParser = _interopRequireDefault(require("body-parser"));
var _viewEngine = _interopRequireDefault(require("./config/viewEngine.js"));
var _web = _interopRequireDefault(require("./route/web.js"));
var _connectDB = _interopRequireDefault(require("./config/connectDB.js"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _cors = _interopRequireDefault(require("cors"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
_dotenv["default"].config();
var app = (0, _express["default"])();
app.use(_bodyParser["default"].json());
app.use(_bodyParser["default"].urlencoded({
  extended: true
}));
app.use((0, _cors["default"])({
  origin: 'http://localhost:3000',
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));
(0, _viewEngine["default"])(app);
(0, _web["default"])(app);
(0, _connectDB["default"])();
var port = process.env.PORT || 6969;
app.listen(port, function () {
  console.log("Backend Nodejs is running on the port: " + port);
});