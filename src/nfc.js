export function startWatch(handler) {
  if ('nfc' in navigator) {
    navigator.nfc.watch((message) => {
      handler(message)
    }, {mode: 'any'})
  }
}
export function cancelWatch( ) {
  if(navigator.nfc) navigator.nfc.cancelWatch()
}
