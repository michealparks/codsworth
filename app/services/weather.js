import weather from 'yahoo-weather'
import localforage from 'localforage'
import { on, emit } from './mediator'

let user
localforage.get('Weather.user').then(data => user = data)
on('Weather.user.update', data => {
  user = data
  getWeather(true).then(data =>
    emit('Weather.data.update', data)
  )
})

export default function getWeather (update = false) {
  return localforage.get('Weather.data').then(data => {
    const time = Date.now()
    const halfHour = 1000 * 60 * 30

    if (!update && data && Date.now() - data.time < halfHour) return data

    return weather({ q: user.location })
      .then(response => {
        const newData = {
          temp: response.item.condition.temp,
          forecast: response.item.forecast,
          time
        }

        localforage.set('Weather.data', newData)
        return newData
      })
  })
}
