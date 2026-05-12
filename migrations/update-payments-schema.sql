-- Update payments table with new fields for payment methods
ALTER TABLE payments ADD COLUMN payment_method TEXT; -- 'bank', 'mpesa', 'cash'
ALTER TABLE payments ADD COLUMN transaction_ref TEXT; -- M-Pesa code or bank reference
ALTER TABLE payments ADD COLUMN paid_date TEXT; -- Date payment was received
ALTER TABLE payments ADD COLUMN recorded_by TEXT; -- Admin who recorded the payment
ALTER TABLE payments ADD COLUMN notes TEXT; -- Additional notes
