export function startWatch(handler) {
  if ('nfc' in navigator) {
    navigator.nfc.watch((message) => {
      const record = message.records.find(record => record.recordType === 'text')
      if (record) {
        handler(record.data)
      }
    }, {mode: 'any'})
  }
}
export function cancelWatch( ) {
  if(navigator.nfc) navigator.nfc.cancelWatch()
}

export function hasNfc() {
  return 'nfc' in navigator;
}

export function keyboardInputToTag(prefix, input) {
  return {
    records: [{
      recordType: 'text',
      data: `${prefix}${prefix ? ':' : ''}${input}`,
    }],
  };
}
