'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { purchaseApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SAMPLE_PRODUCTS = [
  { name: 'Premium E-Book Bundle', price: 29.99 },
  { name: 'Online Course Access', price: 49.99 },
  { name: 'Template Collection', price: 19.99 },
  { name: 'Digital Assets Pack', price: 39.99 }
];

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { updateUser } = useAuthStore();
  const [selectedProduct, setSelectedProduct] = useState(SAMPLE_PRODUCTS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePurchase = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await purchaseApi.createPurchase({
        productName: selectedProduct.name,
        amount: selectedProduct.price
      });

      if (response.success) {
        setSuccess(true);
        
        // Update user credits in auth store
        const user = useAuthStore.getState().user;
        if (user && response.data.creditInfo.success) {
          // Fetch updated user data would be better, but for now we can increment
          updateUser({ 
            totalCredits: user.totalCredits + 2,
            hasMadePurchase: true 
          });
        }

        // Show success message for 2 seconds then close
        setTimeout(() => {
          onSuccess();
          onClose();
          setSuccess(false);
        }, 2000);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              {success ? (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  >
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </motion.div>
                  <h3 className="mt-4 text-xl font-bold text-gray-900">
                    Purchase Successful!
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Credits have been added to your account
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Make a Purchase
                    </h2>
                    <button
                      onClick={handleClose}
                      disabled={isProcessing}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Product
                      </label>
                      <div className="space-y-2">
                        {SAMPLE_PRODUCTS.map((product) => (
                          <button
                            key={product.name}
                            onClick={() => setSelectedProduct(product)}
                            disabled={isProcessing}
                            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                              selectedProduct.name === product.name
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {product.name}
                                </p>
                              </div>
                              <p className="text-lg font-bold text-gray-900">
                                ${product.price}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        💡 First purchase earns you 2 credits! If you were referred, 
                        your referrer also earns 2 credits.
                      </p>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleClose}
                        disabled={isProcessing}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        className="flex-1"
                        onClick={handlePurchase}
                        isLoading={isProcessing}
                      >
                        Complete Purchase
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};