// ABOUTME: 印刷教材の現在URLをQRコード行列へ変換し、各印刷ページへ追加します。
// ABOUTME: 外部サービスや固定画像を使わず、ブラウザ内で白黒SVGを生成します。

const QR_VERSION = 5;
const QR_SIZE = 37;
const DATA_CODEWORDS = 108;
const ERROR_CODEWORDS = 26;
const MAX_BYTES = 106;

function appendBits(target, value, length) {
  for (let bit = length - 1; bit >= 0; bit -= 1) {
    target.push((value >>> bit) & 1);
  }
}

function makeFieldTables() {
  const exponent = new Uint8Array(512);
  const logarithm = new Uint8Array(256);
  let value = 1;

  for (let index = 0; index < 255; index += 1) {
    exponent[index] = value;
    logarithm[value] = index;
    value <<= 1;
    if (value & 0x100) value ^= 0x11d;
  }
  for (let index = 255; index < exponent.length; index += 1) {
    exponent[index] = exponent[index - 255];
  }
  return { exponent, logarithm };
}

const FIELD = makeFieldTables();

function multiply(left, right) {
  if (left === 0 || right === 0) return 0;
  return FIELD.exponent[FIELD.logarithm[left] + FIELD.logarithm[right]];
}

function makeGenerator(degree) {
  let result = [1];
  for (let index = 0; index < degree; index += 1) {
    const next = new Array(result.length + 1).fill(0);
    for (let term = 0; term < result.length; term += 1) {
      next[term] ^= result[term];
      next[term + 1] ^= multiply(result[term], FIELD.exponent[index]);
    }
    result = next;
  }
  return result;
}

function makeErrorCorrection(data, degree) {
  const generator = makeGenerator(degree);
  const remainder = new Array(degree).fill(0);

  for (const value of data) {
    const factor = value ^ remainder.shift();
    remainder.push(0);
    for (let index = 0; index < degree; index += 1) {
      remainder[index] ^= multiply(generator[index + 1], factor);
    }
  }
  return remainder;
}

function encodeData(text) {
  const bytes = [...new TextEncoder().encode(text)];
  if (bytes.length > MAX_BYTES) {
    throw new RangeError(`QRコードに入るURLは${MAX_BYTES}バイトまでです。`);
  }

  const bits = [];
  appendBits(bits, 0b0100, 4);
  appendBits(bits, bytes.length, 8);
  for (const byte of bytes) appendBits(bits, byte, 8);

  const capacity = DATA_CODEWORDS * 8;
  appendBits(bits, 0, Math.min(4, capacity - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);

  const data = [];
  for (let index = 0; index < bits.length; index += 8) {
    data.push(bits.slice(index, index + 8).reduce((sum, bit) => (sum << 1) | bit, 0));
  }
  for (let pad = 0; data.length < DATA_CODEWORDS; pad += 1) {
    data.push(pad % 2 === 0 ? 0xec : 0x11);
  }
  return [...data, ...makeErrorCorrection(data, ERROR_CODEWORDS)];
}

function makeEmptyMatrix() {
  return {
    modules: Array.from({ length: QR_SIZE }, () => new Array(QR_SIZE).fill(false)),
    functions: Array.from({ length: QR_SIZE }, () => new Array(QR_SIZE).fill(false)),
  };
}

function setFunction(matrix, x, y, dark) {
  if (x < 0 || y < 0 || x >= QR_SIZE || y >= QR_SIZE) return;
  matrix.modules[y][x] = dark;
  matrix.functions[y][x] = true;
}

function drawFinder(matrix, centerX, centerY) {
  for (let offsetY = -4; offsetY <= 4; offsetY += 1) {
    for (let offsetX = -4; offsetX <= 4; offsetX += 1) {
      const distance = Math.max(Math.abs(offsetX), Math.abs(offsetY));
      setFunction(matrix, centerX + offsetX, centerY + offsetY, distance !== 2 && distance !== 4);
    }
  }
}

function drawAlignment(matrix, centerX, centerY) {
  for (let offsetY = -2; offsetY <= 2; offsetY += 1) {
    for (let offsetX = -2; offsetX <= 2; offsetX += 1) {
      setFunction(
        matrix,
        centerX + offsetX,
        centerY + offsetY,
        Math.max(Math.abs(offsetX), Math.abs(offsetY)) !== 1,
      );
    }
  }
}

function drawFormatBits(matrix, mask) {
  const formatData = (1 << 3) | mask;
  let remainder = formatData;
  for (let index = 0; index < 10; index += 1) {
    remainder = (remainder << 1) ^ ((remainder >>> 9) * 0x537);
  }
  const bits = ((formatData << 10) | remainder) ^ 0x5412;
  const bit = (index) => ((bits >>> index) & 1) !== 0;

  for (let index = 0; index <= 5; index += 1) setFunction(matrix, 8, index, bit(index));
  setFunction(matrix, 8, 7, bit(6));
  setFunction(matrix, 8, 8, bit(7));
  setFunction(matrix, 7, 8, bit(8));
  for (let index = 9; index < 15; index += 1) setFunction(matrix, 14 - index, 8, bit(index));

  for (let index = 0; index < 8; index += 1) setFunction(matrix, QR_SIZE - 1 - index, 8, bit(index));
  for (let index = 8; index < 15; index += 1) {
    setFunction(matrix, 8, QR_SIZE - 15 + index, bit(index));
  }
  setFunction(matrix, 8, QR_SIZE - 8, true);
}

function drawFunctions(matrix) {
  drawFinder(matrix, 3, 3);
  drawFinder(matrix, QR_SIZE - 4, 3);
  drawFinder(matrix, 3, QR_SIZE - 4);

  for (let index = 8; index < QR_SIZE - 8; index += 1) {
    setFunction(matrix, 6, index, index % 2 === 0);
    setFunction(matrix, index, 6, index % 2 === 0);
  }
  drawAlignment(matrix, 30, 30);
  drawFormatBits(matrix, 0);
}

function drawCodewords(matrix, codewords) {
  const bits = [];
  for (const codeword of codewords) appendBits(bits, codeword, 8);

  let bitIndex = 0;
  let upward = true;
  for (let right = QR_SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vertical = 0; vertical < QR_SIZE; vertical += 1) {
      const y = upward ? QR_SIZE - 1 - vertical : vertical;
      for (let column = 0; column < 2; column += 1) {
        const x = right - column;
        if (matrix.functions[y][x]) continue;
        const dataBit = bitIndex < bits.length ? bits[bitIndex] === 1 : false;
        matrix.modules[y][x] = dataBit !== ((x + y) % 2 === 0);
        bitIndex += 1;
      }
    }
    upward = !upward;
  }
}

export function makeQrMatrix(text) {
  const matrix = makeEmptyMatrix();
  drawFunctions(matrix);
  drawCodewords(matrix, encodeData(text));
  drawFormatBits(matrix, 0);
  return matrix.modules;
}

export function makeQrSvg(documentObj, text) {
  const matrix = makeQrMatrix(text);
  const quietZone = 4;
  const size = matrix.length + quietZone * 2;
  const svg = documentObj.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `この教材ページを開くQRコード：${text}`);
  svg.setAttribute('shape-rendering', 'crispEdges');

  const background = documentObj.createElementNS('http://www.w3.org/2000/svg', 'rect');
  background.setAttribute('width', String(size));
  background.setAttribute('height', String(size));
  background.setAttribute('fill', '#fff');
  svg.append(background);

  const path = documentObj.createElementNS('http://www.w3.org/2000/svg', 'path');
  const commands = [];
  matrix.forEach((row, y) => row.forEach((dark, x) => {
    if (dark) commands.push(`M${x + quietZone},${y + quietZone}h1v1h-1z`);
  }));
  path.setAttribute('d', commands.join(''));
  path.setAttribute('fill', '#000');
  svg.append(path);
  return svg;
}

export function mountPrintQr(documentObj = document, windowObj = window) {
  const targets = documentObj.querySelectorAll(
    '.km-mission, .ht-strategy-sheet, .hb-record-sheet, .rn-notebook-page, .zu-sheet, .mu-practice-sheet',
  );
  if (targets.length === 0) return 0;

  const url = new URL(windowObj.location.href);
  url.hash = '';
  url.search = '';

  let mounted = 0;
  for (const target of targets) {
    if (target.querySelector(':scope > .print-page-qr')) continue;
    try {
      const link = documentObj.createElement('a');
      link.className = 'print-page-qr';
      link.href = url.href;
      link.setAttribute('aria-label', 'この教材ページを開く');
      link.append(makeQrSvg(documentObj, url.href));

      const label = documentObj.createElement('span');
      label.textContent = 'このページを開く';
      link.append(label);
      target.append(link);
      mounted += 1;
    } catch (error) {
      console.warn('印刷用QRコードを作成できませんでした。', error);
    }
  }
  return mounted;
}
