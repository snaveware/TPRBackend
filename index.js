/**
 * phone number for display
 * completion level
 */
const { resolve } = require("path");
global.appRoot = resolve(__dirname);

/**
 * Third Party Modules
 */
const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const fs = require("fs");

/**
 * Custom Modules
 */

const Logger = require("./Logger");
const RequestHandler = require("./RequestHandler");
const { connectDatabase, setupAdminAccount } = require("./database");
const {
    authRouter,
    projectsRouter,
    commentsRouter,
    filesRouter,
    userProjectsRouter,
} = require("./routers");
const { createRequestId, logRequests } = require("./middlewares");
const { sysConfig } = require("./config");

/** logs folder */
const folderName = global.appRoot + "/logs/";

try {
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
} catch (err) {
    console.error(err);
    Logger.error(err);
    process.emit("SIGINT", { reason: "Failed to create logs folder" });
}

/** uploads folder */

const dir = global.appRoot + "/uploads";

try {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
} catch (error) {
    console.log(error);
    Logger.error(error);
    process.emit("SIGINT", { reason: "Failed to create uploads folder" });
}

/**
 * High Level Declarations and Functions
 */
connectDatabase();
const app = express();
const PORT = process.env.PORT;

/**
 * Setup Swagger API Documentation if environment is not production
 */

if (sysConfig.NODE_ENV === "development" || sysConfig.NODE_ENV === "testing") {
    const swaggerOptions = {
        definition: {
            openapi: "3.0.0",
            info: {
                title: "TUK Project Repository API",
                version: "1.0.0",
                description: "API endpoints for TUK Project Repository API",
            },
        },
        apis: ["./routers/*.js", "./routers/advanced/*.js"],
    };

    const specs = swaggerJsDoc(swaggerOptions);

    app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));
}

/**
 * Middlewares
 */

app.use(express.json());
app.use(cors());
app.use(createRequestId);
app.use(logRequests);

/**
 * Using root for health check
 */
app.get("/", (req, res) => {
    RequestHandler.sendSuccess(
        req.requestId,
        res,
        "TUK Projects Repository API Server is Up and Running"
    );
});

/**
 * Routers
 */
app.use("/auth", authRouter);
app.use("/projects", projectsRouter);
app.use("/comments", commentsRouter);
app.use("/file", filesRouter);
app.use("/user/projects", userProjectsRouter);

/**
 * Other routes are recorded as 404 and 500
 */
app.get("*", (req, res) => {
    RequestHandler.sendErrorMessage(
        req.requestId,
        res,
        404,
        "The GET route you are trying to reach is not available"
    );
});

app.post("*", (req, res) => {
    RequestHandler.sendErrorMessage(
        req.requestId,
        res,
        404,
        "The POST route you are trying to reach is not available"
    );
});

app.put("*", (req, res) => {
    RequestHandler.sendErrorMessage(
        req.requestId,
        res,
        404,
        "The PUT route you are trying to reach is not available"
    );
});
app.patch("*", (req, res) => {
    RequestHandler.sendErrorMessage(
        req.requestId,
        res,
        404,
        "The PATCH route you are trying to reach is not available"
    );
});

app.delete("*", (req, res) => {
    RequestHandler.sendErrorMessage(
        req.requestId,
        res,
        404,
        "The DELETE route you are trying to reach is not available"
    );
});

/**
 * Connecting to database before starting the server
 */
mongoose.connection.on("connected", async () => {
    console.log("Database Connected successfully");

    await setupAdminAccount();

    Logger.info("Starting the server...");

    app.listen(PORT || 5000, () => {
        if (!PORT) {
            console.log("Server Running on the Default Port 5000");
            return;
        }

        console.log(`Server Started on Runtime Port ${PORT} ...`);

        console.log("---all good---");
    });
});

process.on("SIGINT", (info) => {
    Logger.warn(
        `Stopping Server   ${
            info.reason ? "Reason: " + info.reason : "Unknown reason"
        }`
    );
    console.error(
        `Stopping Server... ${
            info.reason ? "Reason: " + info.reason : "Unknown reason"
        }`
    );
    process.exit();
});
