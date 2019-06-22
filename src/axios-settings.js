import axios from 'axios'

const backend = {
  uri: process.env.VUE_APP_BACKEND_URL,
  username: process.env.VUE_APP_BACKEND_USER,
  password: process.env.VUE_APP_BACKEND_PASS,
}

axios.defaults.baseURL = backend.uri;
if (backend.username) {
  axios.withCredentials = true;
  axios.defaults.auth = {
    username: backend.username,
    password: backend.password,
  };
}
