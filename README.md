# FoodLogin – Project Status

## 🚀 What's Working

- **User Authentication:** Sign up, login, and session management with NextAuth.js.
- **User Profile:** Update name, address, and phone number.
- **Menu Browsing:** All users can view available menu items.
- **Cart:** Add, update, and remove items; view cart contents.
- **Checkout:** Secure checkout flow with Razorpay (test mode, no real money).
- **Order Placement:** Orders include address and phone; cart is cleared after order.
- **Order Management:** Users can view their orders; admins can view and update all orders.
- **Admin Dashboard:** Manage menu (add, edit, delete items), view and filter orders.
- **Route Protection:** User and admin pages are protected based on role.
- **Responsive Design:** Basic mobile and desktop support.
- **Validation:** Zod is used for robust API input validation.
- **Order Confirmation Page:** Show a clear confirmation after successful checkout.

---

## 🛠️ What's Planned / To Improve

- **Order History:** Dedicated page for users to view past orders.
- **UI/UX Polish:** Toast notifications, improved mobile support, and better visuals.
- **Image Upload:** Allow admins to upload images for menu items (currently uses URLs).
- **Pagination:** For orders and menu if data grows large.
- **Admin Analytics:** Show stats like total orders, revenue, etc.
- **Notifications:** Email/SMS or in-app notifications for order status updates.
- **Production Readiness:** Remove any temporary build ignores, fix all ESLint/type errors, and ensure all environment variables are set before going live.
- **Comprehensive Testing:** Add more unit and integration tests.
- **Documentation:** Expand usage and contribution docs for new developers/testers.

---

## 📝 How to Help or Test

- Try signing up, browsing the menu, adding to cart, and placing an order.
- If you're an admin, test menu management and order status updates.
- Report any bugs, confusing flows, or suggestions for improvement!

---

**Note:**  
Razorpay is in test mode (no real money is charged).  
MongoDB Atlas free tier is used for the database.