/**
 * Mock Logger for Tab Manager testing
 */
export const Logger = {
  debug: console.log.bind(console),
  error: console.error.bind(console),
  warn: console.warn.bind(console),
  log: console.log.bind(console)
};

export default Logger;





