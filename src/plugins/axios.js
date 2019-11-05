import Axios from 'axios'

const http = Axios.create({
  baseURL: 'http://192.168.0.71:8500'
})

export default http