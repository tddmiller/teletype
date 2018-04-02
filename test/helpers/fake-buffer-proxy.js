const assert = require('assert')
const {Point} = require('atom')

module.exports =
class FakeBufferProxy {
  constructor (delegate, text) {
    this.delegate = delegate
    this.text = text
    this.disposed = false
    this.uri = 'TEST Not Changed'
    this.saveRequestCount = 0
  }

  setDelegate () {}

  dispose () {
    this.disposed = true
  }

  getHistory () {
    return {undoStack: [], redoStack: [], nextCheckpointId: 1}
  }

  setTextInRange (oldStart, oldEnd, newText) {
    const oldStartIndex = characterIndexForPosition(this.text, oldStart)
    const oldEndIndex = characterIndexForPosition(this.text, oldEnd)
    this.text = this.text.slice(0, oldStartIndex) + newText + this.text.slice(oldEndIndex)
  }

  simulateRemoteTextUpdate (changes) {
    assert(changes.length > 0, 'Must update text with at least one change')

    for (let i = changes.length - 1; i >= 0; i--) {
      const {oldStart, oldEnd, newText} = changes[i]
      this.setTextInRange(oldStart, oldEnd, newText)
    }

    this.delegate.updateText(changes)
  }

  createCheckpoint () {
    return 1
  }

  groupChangesSinceCheckpoint () {
    return []
  }

  groupLastChanges () {
    return true
  }

  requestSave () {
    this.saveRequestCount++
  }

  setURI (newUri) {
    this.uri = newUri
  }

  applyGroupingInterval () {

  }
}

function characterIndexForPosition (text, target) {
  target = Point.fromObject(target)
  const position = Point(0, 0)
  let index = 0
  while (position.compare(target) < 0 && index < text.length) {
    if (text[index] === '\n') {
      position.row++
      position.column = 0
    } else {
      position.column++
    }

    index++
  }

  return index
}
