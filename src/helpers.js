import { chunk } from 'lodash-es';

export function parseEntries(entries, type, maxLength = 35) {
  return (entries || []).filter(e => type ? e.type === type : true)
    .map(e => e.entry);
}