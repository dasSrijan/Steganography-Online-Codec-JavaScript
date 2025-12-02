"use strict";

/******************************************************************************
 *
 * Steganography Online Codec allows you to hide a password encrypted message
 * within the images & photos using AES encryption algorithm with a 256-bit
 * PBKDF2 derived key.
 *
 * Version      : v1.0.0
 * JS           : ES6
 * Dependencies : form-data, node-fetch
 * Author       : Bartosz Wójcik (support@pelock.com)
 * Project      : https://www.pelock.com/products/steganography-online-codec
 * Homepage     : https://www.pelock.com
 *
 * @link https://www.pelock.com/products/steganography-online-codec
 * @copyright Copyright (c) 2021-2025 PELock LLC
 * @license Apache-2.0
 *
/*****************************************************************************/

// ES module style imports
import FormData from 'form-data';
import fetch from 'node-fetch';
import { writeFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';


// CommonJS style imports
//const FormData = require('form-data');
//const fetch = require('node-fetch');

/**
 * Errors returned by the Steganography Online Codec API interface
 *
 * Usage:
 *
 * if (error === Errors.SUCCESS) { ... }
 *
 */
export class Errors
{
	/**
	 * @var int cannot connect to the Web API interface (network error)
	 */
	static WEBAPI_CONNECTION = -1

	/**
	 * @var int success
	 */
	static SUCCESS = 0

	/**
	 * @var int  unknown error
	 */
	static UNKNOWN = 1

	/**
	 * @var int message is too long for the selected image file (use larger image file)
	 */
	static MESSAGE_TOO_LONG = 2

	/**
	 * @var int  image file is too big (10 MB for full version, 50 kB for DEMO mode)
	 */
	static IMAGE_TOO_BIG = 3

	/**
	 * @var int  image file is invalid
	 */
	static INVALID_INPUT = 4

	/**
	 * @var int  image file format is not supported
	 */
    static INVALID_IMAGE_FORMAT = 5

	/**
	 * @var int  image file is malformed and cannot write or read the encoded message
	 */
	static IMAGE_MALFORMED = 6

	/**
	 * @var int  provided password is invalid (max. length 128 chars for full version, 8 for DEMO mode)
	 */
	static INVALID_PASSWORD = 7

	/**
	 * @var int  provided message is too long (unlimited size for the full version, 16 for DEMO mode)
	 */
    static LIMIT_MESSAGE = 9

	/**
	 * @var int  provided password is invalid (max. length 128 chars for full version, 8 for DEMO mode)
	 */
	static LIMIT_PASSWORD = 10

	/**
	 * @var int  error while writing output file
	 */
    static OUTPUT_FILE = 99

	/**
	 * @var int  license key is invalid or expired (no usage credits left)
	 */
	static INVALID_LICENSE = 100
}

/**
 * Steganography Online Codec API module
 *
 * Usage:
 *
 * mySteganographyOnlineCodec = new SteganographyOnlineCodec("YOUR-WEB-API-KEY");
 *
 * // encode a hidden message (encrypted with your password) within an image file
 * mySteganographyOnlineCodec.encode("input_file.jpg", "Secret message", "Pa$$word", "output_file_with_hidden_secret_message.png").then((result) => { ... })
 *
 *     console.log("Secret messaged encoded and saved to the output PNG file.");
 *
 * }).catch((error) => {
 *
 *     switch(error["error"]) { ... }
 *
 * });
 *
 */
export class SteganographyOnlineCodec
{
	/**
	 * @var string default Steganography Online Codec WebApi endpoint
	 */
	API_URL = "https://www.pelock.com/api/steganography-online-codec/v1";

	/**
	 * @var string|null WebApi key for the service (leave empty for demo version)
	 */
	_apiKey = null;

	/**
	 * Initialize SteganographyOnlineCodec class
	 *
	 * @param {string|null} api_key Activation key for the service (it can be empty for demo mode)
	 */
	constructor(api_key = null)
	{
		this._apiKey = api_key;
	}

	/**
	 * Login to the service and get the information about the current license limits
	 *
	 * @returns {Promise<Object>} Object with { error, license, limits, ... } from API response
	 * @throws {Object} Error object with { error, error_message } on failure
	 */
	async login()
	{
		const params = { command: 'login' };
		return this.post_request(params);
	}

	/**
	 * Encrypt a message and hide it inside encoded output image file
	 *
	 * @param {string|Buffer|Uint8Array} input_image Input image path, Buffer or Uint8Array (supported formats PNG, JPG, GIF or BMP)
	 * @param {string} message_to_hide Message to encrypt & hide within the input image (will fail if message is too long for the selected image file)
	 * @param {string} password Message encryption password (max. 128 chars)
	 * @param {string} output_image_path Output file path (PNG format), will overwrite existing file
	 * @returns {Promise<Object>} Object with { error, photo, license, limits, ... } on success
	 * @throws {Object} Error object with { error, error_message } on failure
	 */
	async encode(input_image, message_to_hide, password, output_image_path)
	{
		// Validate inputs first
		if (!input_image) {
			throw { error: Errors.INVALID_INPUT, error_message: 'input_image is required' };
		}
		if (!message_to_hide) {
			throw { error: Errors.INVALID_INPUT, error_message: 'message_to_hide is required' };
		}
		if (!password) {
			throw { error: Errors.INVALID_INPUT, error_message: 'password is required' };
		}
		if (!output_image_path) {
			throw { error: Errors.INVALID_INPUT, error_message: 'output_image_path is required' };
		}

		// parameters object
		const params = {
			command: 'encode',
			message: message_to_hide,
			password: password
		};

		// Attach image: accept a file path (string) or a Buffer/Uint8Array
		if (typeof input_image === 'string') {
			// send as read stream so FormData uploads the file contents
			try {
				params.image = createReadStream(input_image);
			} catch (err) {
				throw { error: Errors.INVALID_INPUT, error_message: String(err) };
			}
		} else if (input_image instanceof Uint8Array || Buffer.isBuffer(input_image)) {
			params.image = Buffer.from(input_image);
		} else {
			throw { error: Errors.INVALID_INPUT, error_message: 'input_image must be a file path (string) or Buffer' };
		}

		// send request (will throw on error)
		const result = await this.post_request(params);

		// Write output file
		try {
			await writeFile(output_image_path, Buffer.from(result.encodedImage, 'base64'));
		} catch (err) {
			throw { error: Errors.OUTPUT_FILE, error_message: String(err), raw: result };
		}

		return result;
	}

	/**
	 * Retrieve hidden message from the encoded image file (PNG format)
	 *
	 * @param {string|Buffer|Uint8Array} input_image Input image path, Buffer or Uint8Array (PNG format only)
	 * @param {string} password Message decryption password (max. 128 chars)
	 * @returns {Promise<Object>} Object with { error, message, license, limits, ... } on success
	 * @throws {Object} Error object with { error, error_message } on failure
	 */
	async decode(input_image, password)
	{
		// Validate inputs first
		if (!input_image) {
			throw { error: Errors.INVALID_INPUT, error_message: 'input_image is required' };
		}
		if (!password) {
			throw { error: Errors.INVALID_INPUT, error_message: 'password is required' };
		}

		// parameters object
		const params = {
			command: 'decode',
			password: password
		};

		// Attach image: accept a file path (string) or a Buffer/Uint8Array
		if (typeof input_image === 'string') {
			// send as read stream so FormData uploads the file contents
			try {
				params.image = createReadStream(input_image);
			} catch (err) {
				throw { error: Errors.INVALID_INPUT, error_message: String(err) };
			}
		} else if (input_image instanceof Uint8Array || Buffer.isBuffer(input_image)) {
			params.image = Buffer.from(input_image);
		} else {
			throw { error: Errors.INVALID_INPUT, error_message: 'input_image must be a file path (string) or Buffer' };
		}

		// send request (will throw on error)
		return this.post_request(params);
	}

	/**
	 * Send a POST request to the server & returns a Promise.
	 *
	 * @param {Object} params_array Object with parameters to POST (e.g. { command: 'encode' }). Can include Stream or Buffer for binary fields like 'image'.
	 * @returns {Promise<Object>} Resolves with parsed JSON response from API; rejects with error object on network/parse failure
	 */
	async post_request(params_array)
	{
		if (!params_array || typeof params_array !== 'object') {
			throw { error: Errors.INVALID_INPUT, error_message: 'params_array must be an object' };
		}

		try {
			// prepare a form for the POST request
			const form = new FormData();

			// include activation key to the main request form
			form.append('key', this._apiKey);

			// iterate over all parameters and append them to the form
			Object.keys(params_array).forEach(param => {
				const value = params_array[param];

				// Handle 'image' field specially — it can be a Stream (from createReadStream) or Buffer
				if (param === 'image') {
					// FormData.append() accepts Stream or Buffer; add filename for clarity
					form.append(param, value);
				} else {
					form.append(param, value);
				}
			});

			// perform the fetch request
			const response = await fetch(this.API_URL, {
				method: 'POST',
				body: form,
				headers: form.getHeaders()
			});

			// check response status
			if (!response || !response.ok) {
				throw { error: Errors.WEBAPI_CONNECTION, error_message: `HTTP ${response.status}` };
			}

			// parse JSON response
			const json = await response.json();

			// Expect the API to return an `error` numeric field
			if (json && typeof json.error !== 'undefined') {

				if (json.error === Errors.SUCCESS) {
					return json;
				}

				// API returned an error code — throw with message
				throw { error: json.error, error_message: json.error_message || `API error code ${json.error}`, raw: json };
			}

			// malformed response — no error field
			throw { error: Errors.UNKNOWN, error_message: 'Malformed API response: missing error field', raw: json };

		} catch (err) {
			// If the error is already an SDK-style object with an error field, rethrow as-is
			if (err && typeof err === 'object' && typeof err.error !== 'undefined') {
				throw err;
			}

			// wrap non-SDK errors
			throw { error: Errors.WEBAPI_CONNECTION, error_message: String(err) };
		}
	}

	/**
	 * Convert a byte count to a human readable string (e.g. "1.23 MB").
	 *
	 * @param {number} size_bytes Number of bytes to convert
	 * @returns {string} Human readable representation (two decimal places)
	 */
	convert_size(size_bytes)
	{
		if (typeof size_bytes !== 'number') {
			return '0 bytes';
		}

		if (size_bytes === 0) {
			return '0 bytes';
		}

		const size_name = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		const i = Math.min(Math.floor(Math.log(size_bytes) / Math.log(1024)), size_name.length - 1);
		const p = Math.pow(1024, i);
		const s = Math.round((size_bytes / p) * 100) / 100; // two decimals
		return `${s} ${size_name[i]}`;
	}
}
