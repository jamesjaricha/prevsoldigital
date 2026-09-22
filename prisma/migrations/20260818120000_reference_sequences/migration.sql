-- Reference sequences.
--
-- References were previously derived from COUNT(*), which races: two
-- concurrent checkouts read the same count and mint the same reference.
-- Because a Paynow callback matches a payment by its reference, a duplicate
-- would let one payment settle a different order's invoice.
--
-- Sequences are atomic, so collisions are impossible. START WITH values
-- continue the original numbering, and setval below advances them past any
-- rows that already exist.

CREATE SEQUENCE IF NOT EXISTS order_reference_seq  START WITH 41001;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq   START WITH 1;
CREATE SEQUENCE IF NOT EXISTS ticket_reference_seq START WITH 4801;
CREATE SEQUENCE IF NOT EXISTS client_ref_seq       START WITH 10429;

-- Advance each sequence past existing data so the first generated value is
-- never one that is already taken.
SELECT setval('order_reference_seq',
  GREATEST(41001, COALESCE((SELECT MAX(NULLIF(regexp_replace(reference, '\D', '', 'g'), '')::bigint) FROM "Order"), 0) + 1), false);

SELECT setval('invoice_number_seq',
  GREATEST(1, COALESCE((SELECT COUNT(*) FROM "Invoice"), 0) + 1), false);

SELECT setval('ticket_reference_seq',
  GREATEST(4801, COALESCE((SELECT MAX(NULLIF(regexp_replace(reference, '\D', '', 'g'), '')::bigint) FROM "Ticket"), 0) + 1), false);

SELECT setval('client_ref_seq',
  GREATEST(10429, COALESCE((SELECT MAX(NULLIF(regexp_replace("clientRef", '\D', '', 'g'), '')::bigint) FROM "User"), 0) + 1), false);

-- A payment is looked up by gatewayRef in the Paynow callback. Enforcing
-- uniqueness makes a mismatched settlement impossible at the database level,
-- not merely unlikely.
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_gatewayRef_key" ON "Payment"("gatewayRef");
