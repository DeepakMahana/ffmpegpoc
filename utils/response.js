/**
 * @file Express router extension module
 *
 * @author Deepak Mahana <Deepak.Mahana@nw18.com>
 */

/**
 * @description Response handler for express application
 * @param {Object} res Express router response object
 * @param {Boolean} success Is request successful?
 * @param {String} message - Optional - Message to be sent to client
 * @param {Boolean} isError - Optional - Is execution error?
 * @param {Object} data - Optional - Data to be sent to client
 * @param {Number} statusCode - Optional - HTTP Status code
 */

const response = (res, success, message = '', isError = false, data = {}, statusCode = 200) => {
    if (!isError) {
      return res
        .status(statusCode)
        .json({
          success,
          message,
          data,
        });
    }
    return res
      .status((statusCode >= 200 && statusCode <= 300) ? 500 : statusCode)
      .json({
        success: false,
        message,
        data,
      });
};

module.exports = response;
  