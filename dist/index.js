"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const routes_1 = require("./routes");
const db_1 = require("./config/db");
// Create an instance of the Express application
const app = (0, express_1.default)();
// Connect mongo db atlas
(0, db_1.connectMongoDB)();
// Set up Cross-Origin Resource Sharing (CORS) options
app.use((0, cors_1.default)());
// Serve static files from the 'public' folder
app.use(express_1.default.static(path_1.default.join(__dirname, './public')));
// Parse incoming JSON requests using body-parser
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
app.use(body_parser_1.default.json({ limit: '50mb' }));
app.use(body_parser_1.default.urlencoded({ limit: '50mb', extended: true }));
// Define routes for different API endpoints
app.use("/api/users", routes_1.UserRouter);
// Define a route to check if the backend server is running
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("Backend Server is Running now!");
}));
// Start the Express server to listen on the specified port
app.listen(config_1.PORT, () => {
    console.log(`Server is running on port ${config_1.PORT}`);
});
