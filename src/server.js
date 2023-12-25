import express from 'express'
import axios from 'axios'
import { getRecentAnime, getPopularAnime, getVideoAnime, searchAnime } from './providers/vidstreaming.js'
import { getRecentDrama, getPopularDrama, getVideoDrama, corsProxy, searchDrama } from './providers/asianload.js'

const app = express()

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.get('/', (req, res) => {
	res.end(`Welcome!`)
})

app.get('/proxy', async (req, res) => {
  const targetUrl = decodeURIComponent(req.query.url)

  axios.get(targetUrl)
    .then(response => {
      res.send(response.data)
    })
    .catch(error => {
      console.error(error)
      res.status(500).json({ error: 'Internal Server Error' })
    })
})


app.get('/vidstreaming/recent', async (req, res) => {
  getRecentAnime()
    .then(result => {
      res.json(result)
    })
    .catch(error => {
      console.error('Error fetching recent anime:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    })
})

app.get('/vidstreaming/popular', async (req, res) => {
  getPopularAnime()
    .then(result => {
      res.json(result)
    })
    .catch(error => {
      console.error('Error fetching recent anime:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    })
})

app.get('/vidstreaming/search/:query', async (req, res) => {
  const query = req.params.query
  
  searchAnime(query)
    .then(result => {
      res.json(result)
    })
    .catch(error => {
      console.error('Error fetching recent anime:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    })
})

app.get('/vidstreaming/watch/:episodeId', async (req, res) => {
  const epId = req.params.episodeId
  
  getVideoAnime(epId)
    .then(result => {
      res.json(result)
    })
    .catch(error => {
      console.error('Error fetching recent anime:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    })
})

app.get('/asianload/recent', async (req, res) => {
  corsProxy(`${req.protocol}://${req.get('host')}`)
  getRecentDrama()
    .then(result => {
      res.json(result)
    })
    .catch(error => {
      console.error('Error fetching recent anime:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    })
})

app.get('/asianload/popular', async (req, res) => {
  getPopularDrama()
    .then(result => {
      res.json(result)
    })
    .catch(error => {
      console.error('Error fetching recent anime:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    })
})

app.get('/asianload/search/:query', async (req, res) => {
  const query = req.params.query
  
  corsProxy(`${req.protocol}://${req.get('host')}`)
  searchDrama(query)
    .then(result => {
      res.json(result)
    })
    .catch(error => {
      console.error('Error fetching recent anime:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    })
})

app.get('/asianload/watch/:episodeId', async (req, res) => {
  corsProxy(`${req.protocol}://${req.get('host')}`)
  const epId = req.params.episodeId
  
  getVideoDrama(epId)
    .then(result => {
      res.json(result)
    })
    .catch(error => {
      console.error('Error fetching recent anime:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    })
})

export default app