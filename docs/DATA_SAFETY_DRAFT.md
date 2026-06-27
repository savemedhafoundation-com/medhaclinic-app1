# Google Play Data Safety Draft

Use this draft as the Play Console source of truth after verifying production behavior.

## Data Collected

- Personal info: name, email, phone number, delivery address.
- Health and fitness: wellness check-in answers, lifestyle scores, wellness summaries, diet preferences, uploaded wellness records.
- Photos/files: profile photo and optional wellness record images/files.
- Location: approximate/precise location only when the user taps address autofill.
- Financial/payment metadata: order totals, Razorpay order/payment identifiers, coupon/order status. Do not declare card numbers unless stored directly, which the app should not do.
- App activity: app interactions, accepted wellness plans, reminder settings, cart/order activity.
- Device or other IDs: Firebase/Auth IDs, notification IDs, app/device identifiers needed for authentication and service delivery.
- AI metadata: submitted wellness prompts/context and generated summaries/plans when AI-assisted features are enabled.

## Data Shared

- Firebase/Google: authentication, storage, app infrastructure, device/auth identifiers.
- Razorpay: payment/order metadata required to process payments.
- OpenAI/backend AI provider: AI prompt/context and output metadata when AI-assisted generation is enabled.
- Hosting/database providers: backend storage and service operations.
- Delivery/support providers: order fulfillment and support where applicable.

## Security And Deletion

- Data is encrypted in transit over HTTPS.
- Users can request and perform account deletion in app.
- Public deletion page: `/account-deletion.html`.
- Some transaction records may be retained only when legally required.

## Required Play Console Notes

- Health and fitness data is collected for app functionality.
- Location is optional and user-initiated.
- Notifications are optional wellness reminders.
- AI content is general wellness support, not medical advice.
