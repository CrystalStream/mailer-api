import * as jwt from 'jsonwebtoken'
import { Brackets } from 'typeorm'
import { logger } from '../../config/logger'
import { User } from '../data/user/user.entity'

/**
 * Returns a user from an auth bearer token.
 * https://www.thepolyglotdeveloper.com/2018/07/protect-graphql-properties-jwt-nodejs-application/
 * @function
 * @param {String} bearerToken - The authorization bearer token in the format "Bearer <token>".
 */
const getUserFromAuthHeader = async (bearerToken: string) => {
  const bearerTokenArray = bearerToken.split(' ')
  if (bearerTokenArray.length !== 2 || bearerTokenArray[0].toLowerCase() !== 'bearer') {
    logger.debug('getUserFromAuthHeader() - Authorization bearer token was not formatted properly or did not exist.')
    return {}
  }

  return await jwt.verify(bearerTokenArray[1], process.env.SECRET_KEY, async (err, decodedToken) => {
    if (err) {
      logger.error('getUserFromAuthHeader() jwt.verify()')
      logger.error(err)
      return {}
    }

    return await User.createQueryBuilder('user')
    .select('user.id') // only select necessary fields
    .where('user.id = :id', { id: decodedToken.id })
    .andWhere(new Brackets((qb) => {
      // Prevent user auth if lastPasswordReset is after the jwt's iat value.
      // This allows password resets to happen without keeping track of JWTs,
      // which is the whole point of JWTs.
      qb.where('user.lastPasswordReset < :iat', { iat: new Date(decodedToken.iat * 1000) })
      .orWhere('user.lastPasswordReset IS NULL')
    }))
    .getOne()
    .then((user) => {
      if (!user) { return {} }
      return user
    })
    .catch((error) => {
      logger.error('getUserFromAuthHeader() User.createQueryBuilder()')
      logger.error(error)
      return {}
    })
  })
}

export default getUserFromAuthHeader
