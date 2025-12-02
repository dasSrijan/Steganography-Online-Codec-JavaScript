"use strict";

/******************************************************************************
 *
 * Steganography Online Codec WebApi interface usage example.
 *
 * In this example, we will see how to extract a previously encrypted & hidden
 * secret message from an image file.
 *
 * Version      : v1.00
 * Language     : JavaScript
 * Author       : Bartosz Wójcik
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

// extract a hidden message from the previously encoded image file
(async () => {
	// full version image size limit is set to 10 MB (demo 50 kB max)
	// supported image format is PNG and only PNG!
	const inputFilePath = 'output_file_with_hidden_secret_message.png';

	// full version password length is 128 characters max (demo 8 chars max)
	const password = 'Pa$$word';

	try {
		// extract a hidden message from the image (PNG files only)
		const result = await mySteganographyOnlineCodec.decode(inputFilePath, password);

		// result object holds the decoding results as well as other information
		console.log(`You are running in ${result.license?.activationStatus ? 'full' : 'demo'} version`);

		console.log(`Secret message is "${result.message}"`);

		if (result.license && result.license.usagesCount !== undefined) {
			console.log(`Remaining number of usage credits - ${result.license.usagesCount}`);
		}
	} catch (err) {
		switch (err.error) {
			case Errors.INVALID_INPUT:
				console.log(`Invalid input file ${inputFilePath} or file doesn't exist`);
				break;
			case Errors.IMAGE_TOO_BIG:
				console.log(`Image file is too big, current limit is set to ${err.raw?.limits?.maxFileSize ?? 'unknown'}`);
				break;
			case Errors.LIMIT_MESSAGE:
				console.log(`Extracted message is too long, current limit is set to ${err.raw?.limits?.maxMessageLen ?? 'unknown'}`);
				break;
			case Errors.LIMIT_PASSWORD:
				console.log(`Password is too long, current limit is set to ${err.raw?.limits?.maxPasswordLen ?? 'unknown'}`);
				break;
			case Errors.INVALID_PASSWORD:
				console.log('Invalid password');
				break;
			default:
				console.log(`An error occurred: ${err.error_message ?? String(err)}`);
		}
	}
})();
