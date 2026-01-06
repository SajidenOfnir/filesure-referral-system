'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { generateReferralUrl, copyToClipboard } from '@/lib/utils';

interface ReferralLinkProps {
  referralCode: string;
}

export const ReferralLink: React.FC<ReferralLinkProps> = ({ referralCode }) => {
  const [copied, setCopied] = useState(false);
  const referralUrl = generateReferralUrl(referralCode);

  const handleCopy = async () => {
    const success = await copyToClipboard(referralUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card variant="elevated" className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-900">Your Referral Link</h2>
          <p className="text-sm text-gray-600 mt-1">
            Share this link to earn credits when your referrals make their first purchase
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3">
              <p className="text-sm text-gray-700 truncate">{referralUrl}</p>
            </div>
            <Button
              onClick={handleCopy}
              variant={copied ? 'secondary' : 'primary'}
              size="md"
            >
              {copied ? (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
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
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy
                </>
              )}
            </Button>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Your Referral Code</p>
            <p className="text-2xl font-bold text-blue-600">{referralCode}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};