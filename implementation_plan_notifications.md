# implementation_plan_notifications.md

## Objective
Make the Notifications system fully functional with backend integration, real-time updates, and email delivery for critical alerts. Authenticated users must have valid email providers.

## 1. Backend Schema (Convex)
- Update `convex/schema.ts` to include a `notifications` table.
- Structure:
  ```typescript
  notifications: defineTable({
      userId: v.optional(v.string()), // Linked to User
      title: v.optional(v.any()), // e.g. "Orçamento Excedido"
      message: v.optional(v.any()), // e.g. "Você gastou 100%..."
      type: v.optional(v.any()), // 'info' | 'warning' | 'success' | 'error'
      read: v.optional(v.boolean()), // true/false
      createdAt: v.optional(v.string()),
      isImportant: v.optional(v.boolean()), // Triggers email
  }).index("by_user", ["userId"]),
  ```
  *(Note: Using permissive types `v.any()` to maintain compatibility with current dev mode)*

## 2. Authentication & Email Validation
- Modify `convex/auth.ts` -> `register` mutation.
- Implement strict domain validation.
- **Allowed:** Gmail, Hotmail, Outlook, Live, Yahoo, iCloud, and custom enterprise domains.
- **Blocked:** `example.com`, `test.com`, `admin.com`, `localhost`, `tempmail.com`, and other disposable providers.

## 3. Backend Logic (Notifications)
- Create `convex/notifications.ts`.
- **Queries:**
    - `list(userId)`: Fetch unread and recent read notifications.
    - `countUnread(userId)`: For the sidebar badge (optional).
- **Mutations:**
    - `markAsRead(id)`: Update status.
    - `markAllAsRead(userId)`: Bulk update.
    - `create(userId, title, message, type, isImportant)`: Internal helper.
    - `clearAll(userId)`: Delete all.

## 4. Email System (Convex Action)
- Create `convex/actions/email.ts`.
- Integrate `Resend` (or simulated logger if no key provided).
- Logic: When `notifications.create` is called with `isImportant: true`, triggers `email.send`.
- Templates: Simple HTML template for system alerts.

## 5. Triggers & Automation
- **Budget Monitor:** Update `convex/transactions.ts` (`create` mutation) to check `budgetLimits` after insertion. If `spending > limit`, trigger Notification (Warning + Important).
- **Scheduled Jobs (Optional):** Setup Convex Crons to check `debts` due dates daily.

## 6. Frontend Implementation
- Refactor `app/(main)/notifications/page.tsx`.
- Replace mock data with `useQuery(api.notifications.list)`.
- Implement interactive "Mark as Read" buttons.
- Show "New" indicator dynamically.
- Empty state handling.

## Execution
Ready to execute immediately upon approval.
