'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { CreditTransaction } from '@/types';
import { 
  formatDateTime, 
  getTransactionTypeColor,
  formatTransactionType 
} from '@/lib/utils';

interface TransactionHistoryProps {
  transactions: CreditTransaction[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  transactions 
}) => {
  if (transactions.length === 0) {
    return (
      <Card variant="bordered">
        <CardContent className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No transactions yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Your credit transactions will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card variant="bordered">
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
          <p className="text-sm text-gray-600 mt-1">
            View your credit earning history
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-xs text-gray-500">
                        {formatTransactionType(transaction.type)}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(transaction.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span
                      className={`text-lg font-bold ${getTransactionTypeColor(
                        transaction.type
                      )}`}
                    >
                      {transaction.amount > 0 ? '+' : ''}
                      {transaction.amount}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};