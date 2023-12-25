import axios from 'axios'
import cheerio from 'cheerio'
import { JSDOM } from 'jsdom'
import { generateEncryptAjaxParameters, decryptEncryptAjaxResponse } from '../extractors/asianload.js'

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36'

let PROXY_URL
export async function corsProxy(url) {
    PROXY_URL = `${url}/proxy?url=`
}
const BASE_URL = 'https://draplay.info'

export async function getRecentDrama() {
    const url = `${PROXY_URL}${BASE_URL}`
    

    return fetch(url)
        .then(response => {
            return response.text()
        })
        .then(html => {
            const dom = new JSDOM(html)
            const doc = dom.window.document

            const items = doc.querySelectorAll('ul.listing.items > li.video-block > a')
            const results = []

            items.forEach(item => {
                results.push({
                    episodeId: `${item.toString().split('videos/')[1]}`,
                    episodeNum: parseFloat(`${item.toString().match(/episode-(.*)/i)?.[1].split('-').join('.')}`),
                    title: `${item.querySelector('div.name').textContent.trim()}`,
                    img: `${item.querySelector('img').src}`,
                    url: `${BASE_URL}${item}`,
                })
            })
            
            const json = {
                results: results
            }

            return json
        })
        .catch(error => {
            throw error
        })
}

export async function getPopularDrama() {
    const url = `${BASE_URL}/popular`

    return fetch(url)
        .then(response => {
            return response.text()
        })
        .then(html => {
            const dom = new JSDOM(html)
            const doc = dom.window.document

            const items = doc.querySelectorAll('ul.listing.items > li.video-block > a')
            const results = []

            items.forEach(item => {
                results.push({
                    episodeId: `${item.toString().split('videos/')[1]}`,
                    episodeNum: parseFloat(`${item.toString().match(/episode-(.*)/i)?.[1].split('-').join('.')}`),
                    title: `${item.querySelector('div.name').textContent.trim()}`,
                    img: `${item.querySelector('img').src}`,
                    url: `${BASE_URL}${item}`,
                })
            })
            
            const json = {
                results: results
            }

            return json
        })
        .catch(error => {
            throw error
        })
}

export async function getVideoDrama(epId) {
    const url = `${PROXY_URL}${BASE_URL}/videos/${epId}`
    const videoSrc = await scrapeM3U8(epId)
    
    return fetch(url)
        .then(response => {
            return response.text()
        })
        .then(html => {
            const dom = new JSDOM(html)
            const doc = dom.window.document

            const items = doc.querySelectorAll('ul.listing.items.lists > li.video-block > a')
            const title = doc.querySelector('div.video-info-left > h1').textContent
            const desc = doc.querySelector('#rmjs-1').textContent.trim()
            const iframe = doc.querySelector('div.watch_play > div.play-video > iframe').src
            const episodes = []

            items.forEach(item => {
                episodes.push({
                    episodeId: `${item.toString().split('videos/')[1]}`,
                    episodeNum: parseFloat(`${item.toString().match(/episode-(.*)/i)?.[1].split('-').join('.')}`),
                    url: `${BASE_URL}${item}`,
                })
            })
            
            const json = {
                title: title,
                desc: desc,
                videoSrc,
                episodes: episodes.reverse()
            }

            return json
        })
        .catch(error => {
            throw error
        })
}

export async function scrapeM3U8(episodeId) {
  let primarySources = []
  let backupSources = []

  try {
    let episodePage, videoServer, $, serverUrl

    if (episodeId) {
      episodePage = await axios.get(`${PROXY_URL}${BASE_URL}/videos/${episodeId}`)
      $ = cheerio.load(episodePage.data)

      videoServer = $('div.watch_play > div.play-video > iframe').attr('src')
      serverUrl = new URL(`https:${videoServer}`)
    } else {
      throw Error('Episode ID not found')
    }

    const goGoServerPage = await axios.get(serverUrl.href, {
      headers: { 'User-Agent': USER_AGENT },
    })
    const $$ = cheerio.load(goGoServerPage.data)

    const ajaxParameters = await generateEncryptAjaxParameters(
      $$,
      serverUrl.searchParams.get('id')
    )

    const fetchResponse = await axios.get(
      `${serverUrl.protocol}//${serverUrl.hostname}/encrypt-ajax.php?${ajaxParameters}`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          'X-Requested-With': 'XMLHttpRequest',
        },
      }
    )

    const decryptedResponse = decryptEncryptAjaxResponse(fetchResponse.data)

    if (!decryptedResponse.source) {
      return { error: 'No sources found. Try a different source.' }
    }

    decryptedResponse.source.forEach((source) => primarySources.push(source))
    decryptedResponse.source_bk.forEach((source) => backupSources.push(source))

    return {
      referer: serverUrl.href,
      primarySrc: primarySources,
      backupSrc: backupSources,
    }
  } catch (error) {
    return { error: error.message }
  }
}

export async function searchDrama(query) {
    return fetch(`${PROXY_URL}${BASE_URL}/search.html?keyword=${query}`)
        .then(response => {
            return response.text()
        })
        .then(html => {
            const dom = new JSDOM(html)
            const doc = dom.window.document
            
            const items = doc.querySelectorAll('ul.listing.items > li.video-block > a')
            const results = []

            items.forEach(item => {
                results.push({
                    episodeId: `${item.toString().split('videos/')[1]}`,
                    episodeNum: parseFloat(`${item.toString().match(/episode-(.*)/i)?.[1].split('-').join('.')}`),
                    title: `${item.querySelector('div.name').textContent.trim()}`,
                    img: `${item.querySelector('img').src}`,
                    url: `${BASE_URL}${item}`,
                })
            })
            
            const json = {
                results: results
            }

            return json
        })
        .catch(error => {
            throw error
        })
}