"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminStorage = exports.adminAuth = exports.adminDb = exports.firebaseAdminApp = void 0;
const node_buffer_1 = require("node:buffer");
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
function decodeBase64PrivateKey(base64Key) {
    try {
        const normalized = base64Key.replace(/\s+/g, '');
        const decoded = node_buffer_1.Buffer.from(normalized, 'base64').toString('utf8');
        const trimmed = decoded.trim();
        if (trimmed.startsWith('-----BEGIN') && trimmed.includes('PRIVATE KEY')) {
            return trimmed.replace(/\r\n/g, '\n');
        }
        try {
            const parsed = JSON.parse(decoded);
            if (parsed?.private_key) {
                const key = parsed.private_key;
                if (key.includes('BEGIN PRIVATE KEY')) {
                    return key.replace(/\r\n/g, '\n');
                }
            }
        }
        catch {
            // Not a JSON payload; fall through to warn below.
        }
    }
    catch (error) {
        console.warn('[firebase-admin] Failed to decode FIREBASE_ADMIN_PRIVATE_KEY_B64', error);
    }
    return null;
}
function resolvePrivateKeyFromEnv() {
    const base64Key = process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64;
    if (base64Key) {
        const decoded = decodeBase64PrivateKey(base64Key);
        if (decoded) {
            return decoded;
        }
    }
    const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    if (rawKey) {
        return rawKey.replace(/\\n/g, '\n');
    }
    return null;
}
function resolveServiceAccount() {
    const jsonKey = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY;
    if (jsonKey) {
        try {
            const parsed = JSON.parse(jsonKey);
            if (parsed.projectId && parsed.clientEmail && parsed.privateKey) {
                return {
                    projectId: parsed.projectId,
                    clientEmail: parsed.clientEmail,
                    privateKey: parsed.privateKey.replace(/\\n/g, '\n'),
                };
            }
        }
        catch (error) {
            console.warn('[firebase-admin] Failed to parse FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY', error);
        }
    }
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = resolvePrivateKeyFromEnv();
    if (projectId && clientEmail && privateKey) {
        return {
            projectId,
            clientEmail,
            privateKey,
        };
    }
    return null;
}
function initializeFirebaseAdmin() {
    if ((0, app_1.getApps)().length) {
        return (0, app_1.getApps)()[0];
    }
    const serviceAccount = resolveServiceAccount();
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (serviceAccount) {
        return (0, app_1.initializeApp)({
            credential: (0, app_1.cert)(serviceAccount),
            projectId: serviceAccount.projectId,
            storageBucket,
        });
    }
    try {
        return (0, app_1.initializeApp)({
            credential: (0, app_1.applicationDefault)(),
            storageBucket,
        });
    }
    catch (error) {
        throw new Error('Failed to initialize Firebase Admin SDK. Provide either FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY JSON or the FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY, and FIREBASE_ADMIN_PROJECT_ID variables.');
    }
}
exports.firebaseAdminApp = initializeFirebaseAdmin();
exports.adminDb = (0, firestore_1.getFirestore)(exports.firebaseAdminApp);
exports.adminAuth = (0, auth_1.getAuth)(exports.firebaseAdminApp);
exports.adminStorage = (0, storage_1.getStorage)(exports.firebaseAdminApp);
