import admin from 'firebase-admin'

const db = admin.firestore()

/**
 * Get a document from Firestore
 */
export const getDocument = async ({ collection, docId }) => {
  try {
    const doc = await db.collection(collection).doc(docId).get()
    if (!doc.exists) {
      return null
    }
    return { id: doc.id, ...doc.data() }
  } catch (error) {
    console.error('Error getting document:', error)
    throw error
  }
}

/**
 * Get all documents from a collection
 */
export const getCollection = async ({ collection, orderByField = null }) => {
  try {
    let query = db.collection(collection)
    
    if (orderByField) {
      query = query.orderBy(orderByField)
    }
    
    const snapshot = await query.get()
    const documents = []
    
    snapshot.forEach(doc => {
      documents.push({ id: doc.id, ...doc.data() })
    })
    
    return documents
  } catch (error) {
    console.error('Error getting collection:', error)
    throw error
  }
}

/**
 * Create a document in Firestore
 */
export const createDocument = async ({ collection, data, docId = null }) => {
  try {
    const timestamp = admin.firestore.FieldValue.serverTimestamp()
    const documentData = {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp
    }
    
    if (docId) {
      await db.collection(collection).doc(docId).set(documentData)
      return { id: docId, ...documentData }
    } else {
      const docRef = await db.collection(collection).add(documentData)
      return { id: docRef.id, ...documentData }
    }
  } catch (error) {
    console.error('Error creating document:', error)
    throw error
  }
}

/**
 * Update a document in Firestore
 */
export const updateDocument = async ({ collection, docId, data }) => {
  try {
    const updates = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
    
    await db.collection(collection).doc(docId).update(updates)
    return { id: docId, ...updates }
  } catch (error) {
    console.error('Error updating document:', error)
    throw error
  }
}

/**
 * Delete a document from Firestore
 */
export const deleteDocument = async ({ collection, docId }) => {
  try {
    await db.collection(collection).doc(docId).delete()
    return true
  } catch (error) {
    console.error('Error deleting document:', error)
    throw error
  }
}

/**
 * Batch create documents
 */
export const batchCreateDocuments = async ({ collection, documents }) => {
  try {
    const batch = db.batch()
    const timestamp = admin.firestore.FieldValue.serverTimestamp()
    const refs = []
    
    documents.forEach(doc => {
      const ref = db.collection(collection).doc()
      batch.set(ref, {
        ...doc,
        createdAt: timestamp,
        updatedAt: timestamp
      })
      refs.push(ref)
    })
    
    await batch.commit()
    return refs.map((ref, index) => ({ id: ref.id, ...documents[index] }))
  } catch (error) {
    console.error('Error batch creating documents:', error)
    throw error
  }
}

