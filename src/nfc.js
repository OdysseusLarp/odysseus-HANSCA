
let currentHandler = undefined
let watchAdded = false

export function startWatch(handler) {
  if (!watchAdded) {
    if ('nfc' in navigator) {
      navigator.nfc.watch(nfcHandler, {mode: 'any'})
    }
    watchAdded = true
  }
  currentHandler = handler;
}
export function cancelWatch() {
  currentHandler = undefined
}

export function hasNfc() {
  return 'nfc' in navigator;
}

function nfcHandler(message) {
  const record = message.records.find(record => record.recordType === 'text')
  if (record && currentHandler) {
    currentHandler(record.data)
  }
}

// Allow debugging from console
window.nfcDebugMessage = function (msg) {
  currentHandler(msg);
}
