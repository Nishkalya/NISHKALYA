// Simple local shim for node-domexception using Node's native globalThis.DOMException
module.exports = globalThis.DOMException || class DOMException extends Error {
  constructor(message, name) {
    super(message);
    this.name = name || 'DOMException';
    this.code = 0;
  }
};
