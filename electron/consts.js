
module.exports = Object.freeze({
  APP_VERSION: require(require('path').resolve('./package.json')).version,
  HOME_PAGE_URL: 'https://galeri.io',
  AUTO_UPDATE_URL: 'https://galeri.io/update',
  CRASH_REPORT_URL: 'https://galeri.io/crash-report',
  TELEMETRY_URL: 'https://galeri.io/telemetry',

  GITHUB_URL: 'https://github.com/michealparks/galeri-www',
  GITHUB_URL_ISSUES: 'https://github.com/michealparks/galeri-www/issues',
  GITHUB_URL_RAW: 'https://raw.githubusercontent.com/michealparks/galeri-www/master',
  GITHUB_RELEASE_API: 'https://api.github.com/repos/michealparks/galeri-www/releases/latest',

  CHECK_UPDATE_INTERVAL: 1000 * 60 * 60 * 24
})
