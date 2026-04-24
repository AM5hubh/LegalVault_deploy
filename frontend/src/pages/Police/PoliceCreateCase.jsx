import React, { useState } from "react";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { prepareTransaction } from "thirdweb";
import { DEFAULT_CHAIN } from "../../utils/thirdwebConfig";
import { client } from "../../utils/thirdwebClient";
import {
  Loader,
  CheckCircle,
  AlertCircle,
  Wallet,
  Plus,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const PoliceCreateCase = () => {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const activeAccount = useActiveAccount();
  const { mutateAsync: sendTransaction } = useSendTransaction();
  const { token } = useAuth();

  const [form, setForm] = useState({
    caseId: "",
    caseNumber: "",
    initialAccess: "", // comma-separated emails
  });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | preparing | signing | submitted
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [txHash, setTxHash] = useState("");

  const parseInitialAccess = (val) =>
    val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setTxHash("");

    if (!form.caseId.trim() || !form.caseNumber.trim()) {
      setError("caseId and caseNumber are required");
      return;
    }

    if (!activeAccount?.address) {
      setError("Connect your wallet to sign the transaction.");
      return;
    }

    try {
      setIsLoading(true);
      setStatus("preparing");

      const initialAccessEmails = parseInitialAccess(form.initialAccess);

      const resp = await fetch(`${API_BASE_URL}/cases/onchain/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({
          caseId: form.caseId,
          caseNumber: form.caseNumber,
          initialAccessEmails,
          from: activeAccount.address,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || "Failed to prepare transaction");
      }

      const data = await resp.json();
      const { tx } = data || {};
      if (!tx?.to || !tx?.data) {
        throw new Error("Invalid transaction payload from server");
      }

      setStatus("signing");

      const preparedTx = prepareTransaction({
        client,
        chain: DEFAULT_CHAIN,
        to: tx.to,
        data: tx.data,
        value: tx.value ? BigInt(tx.value) : 0n,
        gas: tx.gasLimit ? BigInt(tx.gasLimit) : undefined,
        from: activeAccount.address,
      });

      const result = await sendTransaction(preparedTx);
      const hash = result?.transactionHash || result?.hash || result;
      if (!hash) throw new Error("Missing transaction hash from wallet");

      setTxHash(hash.toString());
      setStatus("submitted");
      setSuccess(
        "Case transaction submitted. Await confirmations in your wallet.",
      );

      setForm({ caseId: "", caseNumber: "", initialAccess: "" });
    } catch (err) {
      console.error(err);
      setError(err.message || "Transaction failed");
      setStatus("idle");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Case (On-Chain)
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Prepare and sign a CaseRegistry transaction. Registrar/admin roles
              required on backend.
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-200 text-orange-700 px-3 py-2 rounded text-xs">
            Wallet signing required
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle className="w-4 h-4 mt-0.5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-start rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            <CheckCircle className="w-4 h-4 mt-0.5 mr-2" />
            <div>
              <p>{success}</p>
              {txHash && (
                <p className="mt-2 break-all text-xs text-green-900">
                  Tx: {txHash}
                </p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Case ID (string or 0x bytes32)
            </label>
            <input
              type="text"
              name="caseId"
              value={form.caseId}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
              placeholder="e.g., CASE-2024-001 or 0x..."
              disabled={isLoading}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              If not hex, it will be hashed (keccak256) before sending to the
              contract.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Case Number (display)
            </label>
            <input
              type="text"
              name="caseNumber"
              value={form.caseNumber}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
              placeholder="e.g., CASE-2024-001"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
              <Users className="w-4 h-4" /> Initial Access Emails (optional)
            </label>
            <input
              type="text"
              name="initialAccess"
              value={form.initialAccess}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
              placeholder="user1@example.com,user2@example.com"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Comma-separated email identifiers that should have access on
              creation. Registrar is managed on-chain.
            </p>
          </div>

          <div className="space-y-3">
            {activeAccount ? (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                <Wallet className="w-4 h-4" />
                Wallet connected: {activeAccount.address}
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                <Wallet className="w-4 h-4" />
                Connect your wallet to sign the transaction.
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-white font-semibold hover:bg-orange-700 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  {status === "preparing" && "Preparing transaction..."}
                  {status === "signing" && "Awaiting wallet signature..."}
                  {status === "submitted" && "Submitted"}
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Case (Sign & Send)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PoliceCreateCase;
