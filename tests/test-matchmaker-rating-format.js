const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8')
}

function expect(content, fragment, label) {
  if (!content.includes(fragment)) {
    throw new Error(`${label}: missing ${fragment}`)
  }
  console.log(`PASS ${label}`)
}

console.log('Matchmaker rating formatting checks')

const card = read('components/MatchmakerCard.uvue')
expect(card, "rating.toFixed(1)", 'card keeps one decimal place')

const ranking = read('components/MatchmakerRank.uvue')
expect(ranking, 'formatRating(item.rating)', 'ranking uses rating formatter')
expect(ranking, "rating.toFixed(1)", 'ranking keeps one decimal place')

const detail = read('pages/matchmaker/detail.uvue')
expect(detail, '{{ ratingText }}', 'detail uses formatted rating text')
expect(detail, "rating.toFixed(1)", 'detail keeps one decimal place')

console.log('Matchmaker rating formatting checks passed')
