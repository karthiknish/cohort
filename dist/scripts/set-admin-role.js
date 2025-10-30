"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_process_1 = __importDefault(require("node:process"));
const firestore_1 = require("firebase-admin/firestore");
const firebase_admin_1 = require("../src/lib/firebase-admin");
async function main() {
    const [, , emailArg] = node_process_1.default.argv;
    const email = (emailArg ?? node_process_1.default.env.ADMIN_EMAIL)?.trim().toLowerCase();
    if (!email) {
        console.error('Usage: pnpm ts-node scripts/set-admin-role.ts <email>');
        console.error('       ADMIN_EMAIL=<email> pnpm ts-node scripts/set-admin-role.ts');
        node_process_1.default.exitCode = 1;
        return;
    }
    try {
        const userRecord = await firebase_admin_1.adminAuth.getUserByEmail(email);
        const existingClaims = (userRecord.customClaims ?? {});
        const nextClaims = {
            ...existingClaims,
            role: 'admin',
        };
        await firebase_admin_1.adminAuth.setCustomUserClaims(userRecord.uid, nextClaims);
        await firebase_admin_1.adminDb
            .collection('users')
            .doc(userRecord.uid)
            .set({
            email,
            role: 'admin',
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
        console.log(`✅ Set admin role for ${email} (uid: ${userRecord.uid})`);
        console.log('ℹ️ Users must refresh their session to receive updated privileges.');
    }
    catch (error) {
        console.error(`❌ Failed to set admin role for ${email}`);
        if (error instanceof Error) {
            console.error(error.message);
        }
        else {
            console.error(error);
        }
        node_process_1.default.exitCode = 1;
    }
}
void main();
