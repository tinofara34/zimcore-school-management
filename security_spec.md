# Zimcore Security Specification

## 1. Data Invariants
1. **School Data Isolation**: All operational subcollections (`students`, `payments`, `expenses`, `classes`, `fee_structures`, `notifications`, `audit_logs`) reside under `/schools/{schoolId}`. Users may only access a school if their verified record in `/users/{userId}` has `schoolId == schoolId`.
2. **Role Boundaries**:
   - **School Owner**: Full read/write authority over their own school, school settings, fee structures, classes, bursar invites, student records, payments, expenses, and audit logs.
   - **Bursar**: Day-to-day administrative authority. May create and read students, record payments, record expenses, read fee structures, read classes, read notifications, and write audit logs. CANNOT alter school owner profile, subscription settings, school master configuration, delete financial transactions, or elevate their role.
3. **Immutability & Integrity**:
   - Audit logs are append-only; no updates or deletions are permitted.
   - Financial transactions (payments and expenses) cannot be deleted. Any adjustment must be an auditable reversal with a documented reason.
   - Payment and expense amounts must be strictly greater than 0.
4. **Identity & User Profile Protection**:
   - Users cannot alter their own `role` or `schoolId`.
   - Only the school owner can invite or link a bursar to their school.

## 2. The "Dirty Dozen" Threat Payloads
1. **Bursar Self-Promotion**: Bursar sends `update` to `/users/{bursarUid}` with `{ role: "owner" }` -> REJECT.
2. **Cross-School Breach**: User belonging to School 1 sends `get` or `list` query to `/schools/school2/students` -> REJECT.
3. **Unauthenticated Query**: Anonymous or unauthenticated actor requests `/schools/school1/payments` -> REJECT.
4. **Negative Payment**: User records payment with `{ amount: -500 }` -> REJECT.
5. **Zero Amount Expense**: User records expense with `{ amount: 0 }` -> REJECT.
6. **Hard Deletion of Financial Record**: Bursar sends `delete` to `/schools/school1/payments/{paymentId}` -> REJECT.
7. **Audit Log Tampering**: User sends `update` or `delete` to `/schools/school1/audit_logs/{logId}` -> REJECT.
8. **Malicious Oversized Field**: Attacker sends a student record with `notes` exceeding 2000 characters -> REJECT.
9. **School Settings Hijack**: Bursar updates `/schools/{schoolId}` setting `ownerId: attackerUid` -> REJECT.
10. **Orphaned Student Write**: User creates a student with an invalid `status` string like `"expelled_without_record"` -> REJECT.
11. **Bursar Altering Paid Receipt**: Bursar attempts to modify the `amount` of an already recorded payment -> REJECT.
12. **Ghost School Creation**: Unauthenticated user attempts to write to `/schools/{schoolId}` -> REJECT.
