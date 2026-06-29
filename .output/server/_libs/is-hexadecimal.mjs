//#region node_modules/is-hexadecimal/index.js
/**
* Check if the given character code, or the character code at the first
* character, is hexadecimal.
*
* @param {string|number} character
* @returns {boolean} Whether `character` is hexadecimal
*/
function isHexadecimal(character) {
	const code = typeof character === "string" ? character.charCodeAt(0) : character;
	return code >= 97 && code <= 102 || code >= 65 && code <= 70 || code >= 48 && code <= 57;
}
//#endregion
export { isHexadecimal as t };
