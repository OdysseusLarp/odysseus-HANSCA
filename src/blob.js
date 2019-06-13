import axios from 'axios'

export async function getBlob(type, id) {
  const response = await axios.get(`${type}/${id}`)
  return response.data
}

export async function patchBlob(type, id, values) {
  const response = await axios.patch(`${type}/${id}?force=true`, values)
  return response.data
}
