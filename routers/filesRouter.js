const router = require("express").Router();
const { authMiddleware } = require("../middlewares");
const { FilesController } = require("../controllers");

/**
 * @swagger
 * tags:
 *  name: Files
 *  description: routes to access the files
 */

/**
 * @swagger
 * /file/profile:
 *  patch:
 *      security:
 *         - bearerAuth: []
 *      summary: Receives an image and adds it to the logged in user
 *      tags: [Files]
 *      requestBody:
 *          description: The profile image
 *          required: true
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      type: object
 *                      required:
 *                          -profileImage
 *                      properties:
 *                          profileImage:
 *                              type: string
 *                              format: binary
 *      responses:
 *          200:
 *              description: File received successfully
 *          404:
 *              description: not found
 *          500:
 *              description: Server error
 */
router.patch("/profile", authMiddleware, FilesController.addProfileImage);

/**
 * @swagger
 * /file/{filename}:
 *  get:
 *      summary: Receives request for a file with a filename and returns the file
 *      tags: [Files]
 *      parameters:
 *        - in: path
 *          name: filename
 *          schema:
 *              type: string
 *          description: Name of the file to return
 *      responses:
 *          200:
 *              description: File received successfully
 *          404:
 *              description: not found
 *          500:
 *              description: Server error
 */
router.get("/:filename", FilesController.getOne);

module.exports = router;
