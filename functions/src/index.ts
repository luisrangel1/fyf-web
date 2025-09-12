import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const { ethers } = require("ethers");

admin.initializeApp();
const db = admin.firestore();

// 🔧 Configuración de direcciones
const RECIPIENT = "0xB1381123733A231B0A763130c80d9E3c80E76302"; // 👈 Tu nueva wallet receptora

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

      // 2. Validar que el pago fue a la wallet receptora del evento
      const tx = await provider.getTransaction(txHash);
      if (!tx || !tx.to || tx.to.toLowerCase() !== RECIPIENT.toLowerCase()) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "El pago no fue a la wallet del evento"
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

