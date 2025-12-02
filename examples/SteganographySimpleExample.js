"use strict";

/******************************************************************************
 *
 * Steganography Online Codec WebApi interface usage example.
 *
 * In this example shows how to hide an encrypted secret message in an image file.
 *
 * Version      : v1.00
 * Language     : JavaScript
 * Author       : Bartosz Wójcik (original example)
 * Project      : https://www.pelock.com/products/steganography-online-codec
 * Homepage     : https://www.pelock.com
 *
 * @link https://www.pelock.com/products/steganography-online-codec
 * @copyright Copyright (c) 2020-2025 PELock LLC
 * @license Apache-2.0
 *
/*****************************************************************************/

// include Steganography Online Codec module
import { SteganographyOnlineCodec, Errors } from 'steganography-online-codec';
// or if tested locally use:
//import { SteganographyOnlineCodec, Errors } from '../src/SteganographyOnlineCodec.mjs';

// create Steganography Online Codec class instance (we are using our activation key)
const mySteganographyOnlineCodec = new SteganographyOnlineCodec('YOUR-WEB-API-KEY');

// encode a hidden message (encrypted with your password) within an image file
(async () => {

	const inputFile = 'input_file.jpg';
	const secretMessage = 'Secret message';
	const password = 'Pa$$word';
	const outputFile = 'output_file_with_hidden_secret_message.png';

	try {
		const result = await mySteganographyOnlineCodec.encode(inputFile, secretMessage, password, outputFile);

		// result object holds the encoding results as well as other information
		console.log('Secret messaged encoded and saved to the output PNG file.');
	} catch (err) {
		console.error('Encoding failed:', err.error_message || err.message || String(err));
	}
})();
