const router = require("express").Router();
const { CommentsController } = require("../controllers");
const { authMiddleware, optionalAuthMiddleware } = require("../middlewares");
/**
 * @swagger
 * components:
 *  securitySchemes:
 *      bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *  schemas:
 *      UserDefinedComment:
 *          type: object
 *          required:
 *              -message

 *          properties:
 *              message:
 *                  type: string
 *                  description: The comment
 *          example:
 *              message: I really like it
 *      CompleteSystemComment:
 *          type: Object
 *          required:
 *              -_id
 *              -commenter
 *              -projectId
 *              -createdAt
 *          properties:
 *              _id:
 *                  type: string
 *                  description: Comment Id
 *              projectId:
 *                  type: string
 *                  description: The id of the post commented on
 *              commenter:
 *                  type: object
 *                  properties:
 *                      name:
 *                          type: string
 *                          descriptin: Name of the owner of the Commenter
 *                      id:
 *                          type: string
 *                          description: Database Id for the commenter
 *                      profileImage:
 *                          type: string
 *                          description: URL to the commenters profile image
 *              createdAt:
 *                  type: string
 *                  description: A timeStamp for the time the Comment was created
 *          example:
 *              _id: 63833ac4b4b890da38d704b2
 *              projectId: 63833ac4b4b890da38d704b2
 *              commenter: {name: Evans Munene, id: 63833ac4b4b890da38d704b2, profileImage: https://images.xyz/image1}
 *              createdAt: 2022-11-27T10:49:33.215+00:00
 */

/**
 * @swagger
 * tags:
 *  name: Comments
 *  description: All routes used for working with Comments
 */

/**
 * @swagger
 * /comments/{projectId}:
 *  get:
 *      security:
 *         - bearerAuth: []
 *      summary: Returns Comments that match search and filters
 *      tags: [Comments]
 *      parameters:
 *        - in: path
 *          name: projectId
 *          description: The ID of the project to get comments for
 *          schema:
 *              type: string
 *        - in: query
 *          name: noOfCommentsPerPage
 *          description: The number of Comments to be returned for each page. Returns 10 posts by default
 *          schema:
 *              type: string
 *        - in: query
 *          name: page
 *          description: The current page to be returned
 *          schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Comment retrieval
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/CompleteSystemComment'
 *          400:
 *              description: Bad request, possibly because of invalid filters
 *          403:
 *              description: forbidden, not logged in or does not have permissions to create Comment
 *          500:
 *              description: unknown server error
 */

router.get("/:projectId", optionalAuthMiddleware, CommentsController.getMany);

/**
 * @swagger
 * /comments/{projectId}:
 *  post:
 *      security:
 *         - bearerAuth: []
 *      summary: Receives details about a Comment and creates a new Comment to the database
 *      tags: [Comments]
 *      parameters:
 *        - in: path
 *          name: projectId
 *          description: The ID of the project to add a comment to
 *          schema:
 *              type: string
 *      requestBody:
 *          description: Comment Properties
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/UserDefinedComment'
 *      responses:
 *          200:
 *              description: Comment creation successful
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/CompleteSystemComment'
 *          400:
 *              description: Bad request, possibly because of invalid Comment information
 *          403:
 *              description: forbidden, not logged in or does not have permissions to create Comment
 *          500:
 *              description: unknown server error
 */
router.post("/:projectId", authMiddleware, CommentsController.createOne);

module.exports = router;
