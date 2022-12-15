const router = require("express").Router();

const { AuthController } = require("../controllers");

/**
 * @swagger
 * components:
 *  securitySchemes:
 *      bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *  schemas:
 *      NormalAccount:
 *          type: object
 *          required:
 *              -firstName
 *              -lastName
 *              -phoneNumber
 *              -password
 *              -passwordConfirmation
 *              -biography
 *          properties:
 *              _id:
 *                  type: string
 *                  description: auto-generated id of a user account
 *              firstName:
 *                  type: string
 *                  description: less than 50 characters of user first name
 *              lastName:
 *                  type: string
 *                  description: less than 50 characters of user last Name
 *              phoneNumber:
 *                  type: string
 *                  description: 12 characters of a phone number including 254
 *              password:
 *                  type: string
 *                  description: a password including atleast 8 characters
 *              passwordConfirmation:
 *                  type: string
 *                  description: should be exactly the same as paswword for confirmation purpose
 *              biography:
 *                  type: string
 *                  description: a description of the person
 *          example:
 *              firstName: John
 *              lastName: doe
 *              phoneNumber: '254712345678'
 *              email: work.evans020@gmail.com
 *              password: '12345678'
 *              passwordConfirmation: '12345678'
 *              biography: I'm an IT student and TUK
 *      Login:
 *          type: object
 *          required:
 *              -phoneNumber
 *              -password
 *          properties:
 *              phoneNumber:
 *                  type: string
 *                  description: 12 characters of a phone number including 254
 *              password:
 *                  type: string
 *                  description: a password including atleast 8 characters
 *          example:
 *              phoneNumber: '254712345678'
 *              password: '12345678'
 */

/**
 * @swagger
 * tags:
 *  name: Auth
 *  description: All routes that deal with user authentication and authorizations
 */

/**
 * @swagger
 * /auth/login:
 *  post:
 *      summary: receives credentials and returns accesstoken and refresh token
 *      tags: [Auth]
 *      requestBody:
 *          description: Required properties in a Login body
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Login'
 *      responses:
 *          200:
 *              description: Login suceeded, accesstoken and refreshtoken are returned
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              tokens:
 *                                  type: object
 *                                  properties:
 *                                      accessToken:
 *                                          type: string
 *                                      refreshToken:
 *                                          type: string
 *                              userAccount:
 *                                  type: object
 *                                  properties:
 *                                      _id:
 *                                          type:string
 *                                      firstName:
 *                                          type: string
 *                                      lastName:
 *                                          type: string
 *                                      phoneNumber:
 *                                          type: string
 *                                      email:
 *                                          type: string
 *                                      role:
 *                                          type: string
 *                                      status:
 *                                          type: string
 *                                      lastLogin:
 *                                          type: string
 *                                      createdAt:
 *                                          type: string
 *                                      updatedAt:
 *                                          type: string
 *                                      profileImageURL:
 *                                          type: string
 *                          example:
 *                              tokens: {accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c,  refreshToken: xyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5j}
 *                              userAccount: {firstName: John, lastName: doe, phoneNumber: '254712345678', email: work.evans020@gmail.com, password: '12345678', passwordConfirmation: '12345678', biography: I'm an IT student and TUK, role: "admin", status: "active", lastLogin: "2022-12-08T14:17:02.856Z",createdAt: "2022-12-08T14:17:02.856Z",updatedAt: "2022-12-08T14:17:02.856Z", profileImageURL: "Profile_6391f1de304dc92f34902709.jpg"}
 *          400:
 *              description: Bad request, possibly because of invalid credentials sent to server
 *          403:
 *              description: forbidden. inactive account
 *          404:
 *              description: account not found
 *          500:
 *              description: Server error
 */
router.post("/login", AuthController.login);

/**
 * @swagger
 * /auth/register:
 *  post:
 *      summary: Receives new user details and returns created user with _id
 *      tags: [Auth]
 *      requestBody:
 *          description: Required properties in a Login body
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/NormalAccount'
 *      responses:
 *          200:
 *              description: User account created successfully, the created user with an _id field is returned
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/NormalAccount'
 *          400:
 *              description: Bad request, possibly because of invalid data sent to server
 *          500:
 *              description: Server error
 */
router.post("/register", AuthController.register);

/**
 * @swagger
 * /auth/refreshtoken:
 *  post:
 *      summary: receives credentials and returns accesstoken and refresh token
 *      tags: [Auth]
 *      requestBody:
 *          description: Required properties the body when Registering a normal user
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          -refreshToken
 *
 *                      properties:
 *                          refreshToken:
 *                              type: string
 *                      example:
 *                          refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *      responses:
 *          200:
 *              description: Login suceeded, accesstoken and refreshtoken are returned
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              newAccessToken:
 *                                  type: string
 *                              refreshToken:
 *                                  type: string
 *                          example:
 *                              accessToken: xyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5j
 *                              refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *          400:
 *              description: Bad request, possibly because of invalid credentials sent to server
 *          500:
 *              description: Server error
 */
router.post("/refreshtoken", AuthController.refreshToken);

/**
 * @swagger
 * /auth/sendphonecode:
 *  post:
 *      summary: receives a phone number and sends a phone verification if the user is registered
 *      tags: [Auth]
 *      requestBody:
 *          description: Required properties the body when verifying a phone number
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          -phoneNumber
 *                      properties:
 *                          phoneNumber:
 *                              type: string
 *                      example:
 *                          phoneNumber: '254712345678'
 *      responses:
 *          200:
 *              description: A 6 digit phone verification has been sent to the phone number if a user is registered with the phone number
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              verificationToken:
 *                                  type: string
 *                                  description: a token used to determine the user account and verify the code
 *                              expiresAt:
 *                                  type: string
 *                                  description: how long 6-digit the verification code is valid
 *                          example:
 *                              verificationToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *                              expiresAt: The time when the verification code expires
 *          400:
 *              description: Bad request, possibly because of invalid phone number sent to server
 *          500:
 *              description: Server error
 */
router.post("/sendphonecode", AuthController.sendPhoneCode);

/**
 * @swagger
 * /auth/recoverpassword:
 *  post:
 *      summary: receives new password, verification code and token to reset the password
 *      tags: [Auth]
 *      requestBody:
 *          description: Required properties the body when recovering password
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          -newPassword
 *                          -verificationCode
 *                          -verificationToken
 *
 *                      properties:
 *                          newPassword:
 *                              type: string
 *                          verificationCode:
 *                              type: number
 *                          verificationToken:
 *                              type: string
 *                      example:
 *                          newPassword: password123
 *                          verificationCode: 564556
 *                          verificationToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MTg2YzA4NzUwZWQyN2UwMGE3NWVhYTIiLCJpc1JlZnJlc2giOnRydWUsImlhdCI6MTYzNjI5NjY2NCwiZXhwIjoxNjM2MzAwMjY0fQ.s8jJZJio7fq9C0cyT0FjAMgR6ccblSkZBSkmW0HLjeA'
 *      responses:
 *          200:
 *              description: Password Changed successflly
 *
 *          400:
 *              description: Bad request, possibly because of invalid code sent to server
 *          500:
 *              description: Server error
 */
router.post("/recoverPassword", AuthController.recoverPassword);

module.exports = router;
