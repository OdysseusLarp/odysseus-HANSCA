let currentHandler = undefined;
let watchAdded = false;

async function initializeNfcReader() {
  // eslint-disable-next-line no-undef
  const ndef = new NDEFReader();
  await ndef.scan();
  console.log("NFC Reader initialized!");

  ndef.addEventListener("readingerror", () => {
    console.log("NFC Tag could not be read");
  });

  ndef.addEventListener("reading", nfcHandler);
  watchAdded = true;
}

export async function startWatch(handler) {
  try {
    if (!watchAdded && hasNfc()) {
      await initializeNfcReader();
    }
    currentHandler = handler;
  } catch (error) {
    console.log("NFC Error: " + error);
  }
}

export function cancelWatch() {
  currentHandler = undefined;
}

export function hasNfc() {
  return "NDEFReader" in window;
}

function nfcHandler({ message, serialNumber }) {
  if (message.records.length !== 1) {
    console.log("Unexpected number of records in NFC message, ignoring");
    return;
  }

  const record = message.records[0];
  if (record.recordType !== "text") {
    console.log("Unexpected record type in NFC message, ignoring");
    return;
  }

  const textDecoder = new TextDecoder(record.encoding);
  const content = textDecoder.decode(record.data);
  console.log(`NFC Tag content: '${content}'`);

  if (content && currentHandler) {
    currentHandler(content);
  }
}

export async function isNfcPermissionGranted() {
  const nfcPermissionStatus = await navigator.permissions.query({ name: "nfc" });
  return nfcPermissionStatus.state === "granted";
}

// Allow debugging from console
window.nfcDebugMessage = function (msg) {
  currentHandler(msg);
};
