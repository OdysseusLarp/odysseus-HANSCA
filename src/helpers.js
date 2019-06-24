import { chunk } from 'lodash';

export function parseEntries(entries, type, maxLength = 35) {
    return (entries || []).filter(e => type ? e.type === type : true)
    .map(e => e.entry)
    .reduce((prev, cur) => {
        // The first entry is actually multiple entries split by two newlines, so split those
        // into individual entries and cut the line length to max X characters
        const split = cur.split('\n\n');
        const entryWithNewLines = split.map(entry => {
          return chunk(entry.split(''), maxLength).map(e => e.join('')).join('\n    ');
        });
      return [...prev, ...entryWithNewLines];
    }, [])
    .map(e => '   ' + e)
    .join('\n\n')
}