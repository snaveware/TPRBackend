const router = require("express").Router();
const { authMiddleware, optionalAuthMiddleware } = require("../middlewares");
const { ProjectsController } = require("../controllers");

/**
 * @swagger
 * components:
 *  securitySchemes:
 *      bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *  schemas:
 *      UserDefinedProject:
 *          type: object
 *          required:
 *              -title
 *              -category
 *              -contactPhoneNumber
 *              -contactEmail
 *              -status
 *              -summary
 *              -description
 *          properties:
 *              title:
 *                  type: string
 *                  description: The name of the project
 *              category:
 *                  type: string
 *                  description: the category where the project belongs
 *                  enum: [engineering,software,IOT,Business,Art]
 *              contactPhoneNumber:
 *                  type: string
 *                  description: Phone Number for the contact person
 *              contactEmail:
 *                  type: string
 *                  description: Email for the Contact Person
 *              status:
 *                  type: string
 *                  description: Shows if the project is published or draft
 *                  enum: [published,draft]
 *              link:
 *                  type: string
 *                  description: a link to other resources eg. a github repository
 *              summary: 
 *                  type: string
 *                  description: A short description of the project
 *              description: 
 *                  type: string
 *                  description: A detailed description of the project
 *          example:
 *              title: IOT Weather Reporting System using Adruino and Raspberry Pi
 *              category: IOT
 *              contactPhoneNumber: "254712345678"
 *              contactEmail: info@snaveware.com
 *              status: published
 *              link: https://snaveware.com
 *              summary: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
 *              description: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum, Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
 *      ProjectAttachments:
 *          type: object
 *          required:
 *              -attachments
 *          properties:
 *              attachments:
 *                  type: array
 *                  maxItems: 5
 *                  items:
 *                      type: string
 *                      format: binary
 *          example:
 *              attachments: [attachment1.png,attachment2.docx,attachment3.pdf]
 *      UserDefinedProjectUpdate:
 *          type: object
 *          properties:
 *              title:
 *                  type: string
 *                  description: The name of the project
 *              category:
 *                  type: string
 *                  description: the category where the project belongs
 *                  enum: [engineering,software,IOT,Business,Art]
 *              contactPhoneNumber:
 *                  type: string
 *                  description: Phone Number for the contact person
 *              contactEmail:
 *                  type: string
 *                  description: Email for the Contact Person
 *              status:
 *                  type: string
 *                  description: Shows if the project is published or draft
 *                  enum: [published,draft]
 *              link:
 *                  type: string
 *                  description: a link to other resources eg. a github repository
 *              summary: 
 *                  type: string
 *                  description: A short description of the project
 *              description: 
 *                  type: string
 *                  description: A detailed description of the project
 *              attachmentsToRemove:
 *                  type: array
 *                  maxItems: 10
 *                  items:
 *                      type: string
 *              attachmentsToAdd:
 *                  type: array
 *                  maxItems: 5
 *                  items:
 *                      type: string
 *                      format: binary
 *          example:
 *              title: IOT Weather Reporting System using Adruino and Raspberry Pi
 *              category: IOT
 *              contactPhoneNumber: "254712345678"
 *              contactEmail: info@snaveware.com
 *              status: published
 *      CompleteSystemProject:
 *          type: object
 *          required:
 *              -_id
 *              -title
 *              -category
 *              -contactPhoneNumber
 *              -contactEmail
 *              -status
 *              -noOfLikes
 *              -noOfComments
 *              -owner
 *              -createdAt
 *              -updatedAt
 *              -summary
 *              -description
 *          properties:
 *              _id:
 *                  type: string
 *                  description: Project Id
 *              title:
 *                  type: string
 *                  description: The name of the project
 *              category:
 *                  type: string
 *                  description: the category where the project belongs
 *                  enum: [engineering,software,IOT,Business,Art]
 *              contactPhoneNumber:
 *                  type: string
 *                  description: Phone Number for the contact person
 *              contactEmail:
 *                  type: string
 *                  description: Email for the Contact Person
 *              status:
 *                  type: string
 *                  description: Shows if the project is published or draft
 *                  enum: [published,draft]
 *              attachments:
 *                  type: array
 *                  maxItems: 5
 *                  items:
 *                      type: string
 *                      description: A url for an attachment
 *                  
 *              noOfLikes:
 *                  type: number
 *                  description: shows number of likes the project has
 *              noOfComments:
 *                  type: number
 *                  description: shows Number of Comments the project has
 *              isLikedByMe:
 *                  tyep: boolean
 *                  description: shows if the currently logged In user has liked the project
 *              link:
 *                  type: string
 *                  description: a link to other resources eg. a github repository
 *              summary: 
 *                  type: string
 *                  description: A short description of the project
 *              description: 
 *                  type: string
 *                  description: A detailed description of the project
 *              owner:
 *                  type: object
 *                  properties:
 *                      name:
 *                          type: string
 *                          descriptin: Name of the owner of the project
 *                      id:
 *                          type: string
 *                          description: Database Id for the owner of the project
 *                      profileImage:
 *                          type: String
 *                          description: The url for profile image of the owner
 *              createdAt:
 *                  type: string
 *                  description: A timeStamp for the time the project was created
 *              updatedAt:
 *                  type: string
 *                  description: A timestamp for the time the project was last updated
 *          example:
 *              _id: 63833ac4b4b890da38d704b2
 *              title: IOT Weather Reporting System using Adruino and Raspberry Pi
 *              category: IOT
 *              contactPhoneNumber: "254712345678"
 *              contactEmail: info@snaveware.com
 *              status: published
 *              noOfLikes: 10
 *              noOfComment: 10
 *              owner: {name: Evans Munene, id: 63833ac4b4b890da38d704b2}
 *              isLikedByMe: true
 *              link: https://snaveware.com
 *              summary: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
 *              description: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum, Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
 *              attachments: [https://images.xyz/image1]
 *              createdAt: 2022-11-27T10:49:33.215+00:00
 *              updatedAt: 2022-11-27T10:49:33.215+00:00

 *      NoOfLikes:
 *          type: object
 *          required:
 *              -noOfLikes
 *          properties:
 *              noOfLikes:
 *                  type: number
 *                  description: The new Number of Likes for the post
 *          example:
 *              noOfLikes: 50
 *
 */

/**
 * @swagger
 * tags:
 *  name: Projects
 *  description: All routes used for working with projects
 */

/**
 * @swagger
 * /projects:
 *  get:
 *      security:
 *         - bearerAuth: []
 *      summary: Returns projects that match search and filters
 *      tags: [Projects]
 *      parameters:
 *        - in: query
 *          name: searchString
 *          description: A string of what is typed in the searchbox
 *          schema:
 *              type: string
 *        - in: query
 *          name: noOfProjectsPerPage
 *          description: The number of projects to be returned for each page. Returns 10 posts by default
 *          schema:
 *              type: string
 *        - in: query
 *          name: page
 *          description: The current page to be returned
 *          schema:
 *              type: string
 *        - in: query
 *          name: category
 *          description: The category to filter projects. Searches all categories by default
 *          schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Project retrieval successful
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/CompleteSystemProject'
 *          400:
 *              description: Bad request, possibly because of invalid filters
 *          403:
 *              description: forbidden, not logged in or does not have permissions to create project
 *          500:
 *              description: unknown server error
 */

router.get("/", optionalAuthMiddleware, ProjectsController.getMany);

/**
 * @swagger
 * /projects/{projectId}:
 *  get:
 *      security:
 *         - bearerAuth: []
 *      summary: Returns a project with given id
 *      tags: [Projects]
 *      parameters:
 *        - in: path
 *          name: projectId
 *          description: The ID of the project to return
 *          schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Project retrieval successful
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/CompleteSystemProject'
 *          400:
 *              description: Bad request, possibly because of invalid project id
 *          403:
 *              description: forbidden, not logged in or does not have permissions to create project
 *          500:
 *              description: unknown server error
 */

router.get("/:projectId", optionalAuthMiddleware, ProjectsController.getOne);

/**
 * @swagger
 * /projects:
 *  post:
 *      security:
 *         - bearerAuth: []
 *      summary: Receives details about a project and creates a new project to the database
 *      tags: [Projects]
 *      requestBody:
 *          description: Project Properties
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/UserDefinedProject'
 *      responses:
 *          200:
 *              description: Project creation successful
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/CompleteSystemProject'
 *          400:
 *              description: Bad request, possibly because of invalid project information
 *          403:
 *              description: forbidden, not logged in or does not have permissions to create project
 *          500:
 *              description: unknown server error
 */
router.post("/", authMiddleware, ProjectsController.createOne);

/**
 * @swagger
 * /projects/attachments/{projectId}:
 *  post:
 *      security:
 *         - bearerAuth: []
 *      summary: Receives some changes about project and updates the project
 *      tags: [Projects]
 *      requestBody:
 *          description: Project Properties
 *          required: true
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      $ref: '#/components/schemas/ProjectAttachments'
 *      parameters:
 *        - in: path
 *          name: projectId
 *          description: The ID of the project to update
 *          schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Project update successful
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ProjectAttachments'
 *          400:
 *              description: Bad request, possibly because of invalid project information
 *          403:
 *              description: forbidden, not logged in or does not have permissions to create project
 *          500:
 *              description: unknown server error
 */
router.post(
    "/attachments/:projectId",
    authMiddleware,
    ProjectsController.createProjectAttachments
);

/**
 * @swagger
 * /projects/{projectId}:
 *  patch:
 *      security:
 *         - bearerAuth: []
 *      summary: Receives some changes about project and updates the project
 *      tags: [Projects]
 *      requestBody:
 *          description: Project Properties
 *          required: true
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      $ref: '#/components/schemas/UserDefinedProjectUpdate'
 *                  encoding:
 *                      secondary_languages[]:
 *                          style: form
 *                          explode: true
 *                      keywords[]:
 *                          style: form
 *                          explode: true
 *                      tags[]:
 *                          style: form
 *                          explode: true
 *      parameters:
 *        - in: path
 *          name: projectId
 *          description: The ID of the project to update
 *          schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Project update successful
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/CompleteSystemProject'
 *          400:
 *              description: Bad request, possibly because of invalid project information
 *          403:
 *              description: forbidden, not logged in or does not have permissions to create project
 *          500:
 *              description: unknown server error
 */
router.patch("/:projectId", authMiddleware, ProjectsController.updateOne);

/**
 * @swagger
 * /projects/likes/{projectId}:
 *  post:
 *      security:
 *         - bearerAuth: []
 *      summary: Adds a like to the project with the given id by the logged in user
 *      tags: [Projects]
 *      parameters:
 *        - in: path
 *          name: projectId
 *          description: The ID of the project to add a like to
 *          schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Like added successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/NoOfLikes'
 *          400:
 *              description: Bad request, possibly because of invalid project information
 *          403:
 *              description: forbidden, not logged in or does not have permissions to create project
 *          500:
 *              description: unknown server error
 */
router.post("/likes/:projectId", authMiddleware, ProjectsController.addLike);

/**
 * @swagger
 * /projects/likes/{projectId}:
 *  delete:
 *      security:
 *         - bearerAuth: []
 *      summary: Removes the logged in user's like from the project with the given Id
 *      tags: [Projects]
 *      parameters:
 *        - in: path
 *          name: projectId
 *          description: The Id of the project to remove the like from
 *          schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Like removed successfully successful
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/NoOfLikes'
 *          400:
 *              description: Bad request, possibly because of invalid project information
 *          403:
 *              description: forbidden, not logged in or does not have permissions to create project
 *          500:
 *              description: unknown server error
 */
router.delete(
    "/likes/:projectId",
    authMiddleware,
    ProjectsController.removeLike
);

/**
 * @swagger
 * /projects/{projectId}:
 *  delete:
 *      security:
 *         - bearerAuth: []
 *      summary: Deletes the project with the given Id
 *      tags: [Projects]
 *      parameters:
 *        - in: path
 *          name: projectId
 *          description: The ID of the project to delete
 *          schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Project deletion successful
 *          400:
 *              description: Bad request, possibly because of invalid project information
 *          403:
 *              description: forbidden, not logged in or does not have permissions to create project
 *          500:
 *              description: unknown server error
 */
router.delete("/:projectId", authMiddleware, ProjectsController.deleteOne);

module.exports = router;
