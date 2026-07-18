import midtransClient from 'midtrans-client';


const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

const checkAndUpdatePaymentStatus = async (transactionId) => {
  const transaction = await transactionModel.findById(transactionId);
  if (!transaction) throw new Error("Transaction not found");

  if (transaction.payment_status === "paid") return transaction;
  if (!transaction.midtrans_order_id || transaction.payment_method === "cod") {
    return transaction;
  }

  try {
    // ✅ Pakai snap yang sudah ada, bukan coreApi baru
    const midtransStatus = await snap.transaction.status(
      transaction.midtrans_order_id
    );

    console.log("Midtrans status:", midtransStatus.transaction_status);

    const { transaction_status, fraud_status, gross_amount } = midtransStatus;

    if (
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept")
    ) {
      await handleMidtransWebhook({
        order_id: transaction.midtrans_order_id,
        transaction_status,
        fraud_status,
        gross_amount,
      });
      return await transactionModel.findById(transactionId);
    }

    if (transaction_status === "cancel" || transaction_status === "expire") {
      await pool.query(
        `UPDATE transactions SET payment_status = ?, status = 'cancelled' WHERE id = ?`,
        [transaction_status, transactionId]
      );
      return await transactionModel.findById(transactionId);
    }

  } catch (err) {
    console.error("Midtrans status check error:", err.message);
  }

  return transaction;
};

export default snap;