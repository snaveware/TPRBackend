/**
 *  Inputs - modules that are imported by the Auth services
 * jsonwebtoken
 * joi
 * bcryptjs
 * Account -local Accounts Model
 * 
*/

/**
 * Outputs - modules and functions exported by the Auth service
*/

const Login = require('./Login')
const Register  = require('./Register')


module.exports = {Login,Register}
