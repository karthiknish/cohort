//#region node_modules/is-alphabetical/index.js
/**
* Check if the given character code, or the character code at the first
* character, is alphabetical.
*
* @param {string|number} character
* @returns {boolean} Whether `character` is alphabetical.
*/
function isAlphabetical(character) {
	const code = typeof character === "string" ? character.charCodeAt(0) : character;
	return code >= 97 && code <= 122 || code >= 65 && code <= 90;
}
//#endregion
export { isAlphabetical as t };
