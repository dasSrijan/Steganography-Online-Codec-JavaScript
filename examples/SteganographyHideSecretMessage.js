"use strict";

/******************************************************************************
 *
 * Steganography Online Codec WebApi interface usage example.
 *
 * In this example, we will see how to hide an encrypted message in an
 * image file using our codec.
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

// encode a hidden message within the source image file
(async () => {
	// full version image size limit is set to 10 MB (demo 50 kB max)
	// supported image formats are PNG, JPG, GIF, BMP, WBMP, GD2, AVIF, WEBP (mail me for more)
	const inputFilePath = 'input_file.webp';

	// full version message size is unlimited (demo 16 chars max)
	const secretMessage = 'Secret message';

	// full version password length is 128 characters max (demo 8 chars max)
	const password = 'Pa$$word';

	// where to save encoded image with the secret message
	const outputFilePath = 'output_file_with_hidden_secret_message.png';

	try {
		// encode a hidden message (encrypted with your password) within an image file
		const result = await mySteganographyOnlineCodec.encode(inputFilePath, secretMessage, password, outputFilePath);

		// result object holds the encoding results as well as other information
		const versionType = result.license && result.license.activationStatus ? 'full' : 'demo';
		console.log(`You are running in ${versionType} version`);

		console.log(`Secret messaged encoded and saved to ${outputFilePath}`);
		if (result.license && result.license.usagesCount !== undefined) {
			console.log(`Remaining number of usage credits - ${result.license.usagesCount}`);
		}
	} catch (err) {
		const errorCode = err.error;

		switch (errorCode) {
			case Errors.INVALID_INPUT:
				console.log(`Invalid input file ${inputFilePath} or file doesn't exist`);
				break;
			case Errors.MESSAGE_TOO_LONG:
				console.log('Message is too long for the provided image file, use larger file');
				break;
			case Errors.IMAGE_TOO_BIG:
				console.log(`Image file is too big, current limit is set to ${err.raw?.limits?.maxFileSize ?? 'unknown'}`);
				break;
			case Errors.LIMIT_MESSAGE:
				console.log(`Message is too long, current limit is set to ${err.raw?.limits?.maxMessageLen ?? 'unknown'}`);
				break;
			case Errors.LIMIT_PASSWORD:
				console.log(`Password is too long, current limit is set to ${err.raw?.limits?.maxPasswordLen ?? 'unknown'}`);
				break;
			case Errors.INVALID_PASSWORD:
				console.log('Invalid password');
				break;
			default:
				console.log(`An error occurred: ${err.error_message ?? `Error code ${errorCode}`}`);
		}
	}
})();
