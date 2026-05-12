-- Add ID number and additional fields to profiles table
ALTER TABLE profiles ADD COLUMN id_number TEXT;
ALTER TABLE profiles ADD COLUMN date_of_birth TEXT;
ALTER TABLE profiles ADD COLUMN address TEXT;
