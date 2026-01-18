# QA Checklist: RK Institute ERP

This checklist summarizes the verification steps for all core modules of the RK Institute ERP, primarily focusing on Chrome browser compatibility and responsive design.

## 1. Authentication & Security
- [x] **Login with Credentials**: Verify admin can log in with `admin@rkinstitute.com / admin123`.
- [ ] **Google Sign-In**: Verify Google login flow works for permitted domains. (Requires domain config)
- [x] **Middleware Redirection**: Ensure unverified users are redirected to `/verify`.
- [x] **Session Persistence**: Verify the user stays logged in after a page refresh.
- [x] **Logout Flow**: Confirm clicking "Sign Out" destroys the session and redirects to login.

## 2. Dashboard (Command Center)
- [x] **Metric Cards**: Check that Total Revenue, Active Students, and Pending Fees display correct data.
- [x] **Admissions Chart**: Verify the chart renders and accurately shows trends.
- [x] **Recent Activity**: Ensure latest actions (admissions, payments) appear in the side panel.
- [x] **Navigation Menu**: Verify all sidebar links navigate to the correct routes.
- [x] **Search Bar**: Confirm global search returns relevant family/student results.

## 3. Student Admission
- [x] **Guardian Form**: Verify all fields (Name, Phone, Profession) are required and validate correctly.
- [x] **Student Form**: Confirm "Add Another Student" functionality works correctly for families.
- [x] **Pro-Rata Calculator**: Test joining dates between 1st-31st to verify pro-rata logic.
- [x] **Fee Overrides**: Test overriding the standard monthly fee for a student.
- [x] **Submission**: Confirm successful admission creates a Family ID and Student profiles.

## 4. Student Management
- [x] **Students Table**: Verify columns (Name, Class, Father Name, Phone, Status) display correctly.
- [x] **Search/Filter**: Test searching by name/phone and filtering by class/status.
- [x] **Quick Pay**: Confirm clicking "Pay" opens the payment dialog with the correct student context.
- [x] **Profile Navigation**: Verify clicking a student name opens their profile page.

## 5. Billing & Fee Collection
- [x] **Collect Fee Search**: Verify searching for a family by name/phone returns correct results.
- [x] **Payment Modes**: Test both CASH and UPI payment flows.
- [x] **Transaction History**: Confirm recorded payments appear as 'CREDIT' in the ledger.
- [x] **Dues Report**: Verify aging buckets (0-30, 31-60, etc.) categorize arrears correctly.
- [x] **Export CSV**: Confirm the dues report can be exported for offline tracking.

## 6. Staff Management
- [x] **Staff Display**: Verify teacher/admin details appear with correct system roles.
- [x] **Add Staff**: Test the form with custom staff types (e.g., driver, bus attendant).
- [x] **Edit/Delete**: Confirm staff details can be updated and inactive staff removed.

## 7. Academics & Batches
- [x] **Batch Creation**: Verify scheduling and fee configuration for new batches.
- [x] **Student Enrollment**: Test enrolling students into batches with time-conflict checks.
- [x] **Time-Conflict Validation**: Confirm enrollment is rejected if there is a scheduling clash.

## 8. Attendance Management
- [x] **Mark Attendance**: Verify marking students present/absent for a specific batch/date.
- [x] **History Logs**: Check if attendance records are stored and visible in student profiles.

## 9. Responsive & Browser Testing
- [x] **Desktop (1920x1080)**: Full layout, no overflow, charts render correctly.
- [x] **Tablet (iPad Pro)**: Sidebar behavior, grid adjustments, touch interactions.
- [x] **Mobile (iPhone/Pixel)**: Hamburger menu, single-column table behavior, modal sizing.
- [x] **Chrome Engine**: Verify zero layout shift and consistent font rendering.

---
*Created by Antigravity AI Assistant*
