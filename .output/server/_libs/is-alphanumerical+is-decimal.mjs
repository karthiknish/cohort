import { t as isAlphabetical } from "./is-alphabetical.mjs";
//#region node_modules/is-decimal/index.js
/**
* Check if the given character code, or the character code at the first
* character, is decimal.
*
* @param {string|number} character
* @returns {boolean} Whether `character` is a decimal
*/
function isDecimal(character) {
	const code = typeof character === "string" ? character.charCodeAt(0) : character;
	return code >= 48 && code <= 57;
}
//#endregion
//#region node_modules/is-alphanumerical/index.js
/**
* Check if the given character code, or the character code at the first
* character, is alphanumerical.
*
* @param {string|number} character
* @returns {boolean} Whether `character` is alphanumerical.
*/
function isAlphanumerical(character) {
	return isAlphabetical(character) || isDecimal(character);
}
//#endregion
export { isDecimal as n, isAlphanumerical as t };
