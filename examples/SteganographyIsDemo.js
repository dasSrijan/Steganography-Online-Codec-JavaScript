"use strict";

/******************************************************************************
 *
 * Steganography Online Codec WebApi interface usage example.
 *
 * In this example we will verify our activation key status.
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

// login to the service
(async () => {
	try {
		const result = await mySteganographyOnlineCodec.login();

		// result object holds the information about the license & current limits
		const versionType = result.license && result.license.activationStatus ? 'full' : 'demo';
		console.log(`You are running in ${versionType} version`);

		// information about the current license
		if (result.license && result.license.activationStatus) {
			console.log(`Registered for - ${result.license.userName}`);
			const licenseType = result.license.type === 0 ? 'personal' : 'company';
			console.log(`License type - ${licenseType}`);
			console.log(`Total number of purchased usage credits - ${result.license.usagesTotal}`);
			console.log(`Remaining number of usage credits - ${result.license.usagesCount}`);
		}

		// current limits (different for DEMO and FULL versions)
		if (result.limits) {
			console.log(`Max. password length - ${result.limits.maxPasswordLen}`);
			const msgLen = result.limits.maxMessageLen === -1 ? 'unlimited' : result.limits.maxMessageLen;
			console.log(`Max. message length - ${msgLen}`);
			console.log(`Max. input image file size - ${mySteganographyOnlineCodec.convert_size(result.limits.maxFileSize)}`);
		}
	} catch (err) {
		console.error(`Login failed: ${err.error_message || String(err)}`);
	}
})();
