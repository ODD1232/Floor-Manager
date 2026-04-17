Typical role examples from this design:

Super Admin: full access to all pages, all roles, and all recruitment actions.

HR Admin: can register candidates, create users, and manage most recruitment records if permission is granted.

PPC Head or department head: can review department-stage candidates and approve or reject based on business need.

Viewer: can open lists but should not create, update, reject, or approve records if only view permission is assigned.

Administration pages
Create User
The Create User page is used to create employee login accounts for internal staff, not for candidates, and it captures Full Name, Employee ID, Role, and Password. In CRUD terms, this page handles Create for system users, while edit, reset password, deactivate, or delete would typically be handled from a separate user management list even if that list is not shown in the screenshot.

Roles & Permissions
This page is used to create roles and assign permission sets to those roles, and the UI shows a role list on the left with a permission-management panel on the right. CRUD here would be Create role, Read role list, Update permissions for a selected role, and Delete role for non-system roles, while system roles like super_admin are usually protected from deletion or restricted from major edits.

Recruitment flow
Round 1: New Candidate
The New Candidate page is the first recruitment entry page where the operator registers a candidate and immediately decides whether the candidate goes to Round 2.1 Written/Skill Test or Round 2.2 Interview Panel. The page explicitly shows that after submission the candidate will enter Round 2, and it also warns that an unclassified candidate will not reach Round 3 until classification is filled.

Data captured from the user on this page:

Full Name

Phone Number

Aadhaar Number

Qualification

Candidate Photo upload

Aadhaar Card Photo upload

Resume upload, PDF or image

Skill Level classification

Department classification

Prior work experience toggle

Contract status toggle, whether candidate was or is on contract

Next round selection: Round 2.1 or Round 2.2

Probable CRUD behavior for this page:

Create: add new candidate profile and send to selected Round 2 queue.

Read: view entered details before save or later in candidate profile screens inferred from the flow.

Update: correct missing classification, contact details, uploads, or qualification before the next stage, especially because classification affects Round 3 eligibility.

Delete/Dump: not usually hard delete in recruitment; more likely mark as rejected, duplicate, or invalid rather than permanently delete, based on the workflow style shown in other pages.

Round 2.1: Skill / Written Test
This page is for candidates whose next round was selected as Written/Skill Test, and the evaluator marks each candidate as passed or failed after the test. From your earlier code context, if a candidate is not classified, they can fail but cannot be passed until skill level and department are filled, which matches the warning behavior shown on the New Candidate page.

Likely list/table structure for Round 2 Test:

Candidate name and profile photo/avatar.

Phone number.

Aadhaar number.

Department.

Skill level.

Current round status.

Test result action buttons such as Pass or Fail.

Likely page behavior:

Search by name or Aadhaar.

Small filter for classified/unclassified candidates.

Pass candidate to next stage.

Fail candidate and stop progression.

Open inline classification modal if required before pass.

Round 2.2: Interview Panel
This page is for candidates routed directly to interview instead of written/skill test, and interviewers review the pending list and mark candidates as passed or failed. Based on your code context, selected candidates can be moved forward in bulk or dumped/rejected in bulk after interview result selection.

Likely columns in the interview list:

Checkbox for selection.

Candidate profile and qualification.

Phone.

Aadhaar.

Department.

Skill.

Contractor.

Interview result selector.

Likely page behavior:

Search by name or Aadhaar.

Department and skill filters.

Bulk select.

Set pass/fail per candidate.

Move passed candidates to Round 3.

Dump selected rejected candidates.

Round 3: Department
This page is likely the department review or business approval round where a department owner, PPC head, or authorized reviewer checks whether the passed candidate should actually be taken for final hiring. This is usually the point where job fit, manpower need, location, contractor linkage, and internal acceptance are verified before final approval.

Likely columns in this list:

Candidate.

Department.

Skill level.

Previous round result.

Experience/contract info.

Contractor.

Department decision.

Remarks.

Likely actions:

Approve to final round.

Send back for correction or hold.

Reject from department stage.

Possibly assign or confirm department-specific metadata.

Final Approval
The Final Approval page is the last decision stage, accessible only to users who have final approval permission, and this is where the candidate is officially accepted into the hiring pipeline. In your described workflow, this is also the stage where the candidate would be approved by the authorized user and then assigned an employee ID or moved into employee onboarding, depending on whether employee ID generation happens before or after final confirmation.

Typical final approval actions:

Verify all candidate details and document completeness.

Check that Round 2 and Round 3 approvals are complete.

Approve candidate for joining/onboarding.

Reject candidate with final reason.

Generate or confirm employee ID.

Convert candidate record into employee/user account flow if required.

Candidate movement
A clean end-to-end movement based on the screens would be:

Candidate is created in New Candidate / Round 1 with personal details, uploads, classification, and next-round selection.

If Written/Skill Test is chosen, the candidate goes to Round 2.1 Test queue; if Interview Panel is chosen, the candidate goes to Round 2.2 Interview queue.

In Round 2.1 or 2.2, the candidate is marked passed or failed by an authorized user for that round.

Passed candidates move to Round 3 Department for department-level review; failed candidates are rejected and should no longer appear in active pending queues.

Round 3 approved candidates move to Final Approval, where only authorized final approvers can accept or reject them.

After final approval, the candidate is treated as selected, and the system can assign or confirm an employee ID, then continue with account creation or onboarding actions.

Rejection handling
After a user is rejected, the best workflow for this system is soft rejection rather than deletion, so the candidate record remains searchable with a rejection reason, rejection stage, rejected-by user, and rejected timestamp for audit purposes, which is consistent with structured recruitment systems and the staged workflow shown here. Rejected candidates should disappear from active round queues, move to a rejected/dumped list, and remain read-only except for authorized restore or remark updates if your business process allows reconsideration.

Recommended rejection data to store:

Candidate ID.

Rejection stage, such as Round 2.1, Round 2.2, Round 3, or Final Approval.

Rejection reason.

Rejected by user.

Rejected date/time.

Optional remarks.

Optional restore status.

How lists should look
Across all recruitment pages, the list design should stay consistent so users can work faster, with search at top, compact corner filters, and a table containing the most important operational columns for that stage, which matches the pattern visible in your UI and screenshots. Common reusable columns are Candidate, Phone, Aadhaar, Qualification, Department, Skill Level, Status, Assigned Contractor, and Actions, while stage-specific columns can add Test Result, Interview Result, Department Decision, or Final Approval Status.

A practical per-page table setup would be:

New Candidate: Candidate, Phone, Aadhaar, Qualification, Department, Skill, Next Round, Created By, Actions.

Round 2 Test: Candidate, Phone, Aadhaar, Department, Skill Level, Round 2.1 Status, Test Result Actions.

Round 2 Interview: Candidate, Phone, Aadhaar, Department, Skill, Contractor, Round 2.2 Status, Interview Action.

Round 3 Department: Candidate, Department, Skill, Experience, Contract, Previous Result, Department Decision, Remarks.

Final Approval: Candidate, Department, Skill, All Prior Statuses, Documents Complete, Employee ID, Final Decision, Actions.
