import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { ethers } from "ethers";

admin.initializeApp();
const db = admin.firestore();

// 🔧 Configuración del token FYF
const TOKEN_ADDRESS = "0x126b8d8641fb27c312dffdc2c03bbd1e95bd25ae";
// const TREASURY_ADDRESS = "0x290117a497f83aA436Eeca928b4a8Fa3857ed829";
// const ENTRY_FEE = ethers.parseUnits("15", 18);
// const TOKEN_ABI = [
//   "function transfer(address to, uint256 amount) public returns (bool)",
//   "function decimals() public view returns (uint8)",
// ];

export const registerPlayer = functions.https.onCall(
  async (request, context) => {
    const { wallet, nickname, eventId, txHash } = request.data as {
      wallet: string;
      nickname: string;
      eventId: string;
      txHash: string;
    };

    if (!wallet || !nickname || !eventId || !txHash) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Faltan datos obligatorios"
      );
    }

    try {
      // 1. Conectarse a BNB Chain para verificar el pago
      const provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");

      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt) {
        throw new functions.https.HttpsError(
          "not-found",
          "Transacción no encontrada"
        );
      }

      // 2. Validar que el pago fue al contrato FYF
      const tx = await provider.getTransaction(txHash);
      if (!tx || !tx.to || tx.to.toLowerCase() !== TOKEN_ADDRESS.toLowerCase()) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "El pago no fue al contrato FYF"
        );
      }

      // 3. Verificar que no exista ya ese nickname en el evento
      const existing = await db
        .collection("events")
        .doc(eventId)
        .collection("players")
        .where("nickname", "==", nickname)
        .get();

      if (!existing.empty) {
        throw new functions.https.HttpsError(
          "already-exists",
          "Este nickname ya está registrado en el evento"
        );
      }

      // 4. Guardar en Firestore (wallet como ID único)
      await db
        .collection("events")
        .doc(eventId)
        .collection("players")
        .doc(wallet)
        .set({
          wallet,
          nickname,
          txHash,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      return { success: true, message: "Jugador registrado correctamente" };
    } catch (err: any) {
      console.error(err);
      throw new functions.https.HttpsError(
        "unknown",
        err.message || "Error desconocido"
      );
    }
  }
);
