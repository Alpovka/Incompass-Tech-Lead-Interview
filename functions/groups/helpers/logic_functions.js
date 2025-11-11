// Utility functions for data manipulation

/**
 * Creates a map from a list of objects using a specified field as the key
 * @param {Object} params
 * @param {Array} params.givenList - The list to convert to a map
 * @param {string} params.field - The field to use as the key
 * @returns {Object} Map of items by the specified field
 */
export const createMapFromList = ({ givenList, field }) => {
  return givenList.reduce((acc, item) => {
    acc[item[field]] = item
    return acc
  }, {})
}

