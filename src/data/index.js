// API client base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const makeRequest = async ({ endpoint, data = {} }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error in ${endpoint}:`, error)
    throw error
  }
}

export default makeRequest

