// Mock Secret Manager using Firestore (works with Firebase emulators)
// In production, this would use @google-cloud/secret-manager
import admin from 'firebase-admin'

// Lazy initialization to ensure Firebase Admin is initialized first
const getDb = () => admin.firestore()

/**
 * Get a secret from Firestore (mimicking Secret Manager behavior)
 * @param {Object} params
 * @param {string} params.secretId - The secret identifier
 * @returns {Promise<string>} The secret value
 */
const getSecret = async ({ secretId }) => {
  try {
    const db = getDb()
    const secretDoc = await db.collection('secrets').doc(secretId).get()

    if (!secretDoc.exists) {
      const error = new Error(`Secret ${secretId} not found`)
      error.code = 5 // NOT_FOUND error code (mimicking Secret Manager)
      throw error
    }

    return secretDoc.data().value
  } catch (error) {
    console.error('Error getting secret:', error)
    throw error
  }
}

/**
 * Create or update a secret in Firestore (mimicking Secret Manager behavior)
 * @param {Object} params
 * @param {string} params.secretId - The secret identifier
 * @param {string} params.secretValue - The secret value to store
 */
const createSecret = async ({ secretId, secretValue }) => {
  try {
    const db = getDb()
    await db.collection('secrets').doc(secretId).set({
      value: secretValue,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    console.log(`Secret ${secretId} stored successfully`)
  } catch (error) {
    console.error('Error creating secret:', error)
    throw error
  }
}

/**
 * List all secrets (for scheduled sync function)
 * @param {Object} params
 * @param {string} params.filter - Filter string (e.g., 'name:access_tokens')
 * @returns {Promise<Array>} Array of secret documents
 */
const listSecrets = async ({ filter }) => {
  try {
    const db = getDb()
    // Extract the filter term (e.g., 'access_tokens' from 'name:access_tokens')
    const filterTerm = filter.split(':')[1] || ''

    const secretsSnapshot = await db.collection('secrets').get()
    const secrets = []

    secretsSnapshot.forEach(doc => {
      if (!filterTerm || doc.id.includes(filterTerm)) {
        secrets.push({
          name: doc.id,
          data: doc.data()
        })
      }
    })

    return secrets
  } catch (error) {
    console.error('Error listing secrets:', error)
    throw error
  }
}

export { getSecret, createSecret, listSecrets }

