import stream from 'stream';
import Convert from 'ansi-to-html';

export default function prettifyLogs(options) {
  let header = null;

  const stdOutConvert = createStdOutConverter(options);
  const stdErrConvert = createStdErrConverter(options);

  return new stream.Transform({
    transform: function(chunk, encoding, done) {
      if(header == null || header.length == 0){
        header = chunk.slice(0, 8);
        chunk = chunk.slice(8);
      }
      while (header !== null && header.length) {
        let type = header.readUInt8(0);
        let length = header.readUInt32BE(4);
        let payload = chunk.slice(0, length);
        chunk = chunk.slice(length);
        if (payload === null || payload.length === 0) break;
        if (type == 2) {
          this.push(stdErrConvert(payload.toString('utf8')));
        } else {
          this.push(stdOutConvert(payload.toString('utf8')));
        }
        header = chunk.slice(0, 8);
        chunk = chunk.slice(8);
      }
      done();
    }
  });
};

function createStdOutConverter(options){
  if(!options || options.html !== false){
    const convertStdOut = new Convert({stream: true});
    return content => `<span class="stdout">${convertStdOut.toHtml(content)}</span>`;
  }else{
    return content => content;
  }
}

function createStdErrConverter(options){
  if(!options || options.html !== false){
    const convertStdErr = new Convert({stream: true});
    return content => `<span class="stderr">${convertStdErr.toHtml(content)}</span>`;
  }else{
    return content => content;
  }
}
