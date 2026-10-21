import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/api';
import confetti from 'canvas-confetti';
import Modal from '../../components/common/Modal';
import ReceiptModal from '../../components/common/ReceiptModal';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const OnlinePayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriodNumber, setSelectedPeriodNumber] = useState(
    location.state?.periodNumber || ''
  );
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [order, setOrder] = useState(null);
  const [verifiedReceipt, setVerifiedReceipt] = useState(null);
  const [paymentOption, setPaymentOption] = useState('card');
  const [error, setError] = useState('');

  useEffect(() => {
    paymentService.getMyHistory().then((res) => {
      if (res.success) {
        setSchedule(res.schedule);
        // Default to first period with positive balance if not provided in location state
        if (!selectedPeriodNumber) {
          const firstUnpaid = res.schedule?.periods?.find((p) => p.balance > 0);
          if (firstUnpaid) {
            setSelectedPeriodNumber(firstUnpaid.periodNumber);
            setCustomAmount(firstUnpaid.balance);
          }
        } else {
          const selected = res.schedule?.periods?.find(
            (p) => p.periodNumber === Number(selectedPeriodNumber)
          );
          if (selected) setCustomAmount(selected.balance);
        }
      }
      setLoading(false);
    });
  }, []);

  const handlePeriodSelect = (pNum) => {
    setSelectedPeriodNumber(pNum);
    const p = schedule?.periods?.find((item) => item.periodNumber === Number(pNum));
    if (p) setCustomAmount(p.balance);
  };

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    if (!selectedPeriodNumber || !customAmount) return;

    setError('');
    setIsProcessing(true);
    try {
      const res = await paymentService.createOrder({
        periodNumber: Number(selectedPeriodNumber),
        amount: Number(customAmount),
      });

      if (res.success) {
        setOrder(res.order);
        setIsGatewayOpen(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to create payment order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmGatewayPayment = async () => {
    if (!order) return;
    setIsProcessing(true);

    try {
      const paymentId = `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const signature = `SIG-${Math.random().toString(36).substring(2, 15)}`;

      const res = await paymentService.verifyPayment({
        orderId: order.orderId,
        paymentId,
        periodNumber: order.periodNumber,
        amount: order.amount,
        signature,
      });

      if (res.success) {
        setIsGatewayOpen(false);
        setVerifiedReceipt(res.receipt);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      setError(err.message || 'Payment verification failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const unpaidPeriods = schedule?.periods?.filter((p) => p.balance > 0) || [];
  const currentPeriod = schedule?.periods?.find(
    (p) => p.periodNumber === Number(selectedPeriodNumber)
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pay College Fees Online</h1>
        <p className="text-sm text-slate-500 mt-1">
          Secure, verified online fee settlement with instant official receipt generation and ledger synchronization
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {unpaidPeriods.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <form onSubmit={handleInitiatePayment} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                1. Select Academic Due Period
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unpaidPeriods.map((p) => {
                  const isSelected = Number(selectedPeriodNumber) === p.periodNumber;
                  return (
                    <button
                      key={p.periodNumber}
                      type="button"
                      onClick={() => handlePeriodSelect(p.periodNumber)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-sm">{p.periodName}</span>
                        <span className="text-[11px] font-mono text-slate-500">
                          Due: {new Date(p.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-2 text-base font-black font-mono text-indigo-700">
                        ₹{p.balance.toLocaleString()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {currentPeriod && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold uppercase text-slate-700">
                      2. Payment Amount (₹)
                    </label>
                    <span className="text-xs text-slate-500">
                      Outstanding: <strong className="font-mono text-slate-800">₹{currentPeriod.balance.toLocaleString()}</strong>
                    </span>
                  </div>
                  <input
                    type="number"
                    required
                    min={1}
                    max={currentPeriod.balance}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-base font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <p className="text-xs text-slate-400 mt-1 italic">
                    * You can pay the full amount or enter a partial payment amount.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>256-Bit SSL Encrypted Server Verification</span>
                  </div>
                  <span className="font-mono text-slate-400">Gateway Sandbox Mode</span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !customAmount}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  <Lock className="h-4 w-4" /> Proceed to Secure Checkout (₹
                  {Number(customAmount || 0).toLocaleString()})
                </button>
              </div>
            )}
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">All Academic Fees Are Cleared!</h2>
          <p className="text-sm text-slate-500">
            You have no outstanding fee balance. Thank you for completing your payments.
          </p>
        </div>
      )}

      {/* Gateway Checkout Modal */}
      {isGatewayOpen && order && (
        <Modal
          isOpen={isGatewayOpen}
          onClose={() => setIsGatewayOpen(false)}
          title="EduCore Payment Gateway Checkout"
          maxWidth="max-w-md"
        >
          <div className="space-y-6">
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-mono font-bold text-indigo-900">{order.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee Period:</span>
                <span className="font-semibold text-slate-800">{order.periodName}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-indigo-200 text-slate-900">
                <span>Total Amount:</span>
                <span className="font-mono text-emerald-700">₹{order.amount.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate-700">
                Select Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['card', 'upi', 'netbanking'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentOption(mode)}
                    className={`py-2 text-xs font-semibold uppercase rounded-xl border transition-all ${
                      paymentOption === mode
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border text-xs text-slate-600 space-y-1">
              <p className="font-semibold">Simulated Gateway Environment</p>
              <p className="text-[11px] text-slate-400">
                Clicking confirm will simulate payment authorization and trigger server-side HMAC verification.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsGatewayOpen(false)}
                className="px-4 py-2 border rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmGatewayPayment}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
              >
                {isProcessing ? 'Verifying with Server...' : 'Authorize & Pay ₹' + order.amount.toLocaleString()}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Official Receipt Modal upon verified payment */}
      {verifiedReceipt && (
        <ReceiptModal
          isOpen={!!verifiedReceipt}
          onClose={() => {
            setVerifiedReceipt(null);
            navigate('/student/receipts');
          }}
          receipt={verifiedReceipt}
        />
      )}
    </div>
  );
};

export default OnlinePayment;
