import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const jwksUrl = 'https://dev-7q8si0se.auth0.com/.well-known/jwks.json'
let signingKeys = null

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)

  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  if (jwt.header.alg !== 'RS256') {
    throw new Error('Unsupported signing algorithm')
  }
  const signKey = await getSigningKey(jwt.header.kid)
  const options = {
    algorithms: ['RS256']
  }

  return verify(token, signKey.publicKey, options) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

async function getJwks() {
  const response = await axios.get(jwksUrl);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.data || response.statusText || `Http Error ${response.status}`)
  }
  const jwks = response.data.keys
  return jwks
}

async function getSigningKeys(keys) {
  if (!keys || !keys.length) {
    throw new Error('The JWKS endpoint did not contain any keys')
  }
  const signingKeys = keys
    .filter(key => key.use === 'sig'
      && key.kty === 'RSA'
      && key.kid
      && ((key.x5c && key.x5c.length) || (key.n && key.e))
    ).map(key => {
      return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) }
    });

  // If at least one signing key doesn't exist we have a problem... Kaboom.
  if (!signingKeys.length) {
    throw new Error('The JWKS endpoint did not contain any signing keys')
  }

  // Returns all of the available signing keys.
  return signingKeys
}

function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n')
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
  return cert
}

async function getSigningKey(kid) {
  if (!signingKeys) {
    const jkws = await getJwks();
    const keys = await getSigningKeys(jkws);
    signingKeys = keys;
  }
  const signKey = signingKeys.find(key => key.kid === kid)
  if (!signKey) {
    throw new Error(`Unable to find a signing key that matches '${kid}'`)
  }
  return signKey
}