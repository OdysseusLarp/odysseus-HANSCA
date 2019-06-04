import axios from 'axios'

// FIXME: Retrieve URI settings from somewhere...?
const backend = {
    uri: 'http://localhost:8888/',
    username: undefined,
    password: undefined,
}

axios.defaults.baseURL = backend.uri;
if (backend.username) {
  axios.withCredentials = true;
  axios.defaults.auth = {
    username: backend.username,
    password: backend.password,
  };
}
