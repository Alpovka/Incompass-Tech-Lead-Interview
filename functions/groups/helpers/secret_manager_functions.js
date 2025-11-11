import { SecretManagerServiceClient } from '@google-cloud/secret-manager'
import { MAIN_REGION } from '../../consts/constants.js'

const client = new SecretManagerServiceClient()

const getSecret = async ({ secretId }) => {
  const secretName = `projects/${process.env.GCLOUD_PROJECT}/secrets/${secretId}/versions/latest`

  const [secret] = await client.accessSecretVersion({
    name: secretName
  })

  return secret.payload.data.toString()
}

const createSecret = async ({ secretId, secretValue }) => {
  const [secret] = await client.createSecret({
    parent: `projects/${process.env.GCLOUD_PROJECT}`,
    secretId: secretId,
    secret: {
      replication: {
        userManaged: {
          replicas: [
            {
              location: MAIN_REGION
            }
          ]
        }
      }
    }
  })

  // Add a new version (this automatically becomes the latest)
  await client.addSecretVersion({
    parent: secret.name,
    payload: {
      data: Buffer.from(secretValue, 'utf8')
    }
  })
}

export { getSecret, createSecret }

