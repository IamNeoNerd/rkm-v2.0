# Future Improvements: Staff Role Architecture

## Saved: 2026-01-18

### Context
When adding non-teaching staff (Cook, Sweeper, Peon, MTS), the system currently forces selection of a system role (ADMIN, TEACHER, RECEPTIONIST) even though these staff don't need system access. This creates misleading displays and potential permission issues.

### Recommendation for Later

1. **Make `role` nullable** for staff who never need login access
   - Many support staff are payroll-only entries
   - They shouldn't appear in auth-related queries

2. **Display `roleType` as primary identifier**
   - In the staff table, show the custom role type (Cook, Peon) instead of system role
   - Only show system role badge for users who actually have login access

3. **Separate auth table from staff table**
   - Consider treating auth users and staff records as separate entities
   - Link them when needed, but allow standalone payroll entries

4. **Role-based permissions matrix**
   - Create explicit permissions for each role
   - Example: TEACHER can mark attendance, STAFF cannot
   - Use middleware to enforce these at route level

### Implementation Priority: Low
This is a structural improvement that can wait until the core system is stable.
