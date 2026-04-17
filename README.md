# Recruitment Workflow

This project follows a role-based recruitment flow with separate permissions for administration and each recruitment stage.  
Candidates move through multiple rounds, and only authorized users can view, update, approve, or reject them at each stage.

## Modules

- Administration
- Recruitment
- Final Approval

## Access Control / Roles

The system uses role-based access control (RBAC) so different users can access different pages and actions.

### Common Roles
- **Super Admin**: Full access to all modules, roles, permissions, and recruitment stages.
- **HR Admin**: Can create users, manage candidate flow, and handle recruitment operations.
- **Recruiter / Panel User**: Can work on assigned recruitment rounds only.
- **Department Head / Reviewer**: Can review candidates in department-level approval.
- **Final Approver**: Can approve or reject candidates in the final round.
- **Viewer**: Read-only access.

## Page-wise Explanation

| Page | Purpose | Who can access | Main inputs/actions |
|---|---|---|---|
| Create User | Create internal employee login accounts and assign access. | Super Admin, HR Admin | Full Name, Employee ID, Role, Password |
| Roles & Permissions | Create roles and assign granular permissions to each role. | Super Admin, permission admin | Create role, assign permissions, update or delete non-system roles |
| New Candidate / Round 1 | Register a new candidate and send them to the next round. | HR Admin, Recruiter | Candidate details, photo, Aadhaar card, resume, skill level, department, work experience, contract details, next round selection |
| Round 2.1 – Test | Evaluate written/skill test candidates. | Test evaluator, HR, Recruiter | Search, filter, mark pass/fail, classify if needed |
| Round 2.2 – Interview | Evaluate candidates in the interview round. | Interview panel, HR, Recruiter | Search, filter, select candidates, mark pass/fail, dump/reject selected candidates |
| Round 3 – Department | Department-level review before final approval. | Department Head, PPC Head, authorized reviewer | Review candidate fit, approve/reject, add remarks |
| Final Approval | Final hiring decision and onboarding handoff. | Final approver only | Verify all previous stages, approve/reject, assign or confirm employee ID |

## Recruitment Flow

### Round 1 – Candidate Registration
In Round 1, the candidate’s basic details are entered.  
This usually includes:
- Full name
- Phone number
- Aadhaar number
- Qualification
- Candidate photo
- Aadhaar card photo
- Resume file
- Skill level
- Department
- Work experience
- Contract status

After submission, the candidate is moved to the next round:
- **Round 2.1** for written/skill test, or
- **Round 2.2** for interview panel

### Round 2.1 – Skill / Written Test
This page is used to review candidates who were assigned to the written or skill test track.  
The evaluator can:
- Search candidates
- Filter by classification status
- Check candidate details
- Mark the candidate as **Passed** or **Failed**

If a candidate is not properly classified, they can be failed, but they cannot be passed until classification is completed.

### Round 2.2 – Interview Panel
This page is used for candidates assigned to the interview track.  
The interviewer can:
- Search candidates by name or Aadhaar number
- Filter by department or skill
- Select one or more candidates
- Mark interview result as **Pass** or **Fail**
- Dump/reject selected candidates if required

Passed candidates are moved forward to the next stage.

### Round 3 – Department Review
This page is used by department-level reviewers to check whether the candidate is suitable for the department.  
At this stage, the reviewer can:
- Review candidate profile and previous round status
- Approve candidate for final approval
- Reject candidate if not suitable
- Add remarks if needed

### Final Approval
This is the final recruitment stage.  
Only a user with final-round access can approve or reject the candidate.

At this stage:
- All previous round decisions are reviewed
- Candidate eligibility is confirmed
- Employee ID may be assigned or confirmed
- Final approval is given for joining/onboarding

## Candidate Movement Between Rounds

1. Candidate is created in **Round 1**.
2. Candidate is sent to **Round 2.1 Test** or **Round 2.2 Interview**.
3. If the candidate passes, they move to **Round 3 Department**.
4. If approved by the department, they move to **Final Approval**.
5. If approved in the final round, the candidate is accepted and employee ID onboarding can begin.
6. If rejected at any stage, the candidate is removed from the active workflow and marked as rejected.

## Rejection Handling

Rejected candidates are usually not deleted permanently.  
Instead, they should be:
- Marked as rejected
- Removed from active candidate queues
- Stored with rejection reason
- Kept for audit or future reference

This helps maintain a proper recruitment history and avoids data loss.

## CRUD Behavior

### Create
- Add new candidate
- Add new user
- Add new role
- Add candidate classification and round details

### Read
- View candidate lists
- View role permissions
- View round-wise candidate status
- View approval history

### Update
- Edit candidate details
- Update classification
- Change candidate round status
- Modify role permissions
- Update final approval status

### Delete / Reject
- Soft-delete or reject candidates
- Remove selected candidates from active round queues
- Delete roles only if they are not system roles
- Keep audit history where needed

## Table Structure by Page

### New Candidate
Typical columns or details shown:
- Candidate name
- Phone
- Aadhaar number
- Qualification
- Department
- Skill level
- Work experience
- Contract status
- Next round
- Actions

### Round 2.1 Test
Typical columns:
- Candidate
- Phone
- Aadhaar
- Department
- Skill level
- Status
- Test result actions

### Round 2.2 Interview
Typical columns:
- Candidate
- Phone
- Aadhaar
- Department
- Skill
- Contractor
- Interview status
- Pass / Fail actions

### Round 3 Department
Typical columns:
- Candidate
- Department
- Skill
- Qualification
- Previous round status
- Department decision
- Remarks

### Final Approval
Typical columns:
- Candidate
- Department
- Previous approval status
- Employee ID
- Final decision
- Actions

## Summary

This recruitment system is designed to:
- Control access using roles and permissions
- Move candidates stage by stage
- Allow only authorized users to act at each step
- Track approvals, rejections, and final onboarding
- Maintain proper recruitment records for audit and reporting
- 
