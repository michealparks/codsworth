// import { OAuth2Strategy } from 'passport-google-oauth'
// import passport from 'passport'
// import gcal from 'google-calendar'

// console.log(1)

// passport.use(new OAuth2Strategy({
//   clientID: '959997348690-d01gitd8r6ou9he3e85aug2358nrof5v.apps.googleusercontent.com',
//   // clientSecret: '',
//   // callbackURL: '',
//   scope: []
// }, (accessToken, refreshToken, profile, done) => {
//   let googeCalendar = new gcal.GoogleCalendar(accessToken)

//   console.log(googeCalendar)

//   return done(null, profile)
// }))

// console.log(1)
// console.log(gapi && gapi.client)

// window.OnGoogleAPIsLoadCallback = () => {
//   console.log(2)
// }

window.onSignIn = data => console.log(data)

define('lightbox', () => {
  let exports = {}

  const $lightbox = $(
    `<div class="lightbox">
      <div class="lightbox__background"></div>
      <div class="lightbox__btn-close"></div>
      <div class="lightbox__modal"></div>
    </div>`
  )
  const $doc = $(document)
  const $modal = $lightbox.find('.lightbox__modal')

  $doc.ready(() => $doc.body.append($lightbox))

  exports.addBody = innerHtml => {

  }

  return exports
})

export function getPixelFreq (imgData, val) {
  var arr = []
  for (var i = 0, ll = imgData.length; i < l; i++) {
    for (var ii = 0, ll = imgData[i].length; ii < ll; ii++) {
      const val = imgData[i][ii]
      arr[imgData[i][ii]] = 
    }
  }
}